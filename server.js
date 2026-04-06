const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const { Octokit } = require('@octokit/rest');

const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit();

const GITHUB_OWNER = 'ArcherGroup';
const GITHUB_REPO = 'archer-agents';
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchFile(path) {
  try {
    const r = await octokit.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path });
    return Buffer.from(r.data.content, 'base64').toString('utf-8');
  } catch { return null; }
}

async function loadAgentConfig(agentId) {
  const cached = configCache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.config;
  const sharedFiles = ['ARCHER','PRODUCTS','TONE_OF_VOICE','TEAM','KPIS','PROCESSES','TOOLS','HUBSPOT'];
  const agentFiles = ['CLAUDE','SKILL','TASK'];
  const [sharedContent, agentContent] = await Promise.all([
    Promise.all(sharedFiles.map(f => fetchFile(`shared/${f}.md`))),
    Promise.all(agentFiles.map(f => fetchFile(`agents/${agentId}/${f}.md`)))
  ]);
  const systemPrompt = [
    '# ARCHER KENNISBANK',
    ...sharedContent.filter(Boolean),
    `# ${agentId.toUpperCase()} AGENT CONFIGURATIE`,
    ...agentContent.filter(Boolean)
  ].join('\n\n---\n\n');
  configCache.set(agentId, { config: systemPrompt, timestamp: Date.now() });
  return systemPrompt;
}

// Agents die HubSpot MCP nodig hebben
const HUBSPOT_AGENTS = ['coo','sales-manager','hubspot','sales-trainer','ceo'];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'online',
      service: 'Archer Agent Server',
      version: '5.0.0',
      datasources: ['GitHub kennisbank', 'HubSpot MCP (live)']
    }));
  }

  if (req.method === 'POST' && url.pathname === '/history') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { userId, agentId } = JSON.parse(body);
        const { data: session } = await supabase
          .from('sessions').select('id')
          .eq('user_id', userId).eq('agent_id', agentId)
          .order('last_message_at', { ascending: false })
          .limit(1).single();
        if (!session) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ messages: [], sessionId: null }));
        }
        const { data: messages } = await supabase
          .from('messages').select('role, content')
          .eq('session_id', session.id)
          .order('created_at', { ascending: true }).limit(50);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ messages: messages || [], sessionId: session.id }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { agentId, message, sessionId, userId } = JSON.parse(body);
        if (!agentId || !message || !userId) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'agentId, message en userId zijn verplicht' }));
        }

        const systemPrompt = await loadAgentConfig(agentId);

        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const { data: newSession } = await supabase
            .from('sessions').insert({ user_id: userId, agent_id: agentId })
            .select('id').single();
          currentSessionId = newSession.id;
        }

        const { data: history } = await supabase
          .from('messages').select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true }).limit(50);

        await supabase.from('messages').insert({
          session_id: currentSessionId, role: 'user', content: message
        });

        // Bouw de API call op — met of zonder HubSpot MCP
        const apiParams = {
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            ...(history || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
          ]
        };

        // Voeg HubSpot MCP toe voor relevante agents
        if (HUBSPOT_AGENTS.includes(agentId) && process.env.HUBSPOT_TOKEN) {
          apiParams.mcp_servers = [{
            type: 'url',
            url: 'https://mcp.hubspot.com/anthropic',
            name: 'hubspot',
            authorization_token: process.env.HUBSPOT_TOKEN
          }];
        }

        // Gebruik beta header voor MCP
        const requestOptions = HUBSPOT_AGENTS.includes(agentId)
          ? { headers: { 'anthropic-beta': 'mcp-client-2025-04-04' } }
          : {};

        const response = await anthropic.messages.create(apiParams, requestOptions);

        // Verwerk antwoord — ook als er tool calls tussen zitten
        const textBlocks = response.content.filter(b => b.type === 'text');
        const reply = textBlocks.map(b => b.text).join('\n') || 'Geen antwoord ontvangen.';

        await supabase.from('messages').insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: reply,
          tokens_used: response.usage?.output_tokens || 0
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply, sessionId: currentSessionId }));

      } catch (err) {
        console.error('Chat error:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Niet gevonden' }));
});

server.listen(PORT, () => {
  console.log(`Archer Agent Server v5.0 draait op poort ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`HubSpot MCP: ${process.env.HUBSPOT_TOKEN ? 'actief' : 'NIET geconfigureerd'}`);
});
