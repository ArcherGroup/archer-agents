const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const { Octokit } = require('@octokit/rest');

const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Geen token nodig — repo is publiek
const octokit = new Octokit();

const GITHUB_OWNER = 'ArcherGroup';
const GITHUB_REPO = 'archer-agents';
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchFile(path) {
  try {
    const response = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path,
    });
    return Buffer.from(response.data.content, 'base64').toString('utf-8');
  } catch (err) {
    console.log(`Bestand niet gevonden: ${path}`);
    return null;
  }
}

async function loadAgentConfig(agentId) {
  const cached = configCache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.config;
  }

  console.log(`Config laden voor agent: ${agentId}`);
  const sharedFiles = ['ARCHER', 'PRODUCTS', 'TONE_OF_VOICE', 'TEAM', 'KPIS', 'PROCESSES', 'TOOLS'];
  const agentFiles = ['CLAUDE', 'SKILL', 'TASK'];

  const sharedContent = await Promise.all(
    sharedFiles.map(f => fetchFile(`shared/${f}.md`))
  );

  const agentContent = await Promise.all(
    agentFiles.map(f => fetchFile(`agents/${agentId}/${f}.md`))
  );

  const loaded = sharedContent.filter(Boolean).length + agentContent.filter(Boolean).length;
  console.log(`${loaded} bestanden geladen voor ${agentId}`);

  const systemPrompt = [
    '# ARCHER KENNISBANK',
    ...sharedContent.filter(Boolean),
    `# ${agentId.toUpperCase()} AGENT CONFIGURATIE`,
    ...agentContent.filter(Boolean)
  ].join('\n\n---\n\n');

  configCache.set(agentId, { config: systemPrompt, timestamp: Date.now() });
  return systemPrompt;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'online',
      service: 'Archer Agent Server',
      version: '2.0.0',
      agents: ['coo', 'ceo', 'sales-manager', 'sales-trainer',
               'hubspot', 'copywriting', 'content-social', 'dev-assistent']
    }));
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
            .from('sessions')
            .insert({ user_id: userId, agent_id: agentId })
            .select('id')
            .single();
          currentSessionId = newSession.id;
        }

        const { data: history } = await supabase
          .from('messages')
          .select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true })
          .limit(50);

        await supabase.from('messages').insert({
          session_id: currentSessionId,
          role: 'user',
          content: message
        });

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            ...(history || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
          ]
        });

        const reply = response.content[0].text;

        await supabase.from('messages').insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: reply,
          tokens_used: response.usage.output_tokens
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply, sessionId: currentSessionId }));

      } catch (err) {
        console.error('Chat error:', err);
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
  console.log(`Archer Agent Server v2.0 draait op poort ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`GitHub: publieke repo — geen token nodig`);
});
