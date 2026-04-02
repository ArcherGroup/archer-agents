const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const Anthropic = require('@anthropic-ai/sdk');

const PORT = process.env.PORT || 3000;

// Clients initialiseren
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Request handler
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // Health check
  if (req.method === 'GET' && url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      status: 'online',
      service: 'Archer Agent Server',
      version: '1.0.0',
      agents: ['coo', 'ceo', 'sales-manager', 'sales-trainer', 
               'hubspot', 'copywriting', 'content-social', 'dev-assistent']
    }));
  }

  // Chat endpoint
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

        // Sessie ophalen of aanmaken
        let currentSessionId = sessionId;
        if (!currentSessionId) {
          const { data: newSession } = await supabase
            .from('sessions')
            .insert({ user_id: userId, agent_id: agentId })
            .select('id')
            .single();
          currentSessionId = newSession.id;
        }

        // Geschiedenis ophalen
        const { data: history } = await supabase
          .from('messages')
          .select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true })
          .limit(50);

        // Bericht opslaan
        await supabase.from('messages').insert({
          session_id: currentSessionId,
          role: 'user',
          content: message
        });

        // Claude aanroepen
        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: `Je bent de ${agentId} agent van Archer. Je helpt het Archer team professioneel en direct.`,
          messages: [
            ...(history || []).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: message }
          ]
        });

        const reply = response.content[0].text;

        // Antwoord opslaan
        await supabase.from('messages').insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: reply,
          tokens_used: response.usage.output_tokens
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          reply, 
          sessionId: currentSessionId 
        }));

      } catch (err) {
        console.error('Chat error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Niet gevonden' }));
});

server.listen(PORT, () => {
  console.log(`Archer Agent Server draait op poort ${PORT}`);
  console.log(`Supabase: ${process.env.SUPABASE_URL ? 'verbonden' : 'NIET geconfigureerd'}`);
  console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? 'verbonden' : 'NIET geconfigureerd'}`);
});
