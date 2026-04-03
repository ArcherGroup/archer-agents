const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');
const { Octokit } = require('@octokit/rest');
const hubspot = require('@hubspot/api-client');

const PORT = process.env.PORT || 3000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
const intranet = createClient(process.env.INTRANET_SUPABASE_URL, process.env.INTRANET_SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const octokit = new Octokit();
const hubspotClient = new hubspot.Client({ accessToken: process.env.HUBSPOT_TOKEN });

const GITHUB_OWNER = 'ArcherGroup';
const GITHUB_REPO = 'archer-agents';
const configCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const STAGE_MAP = {'74045115':'New Opportunity','4957683955':'Discovery / 7d Trial','582710757':'Meeting Scheduled','4977533139':'Aanwezig op workshop','66985972':'In Consideration','63137245':'Lost - No Deal','1991865554':'Won - Confirmation','63137748':'Won - Send Invoice','157726961':'Won - Invoice Sent','1134715080':'Won - Invoice Paid','63137244':'Won - Deal Active','1239721201':'Won - Deal Expired','67650809':'Up For Renewal','1513597170':'Attempting Renewal','63247585':'Lost - No Renewal','63247583':'Won - Send Invoice (Renewal)','157620964':'Won - Invoice Sent (Renewal)','1134715084':'Won - Invoice Paid (Renewal)','63247584':'Won - Deal Active (Renewal)','1240241362':'Won - Deal Expired (Renewal)','2803756220':'New Opportunity (MC)','5073827008':'VP intake ontvangen','2803756222':'Workshop / Event','2803756221':'Meeting Scheduled (MC)','2804284646':'In Consideration (MC)','2803756224':'Lost - No Deal (MC)','2803756223':'Won - Confirmation (MC)','2803756225':'Won - Send Invoice (MC)','2804286682':'Won - Invoice Sent (MC)','2803756226':'Won - Invoice Paid (MC)','2804284647':'Won - Deal Closed (MC)','4839599353':'New Opportunity (MM)','4839600314':'Meeting Scheduled (MM)','4839600316':'In Consideration (MM)','4839600317':'Lost - No Deal (MM)','4839600318':'Won - Confirmation (MM)','5015150790':'Won - Send Invoice (MM)','5015150791':'Won - Invoice Sent (MM)','5015150793':'Won - Invoice Paid (MM)','5015150795':'Won - Deal Active (MM)','5015150796':'Won - Deal Expired (MM)'};
function stageName(id) { return STAGE_MAP[id] || id; }

async function fetchFile(path) {
  try {
    const r = await octokit.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path });
    return Buffer.from(r.data.content, 'base64').toString('utf-8');
  } catch { return null; }
}

async function loadAgentConfig(agentId) {
  const cached = configCache.get(agentId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.config;
  const sharedFiles = ['ARCHER','PRODUCTS','TONE_OF_VOICE','TEAM','KPIS','PROCESSES','TOOLS'];
  const agentFiles = ['CLAUDE','SKILL','TASK'];
  const [sharedContent, agentContent] = await Promise.all([
    Promise.all(sharedFiles.map(f => fetchFile(`shared/${f}.md`))),
    Promise.all(agentFiles.map(f => fetchFile(`agents/${agentId}/${f}.md`)))
  ]);
  const systemPrompt = ['# ARCHER KENNISBANK',...sharedContent.filter(Boolean),`# ${agentId.toUpperCase()} AGENT CONFIGURATIE`,...agentContent.filter(Boolean)].join('\n\n---\n\n');
  configCache.set(agentId, { config: systemPrompt, timestamp: Date.now() });
  return systemPrompt;
}

async function getHubSpotContext() {
  try {
    const now = new Date();
    const [dealsRes, contactsRes] = await Promise.all([
      hubspotClient.crm.deals.searchApi.doSearch({
        filterGroups:[{filters:[{propertyName:'dealstage',operator:'NOT_IN',values:['63137245','2803756224','4839600317','63247585']}]}],
        properties:['dealname','amount','dealstage','hs_lastmodifieddate'],limit:50,
        sorts:[{propertyName:'hs_lastmodifieddate',direction:'DESCENDING'}]
      }),
      hubspotClient.crm.contacts.searchApi.doSearch({
        filterGroups:[{filters:[{propertyName:'createdate',operator:'GTE',value:String(new Date(now.getFullYear(),now.getMonth(),1).getTime())}]}],
        properties:['firstname','lastname','lifecyclestage'],limit:20,
        sorts:[{propertyName:'createdate',direction:'DESCENDING'}]
      })
    ]);
    const deals = dealsRes.results || [];
    const contacts = contactsRes.results || [];
    const totalValue = deals.reduce((sum,d) => sum + parseFloat(d.properties.amount||0), 0);
    const stageCount = {};
    deals.forEach(d => { const s = stageName(d.properties.dealstage||''); stageCount[s] = (stageCount[s]||0)+1; });
    const now7 = Date.now() - 7*24*60*60*1000;
    const inactive = deals.filter(d => new Date(d.properties.hs_lastmodifieddate).getTime() < now7);
    return `\n# LIVE HUBSPOT DATA — ${now.toLocaleDateString('nl-BE',{day:'numeric',month:'long',year:'numeric'})}\n\n## Pipeline\n- Open deals: ${deals.length}\n- Totale waarde: €${Math.round(totalValue).toLocaleString('nl-BE')}\n- Nieuwe contacten: ${contacts.length}\n\n## Per stage\n${Object.entries(stageCount).map(([s,n])=>`- ${s}: ${n}`).join('\n')}\n\n## Alerts inactief 7+ dagen\n${inactive.length===0?'- Geen alerts':inactive.map(d=>`- ${d.properties.dealname||'Onbenoemd'} — ${stageName(d.properties.dealstage)} — €${Math.round(d.properties.amount||0).toLocaleString('nl-BE')}`).join('\n')}\n\n## Nieuwe contacten\n${contacts.slice(0,5).map(c=>`- ${c.properties.firstname||''} ${c.properties.lastname||''} — ${c.properties.lifecyclestage||'onbekend'}`).join('\n')}`;
  } catch(err) { return '# HUBSPOT\nFout: ' + err.message; }
}

async function getIntranetContext(agentId) {
  try {
    const now = new Date();
    const [mentorsRes, clientsRes] = await Promise.all([
      intranet.from('mentors').select('name, current_points, max_points, monthly_target').limit(20),
      intranet.from('clients').select('name, trajectory, status').limit(200)
    ]);
    const mentors = mentorsRes.data || [];
    const clients = clientsRes.data || [];
    const trajectCount = {};
    clients.forEach(c => { const t = c.trajectory||'onbekend'; trajectCount[t]=(trajectCount[t]||0)+1; });

    let context = `\n# LIVE INTRANET DATA — ${now.toLocaleDateString('nl-BE',{day:'numeric',month:'long',year:'numeric'})}\n\n`;
    context += `## Mentoren (${mentors.length})\n`;
    mentors.forEach(m => { context += `- ${m.name} — ${m.current_points||0}/${m.max_points||36} punten — target: €${(m.monthly_target||0).toLocaleString('nl-BE')}\n`; });
    context += `\n## Klanten per traject (${clients.length} totaal)\n`;
    Object.entries(trajectCount).forEach(([t,n]) => { context += `- ${t}: ${n}\n`; });

    if (['sales-trainer','coo','sales-manager'].includes(agentId)) {
      const [transcriptsRes, scoresRes] = await Promise.all([
        intranet.from('transcripts').select('created_at, summary, score').order('created_at',{ascending:false}).limit(10),
        intranet.from('scores').select('*').order('created_at',{ascending:false}).limit(10)
      ]);
      const transcripts = transcriptsRes.data || [];
      if (transcripts.length > 0) {
        context += `\n## Recente call transcripts\n`;
        transcripts.forEach(t => { context += `- ${new Date(t.created_at).toLocaleDateString('nl-BE')} — score: ${t.score||'N/A'} — ${t.summary||'geen samenvatting'}\n`; });
      }
    }

    if (['coo','ceo','sales-manager'].includes(agentId)) {
      const [risksRes, insightsRes] = await Promise.all([
        intranet.from('v_client_risks').select('*').limit(10),
        intranet.from('client_insights').select('*').order('created_at',{ascending:false}).limit(5)
      ]);
      const risks = risksRes.data || [];
      const insights = insightsRes.data || [];
      if (risks.length > 0) {
        context += `\n## Risico klanten\n`;
        risks.forEach(r => { context += `- ${r.client_name||r.client_id||'onbekend'} — ${r.risk_level||'onbekend risico'}\n`; });
      }
      if (insights.length > 0) {
        context += `\n## Recente klantinzichten\n`;
        insights.forEach(i => { context += `- ${i.insight||'geen detail'}\n`; });
      }
    }

    if (['hubspot','sales-manager'].includes(agentId)) {
      const plansRes = await intranet.from('coaching_plans').select('*').limit(10);
      const plans = plansRes.data || [];
      if (plans.length > 0) {
        context += `\n## Actieve coaching plans (${plans.length})\n`;
        plans.slice(0,5).forEach(p => { context += `- ${p.client_id||'onbekend'} — ${p.status||'actief'}\n`; });
      }
    }

    return context;
  } catch(err) { return '\n# INTRANET DATA\nFout: ' + err.message; }
}

const HUBSPOT_AGENTS = ['coo','sales-manager','hubspot','sales-trainer','ceo'];
const INTRANET_AGENTS = ['coo','sales-manager','hubspot','sales-trainer','ceo','copywriting'];

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200,{'Content-Type':'application/json'});
    return res.end(JSON.stringify({status:'online',service:'Archer Agent Server',version:'4.0.0',datasources:['GitHub','HubSpot','Intranet Supabase']}));
  }

  if (req.method === 'POST' && url.pathname === '/history') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { userId, agentId } = JSON.parse(body);
        const { data: session } = await supabase.from('sessions').select('id').eq('user_id',userId).eq('agent_id',agentId).order('last_message_at',{ascending:false}).limit(1).single();
        if (!session) { res.writeHead(200,{'Content-Type':'application/json'}); return res.end(JSON.stringify({messages:[],sessionId:null})); }
        const { data: messages } = await supabase.from('messages').select('role, content').eq('session_id',session.id).order('created_at',{ascending:true}).limit(50);
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({messages:messages||[],sessionId:session.id}));
      } catch(err) { res.writeHead(500,{'Content-Type':'application/json'}); res.end(JSON.stringify({error:err.message})); }
    });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/chat') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { agentId, message, sessionId, userId } = JSON.parse(body);
        if (!agentId||!message||!userId) { res.writeHead(400,{'Content-Type':'application/json'}); return res.end(JSON.stringify({error:'agentId, message en userId zijn verplicht'})); }

        const [systemPromptBase, hubspotContext, intranetContext] = await Promise.all([
          loadAgentConfig(agentId),
          HUBSPOT_AGENTS.includes(agentId) ? getHubSpotContext() : Promise.resolve(null),
          INTRANET_AGENTS.includes(agentId) ? getIntranetContext(agentId) : Promise.resolve(null)
        ]);

        const systemPrompt = [systemPromptBase, hubspotContext, intranetContext].filter(Boolean).join('\n\n---\n\n');

        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const { data: newSession } = await supabase.from('sessions').insert({user_id:userId,agent_id:agentId}).select('id').single();
          currentSessionId = newSession.id;
        }

        const { data: history } = await supabase.from('messages').select('role, content').eq('session_id',currentSessionId).order('created_at',{ascending:true}).limit(50);
        await supabase.from('messages').insert({session_id:currentSessionId,role:'user',content:message});

        const response = await anthropic.messages.create({
          model:'claude-sonnet-4-5',
          max_tokens:2048,
          system:systemPrompt,
          messages:[...(history||[]).map(m=>({role:m.role,content:m.content})),{role:'user',content:message}]
        });

        const reply = response.content[0].text;
        await supabase.from('messages').insert({session_id:currentSessionId,role:'assistant',content:reply,tokens_used:response.usage.output_tokens});
        res.writeHead(200,{'Content-Type':'application/json'});
        res.end(JSON.stringify({reply,sessionId:currentSessionId}));
      } catch(err) {
        console.error('Chat error:',err);
        res.writeHead(500,{'Content-Type':'application/json'});
        res.end(JSON.stringify({error:err.message}));
      }
    });
    return;
  }

  res.writeHead(404,{'Content-Type':'application/json'});
  res.end(JSON.stringify({error:'Niet gevonden'}));
});

server.listen(PORT, () => {
  console.log(`Archer Agent Server v4.0 draait op poort ${PORT}`);
  console.log(`Supabase Hub: ${process.env.SUPABASE_URL?'verbonden':'NIET geconfigureerd'}`);
  console.log(`Supabase Intranet: ${process.env.INTRANET_SUPABASE_URL?'verbonden':'NIET geconfigureerd'}`);
  console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY?'verbonden':'NIET geconfigureerd'}`);
  console.log(`HubSpot: ${process.env.HUBSPOT_TOKEN?'verbonden':'NIET geconfigureerd'}`);
});
