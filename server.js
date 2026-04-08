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
const MAX_TOOL_ROUNDS = 5;

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
    ...agentContent.filter(Boolean),
    '',
    '# DATA TOEGANG',
    'Je hebt toegang tot live Archer data via tools. Gebruik ALTIJD de tools om data op te halen — verzin NOOIT cijfers.',
    'Beschikbare databronnen:',
    '- hs_deals: alle HubSpot deals (4.600+) met pipeline, stage, mentor, bedragen, datums',
    '- mentors: mentorprofielen met capaciteit en targets',
    '- transcripts: 1.000+ call transcripts met duur, type, contact',
    '- feedback: AI-analyse van calls met scores, action items, verbeterpunten',
    '- scores: individuele scores per criterium per call (406 records)',
    '- mentor_reports: wekelijkse mentor rapporten',
    '- clients: client dossiers',
    '- client_insights: client inzichten',
    '- dossier_snapshots: dossier snapshots',
  ].join('\n\n---\n\n');
  configCache.set(agentId, { config: systemPrompt, timestamp: Date.now() });
  return systemPrompt;
}

// ── Tool definitions ────────────────────────────────────────

const TOOLS = [
  {
    name: 'query_deals',
    description: 'Query HubSpot deals uit de Supabase database. Gebruik voor pipeline analyse, omzet, mentor performance, etc. Resultaat is gelimiteerd tot 100 rows — gebruik filters om te focussen.',
    input_schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', description: 'Kommagescheiden kolommen. Beschikbaar: id, dealname, pipeline_id, stage_id, owner_id, amount, category, closedate, last_modified, createdate, membership_subscription, product_type, entered_stage_at, start_date, end_date, renewal_deadline' },
        filters: { type: 'string', description: 'Supabase PostgREST filters. Bijv: owner_id=eq.414511835, category=eq.OP_DE_REKENING, closedate=gte.2026-01-01. Combineer met &.' },
        limit: { type: 'number', description: 'Max rows (standaard 50, max 100)' },
      },
      required: ['columns'],
    },
  },
  {
    name: 'query_mentors',
    description: 'Haal mentor/team informatie op. Bevat: name, hubspot_owner_id, is_active, max_capacity, email.',
    input_schema: {
      type: 'object',
      properties: {
        filters: { type: 'string', description: 'Optionele filters. Bijv: is_active=eq.true' },
      },
    },
  },
  {
    name: 'query_transcripts',
    description: 'Query call transcripts. Bevat: mentor_id, filename, conversation_type, call_type, call_date, duration_minutes, contact_name, status. NIET de volledige transcript_text (te groot) — gebruik query_transcript_detail voor één specifieke call.',
    input_schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', description: 'Kolommen. Standaard: id,mentor_id,call_type,call_date,duration_minutes,contact_name,status. Voeg NIET transcript_text toe tenzij je 1 specifieke call wilt.' },
        filters: { type: 'string', description: 'PostgREST filters. Bijv: mentor_id=eq.UUID, call_type=eq.sales' },
        limit: { type: 'number', description: 'Max rows (standaard 20, max 50)' },
      },
      required: ['columns'],
    },
  },
  {
    name: 'query_feedback',
    description: 'Query AI-analyses van calls. Bevat: transcript_id, mentor_id, total_score (0-100), summary, action_items, improvement_areas, sentiment, key_topics, coaching_highlights, client_engagement_score.',
    input_schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', description: 'Kolommen om op te halen' },
        filters: { type: 'string', description: 'PostgREST filters. Bijv: mentor_id=eq.UUID, total_score=gte.70' },
        limit: { type: 'number', description: 'Max rows (standaard 20, max 50)' },
      },
      required: ['columns'],
    },
  },
  {
    name: 'query_scores',
    description: 'Query individuele scores per criterium per call. Bevat: feedback_id, mentor_id, criterion, score (1-10), remark.',
    input_schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', description: 'Kolommen' },
        filters: { type: 'string', description: 'PostgREST filters. Bijv: mentor_id=eq.UUID, criterion=eq.bezwaarafhandeling' },
        limit: { type: 'number', description: 'Max rows (standaard 50, max 100)' },
      },
      required: ['columns'],
    },
  },
  {
    name: 'query_mentor_reports',
    description: 'Query wekelijkse mentor rapporten. Bevat: mentor_id, mentor_name, report_type, week_start, week_end, summary_markdown, raw_data.',
    input_schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', description: 'Kolommen' },
        filters: { type: 'string', description: 'PostgREST filters. Bijv: mentor_name=eq.Jietse' },
        limit: { type: 'number', description: 'Max rows (standaard 10)' },
      },
      required: ['columns'],
    },
  },
  {
    name: 'query_clients',
    description: 'Query client dossiers. Bevat client informatie en coaching data.',
    input_schema: {
      type: 'object',
      properties: {
        columns: { type: 'string', description: 'Kolommen' },
        filters: { type: 'string', description: 'PostgREST filters' },
        limit: { type: 'number', description: 'Max rows (standaard 20)' },
      },
      required: ['columns'],
    },
  },
  {
    name: 'run_sql',
    description: 'Voer een read-only SQL query uit voor complexe analyses (aggregaties, joins, group by). Gebruik dit als de andere tools niet genoeg zijn. ALLEEN SELECT queries — geen INSERT/UPDATE/DELETE.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'SQL SELECT query. Bijv: SELECT owner_id, count(*), sum(amount::numeric) FROM hs_deals WHERE category = \'OP_DE_REKENING\' GROUP BY owner_id' },
      },
      required: ['query'],
    },
  },
];

// ── Tool execution ──────────────────────────────────────────

const TABLE_MAP = {
  query_deals: 'hs_deals',
  query_mentors: 'mentors',
  query_transcripts: 'transcripts',
  query_feedback: 'feedback',
  query_scores: 'scores',
  query_mentor_reports: 'mentor_reports',
  query_clients: 'clients',
};

const DEFAULT_LIMITS = {
  query_deals: 50,
  query_mentors: 50,
  query_transcripts: 20,
  query_feedback: 20,
  query_scores: 50,
  query_mentor_reports: 10,
  query_clients: 20,
};

const MAX_LIMITS = {
  query_deals: 100,
  query_mentors: 50,
  query_transcripts: 50,
  query_feedback: 50,
  query_scores: 100,
  query_mentor_reports: 20,
  query_clients: 50,
};

async function executeTool(toolName, input) {
  try {
    // SQL tool
    if (toolName === 'run_sql') {
      const q = (input.query || '').trim();
      if (!q.toLowerCase().startsWith('select')) {
        return JSON.stringify({ error: 'Alleen SELECT queries zijn toegestaan' });
      }
      const { data, error } = await supabase.rpc('exec_sql', { query: q }).single();
      if (error) {
        const res = await fetch(`${process.env.SUPABASE_URL}/rest/v1/rpc`, {
          method: 'POST',
          headers: {
            'apikey': process.env.SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: q }),
        });
        if (!res.ok) return JSON.stringify({ error: `SQL fout: ${error.message}. Gebruik de specifieke query tools in plaats van run_sql.` });
        return JSON.stringify(await res.json());
      }
      return JSON.stringify(data);
    }

    // Table query tools
    const table = TABLE_MAP[toolName];
    if (!table) return JSON.stringify({ error: `Onbekende tool: ${toolName}` });

    const columns = input.columns || '*';
    const limit = Math.min(input.limit || DEFAULT_LIMITS[toolName], MAX_LIMITS[toolName]);

    let query = supabase.from(table).select(columns).limit(limit);

    // Parse and apply filters
    if (input.filters) {
      const parts = input.filters.split('&');
      for (const part of parts) {
        const match = part.match(/^([^=]+)=([^.]+)\.(.+)$/);
        if (!match) continue;
        const [, col, op, val] = match;
        switch (op) {
          case 'eq': query = query.eq(col, val); break;
          case 'neq': query = query.neq(col, val); break;
          case 'gt': query = query.gt(col, val); break;
          case 'gte': query = query.gte(col, val); break;
          case 'lt': query = query.lt(col, val); break;
          case 'lte': query = query.lte(col, val); break;
          case 'like': query = query.like(col, val); break;
          case 'ilike': query = query.ilike(col, val); break;
          case 'is': query = query.is(col, val === 'null' ? null : val); break;
          case 'in': query = query.in(col, val.replace(/[()]/g, '').split(',')); break;
        }
      }
    }

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ count: data.length, data });

  } catch (err) {
    return JSON.stringify({ error: err.message });
  }
}

// ── Server ──────────────────────────────────────────────────

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
      version: '6.0.0',
      datasources: ['GitHub kennisbank', 'Supabase (deals, transcripts, scores, feedback, mentors, reports)', 'Tool use enabled'],
      tools: TOOLS.map(t => t.name),
    }));
  }

  if (req.method === 'POST' && url.pathname === '/history') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { userId, agentId } = JSON.parse(body);
        const { data: session } = await supabase
          .from('agent_sessions').select('id')
          .eq('user_id', userId).eq('agent_id', agentId)
          .order('last_message_at', { ascending: false })
          .limit(1).single();
        if (!session) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ messages: [], sessionId: null }));
        }
        const { data: messages } = await supabase
          .from('agent_messages').select('role, content')
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
            .from('agent_sessions').insert({ user_id: userId, agent_id: agentId })
            .select('id').single();
          currentSessionId = newSession.id;
        }

        const { data: history } = await supabase
          .from('agent_messages').select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true }).limit(50);

        await supabase.from('agent_messages').insert({
          session_id: currentSessionId, role: 'user', content: message
        });

        // Build messages array
        const messages = [
          ...(history || []).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: message }
        ];

        // Tool use loop — keep calling Claude until we get a final text response
        let response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 4096,
          system: systemPrompt,
          tools: TOOLS,
          messages,
        });

        let rounds = 0;
        while (response.stop_reason === 'tool_use' && rounds < MAX_TOOL_ROUNDS) {
          rounds++;
          const toolUseBlocks = response.content.filter(b => b.type === 'tool_use');
          const toolResults = [];

          for (const toolBlock of toolUseBlocks) {
            console.log(`[Tool] ${toolBlock.name}(${JSON.stringify(toolBlock.input).slice(0, 200)})`);
            const result = await executeTool(toolBlock.name, toolBlock.input);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolBlock.id,
              content: result,
            });
          }

          // Continue conversation with tool results
          messages.push({ role: 'assistant', content: response.content });
          messages.push({ role: 'user', content: toolResults });

          response = await anthropic.messages.create({
            model: 'claude-sonnet-4-5',
            max_tokens: 4096,
            system: systemPrompt,
            tools: TOOLS,
            messages,
          });
        }

        // Extract final text response
        const textBlocks = response.content.filter(b => b.type === 'text');
        const reply = textBlocks.map(b => b.text).join('\n') || 'Geen antwoord ontvangen.';

        await supabase.from('agent_messages').insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: reply,
          tokens_used: response.usage?.output_tokens || 0
        });

        await supabase.from('agent_sessions').update({ last_message_at: new Date().toISOString() }).eq('id', currentSessionId);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ reply, sessionId: currentSessionId, toolsUsed: rounds }));

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
  console.log(`Archer Agent Server v6.0 draait op poort ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`Tools: ${TOOLS.length} tools beschikbaar`);
  console.log(`Tabellen: ${Object.values(TABLE_MAP).join(', ')}`);
});
