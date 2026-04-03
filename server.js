const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const { Octokit } = require('@octokit/rest');
const hubspot = require('@hubspot/api-client');

const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit();
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_TOKEN });

const GITHUB_OWNER = 'ArcherGroup';
const GITHUB_REPO = 'archer-agents';
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

async function fetchFile(path) {
  try {
    const response = await octokit.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path });
    return Buffer.from(response.data.content, 'base64').toString('utf-8');
  } catch (err) {
    console.log(`Bestand niet gevonden: ${path}`);
    return null;
  }
}

async function loadAgentConfig(agentId) {
  const cached = configCache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.config;
  console.log(`Config laden voor agent: ${agentId}`);
  const sharedFiles = ['ARCHER', 'PRODUCTS', 'TONE_OF_VOICE', 'TEAM', 'KPIS', 'PROCESSES', 'TOOLS'];
  const agentFiles = ['CLAUDE', 'SKILL', 'TASK'];
  const sharedContent = await Promise.all(sharedFiles.map(f => fetchFile(`shared/${f}.md`)));
  const agentContent = await Promise.all(agentFiles.map(f => fetchFile(`agents/${agentId}/${f}.md`)));
  const loaded = sharedContent.filter(Boolean).length + agentContent.filter(Boolean).length;
  console.log(`${loaded} bestanden geladen voor ${agentId}`);
  const systemPrompt = ['# ARCHER KENNISBANK', ...sharedContent.filter(Boolean), `# ${agentId.toUpperCase()} AGENT CONFIGURATIE`, ...agentContent.filter(Boolean)].join('\n\n---\n\n');
  configCache.set(agentId, { config: systemPrompt, timestamp: Date.now() });
  return systemPrompt;
}

async function getHubSpotContext(agentId) {
  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    const [dealsRes, contactsRes] = await Promise.all([
      hubspotClient.crm.deals.searchApi.doSearch({
        filterGroups: [{ filters: [{ propertyName: 'dealstage', operator: 'NOT_IN', values: ['63137245','2803756224','4839600317','63247585'] }] }],
        properties: ['dealname', 'amount', 'dealstage', 'hubspot_owner_id', 'closedate', 'hs_lastmodifieddate'],
        limit: 50, sorts: [{ propertyName: 'hs_lastmodifieddate', direction: 'DESCENDING' }]
      }),
      hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups: [{ filters: [{ propertyName: 'createdate', operator: 'GTE', value: String(firstOfMonth) }] }],
        properties: ['firstname', 'lastname', 'email', 'hubspot_owner_id', 'lifecyclestage', 'createdate'],
        limit: 20, sorts: [{ propertyName: 'createdate', direction: 'DESCENDING' }]
      })
    ]);

    const deals = dealsRes.results || [];
    const contacts = contactsRes.results || [];

    const totalValue = deals.reduce((sum, d) => sum + parseFloat(d.properties.amount || 0), 0);
    const stageCount = {};
    deals.forEach(d => {
      const stage = stageName(d.properties.dealstage || 'onbekend');
      stageCount[stage] = (stageCount[stage] || 0) + 1;
    });

    const now7 = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const inactiveDeals = deals.filter(d => {
      const lastMod = new Date(d.properties.hs_lastmodifieddate).getTime();
      return lastMod < now7 && d.properties.dealstage !== 'closedwon' && d.properties.dealstage !== 'closedlost';
    });

    return `
# LIVE HUBSPOT DATA — ${now.toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' })}

## Pipeline deze maand
- Totaal deals: ${deals.length}
- Totale waarde: €${Math.round(totalValue).toLocaleString('nl-BE')}
- Nieuwe contacten: ${contacts.length}

## Deals per stage
${Object.entries(stageCount).map(([stage, count]) => `- ${stage}: ${count} deals`).join('\n')}

## Alerts — inactief 7+ dagen
${inactiveDeals.length === 0 ? '- Geen alerts' : inactiveDeals.map(d => `- ${d.properties.dealname || 'Onbenoemde deal'} — stage: ${stageName(d.properties.dealstage)} — waarde: €${Math.round(d.properties.amount || 0).toLocaleString('nl-BE')}`).join('\n')}

## Recente nieuwe contacten
${contacts.slice(0, 5).map(c => `- ${c.properties.firstname || ''} ${c.properties.lastname || ''} — ${c.properties.lifecyclestage || 'onbekend'}`).join('\n')}
`;
  } catch (err) {
    console.error('HubSpot error:', err.message);
    return '# HUBSPOT DATA\nKon geen live data ophalen — controleer de HubSpot token.';
  }
}


const STAGE_MAP = {
  '74045115': 'New Opportunity',
  '4957683955': 'Discovery / 7d Trial',
  '582710757': 'Meeting Scheduled',
  '4977533139': 'Aanwezig op workshop',
  '66985972': 'In Consideration',
  '63137245': 'Lost - No Deal',
  '1991865554': 'Won - Confirmation',
  '63137748': 'Won - Send Invoice',
  '157726961': 'Won - Invoice Sent',
  '1134715080': 'Won - Invoice Paid',
  '63137244': 'Won - Deal Active',
  '1239721201': 'Won - Deal Expired',
  '67650809': 'Up For Renewal',
  '1513597170': 'Attempting Renewal',
  '63247585': 'Lost - No Renewal',
  '63247583': 'Won - Send Invoice (Renewal)',
  '157620964': 'Won - Invoice Sent (Renewal)',
  '1134715084': 'Won - Invoice Paid (Renewal)',
  '63247584': 'Won - Deal Active (Renewal)',
  '1240241362': 'Won - Deal Expired (Renewal)',
  '2803756220': 'New Opportunity (MC)',
  '5073827008': 'VP intake ontvangen',
  '2803756222': 'Workshop / Event',
  '2803756221': 'Meeting Scheduled (MC)',
  '2804284646': 'In Consideration (MC)',
  '2803756224': 'Lost - No Deal (MC)',
  '2803756223': 'Won - Confirmation (MC)',
  '2803756225': 'Won - Send Invoice (MC)',
  '2804286682': 'Won - Invoice Sent (MC)',
  '2803756226': 'Won - Invoice Paid (MC)',
  '2804284647': 'Won - Deal Closed (MC)',
  '4839599353': 'New Opportunity (MM)',
  '4839600314': 'Meeting Scheduled (MM)',
  '4839600316': 'In Consideration (MM)',
  '4839600317': 'Lost - No Deal (MM)',
  '4839600318': 'Won - Confirmation (MM)',
  '5015150790': 'Won - Send Invoice (MM)',
  '5015150791': 'Won - Invoice Sent (MM)',
  '5015150793': 'Won - Invoice Paid (MM)',
  '5015150795': 'Won - Deal Active (MM)',
  '5015150796': 'Won - Deal Expired (MM)',
};
function stageName(id) { return STAGE_MAP[id] || id; }

const HUBSPOT_AGENTS = ['coo', 'sales-manager', 'hubspot', 'sales-trainer', 'ceo'];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'online', service: 'Archer Agent Server', version: '3.0.0', agents: ['coo', 'ceo', 'sales-manager', 'sales-trainer', 'hubspot', 'copywriting', 'content-social', 'dev-assistent', 'paid-advertising'] }));
  }

  if (req.method === 'POST' && url.pathname === '/history') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { userId, agentId } = JSON.parse(body);
        const { data: session } = await supabase.from('sessions').select('id').eq('user_id', userId).eq('agent_id', agentId).order('last_message_at', { ascending: false }).limit(1).single();
        if (!session) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ messages: [], sessionId: null })); }
        const { data: messages } = await supabase.from('messages').select('role, content').eq('session_id', session.id).order('created_at', { ascending: true }).limit(50);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ messages: messages || [], sessionId: session.id }));
      } catch (err) { res.writeHead(500, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: err.message })); }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { agentId, message, sessionId, userId } = JSON.parse(body);
        if (!agentId || !message || !userId) { res.writeHead(400, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: 'agentId, message en userId zijn verplicht' })); }

        const [systemPromptBase, hubspotContext] = await Promise.all([
          loadAgentConfig(agentId),
          HUBSPOT_AGENTS.includes(agentId) ? getHubSpotContext(agentId) : Promise.resolve(null)
        ]);

        const systemPrompt = hubspotContext ? systemPromptBase + '\n\n---\n\n' + hubspotContext : systemPromptBase;

        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const { data: newSession } = await supabase.from('sessions').insert({ user_id: userId, agent_id: agentId }).select('id').single();
          currentSessionId = newSession.id;
        }

        const { data: history } = await supabase.from('messages').select('role, content').eq('session_id', currentSessionId).order('created_at', { ascending: true }).limit(50);

        await supabase.from('messages').insert({ session_id: currentSessionId, role: 'user', content: message });

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: systemPrompt,
          messages: [...(history || []).map(m => ({ role: m.role, content: m.content })), { role: 'user', content: message }]
        });

        const reply = response.content[0].text;
        await supabase.from('messages').insert({ session_id: currentSessionId, role: 'assistant', content: reply, tokens_used: response.usage.output_tokens });

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
  console.log(`Archer Agent Server v3.0 draait op poort ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`HubSpot: ${process.env.HUBSPOT_TOKEN ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`GitHub: publieke repo`);
});
