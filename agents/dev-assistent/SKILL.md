# SKILL.md — Dev assistent agent
> Technische expertise, patronen & Archer infrastructuurkennis
> Laatste update: April 2026 | Beheerd door: Ward & Victor
> Versie: 1.0

---

## 1. Archer infrastructuur — volledig overzicht

### Agent server architectuur

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENTS                              │
│  Agent Hub (Vercel) │ VS Code SSH │ Telegram bot        │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────┐
│              RAILWAY — Agent Server                     │
│                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │ Auth middleware│  │ Session router│  │ Agent dispatcher│    │
│  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │           Agent configs (geladen uit GitHub)     │  │
│  │  COO │ Sales mgr │ Sales trainer │ HubSpot │ ... │  │
│  └──────────────────────────────────────────────────┘  │
└──────┬──────────────────────────┬───────────────────────┘
       │                          │
┌──────▼──────┐           ┌───────▼──────┐
│  Supabase   │           │ Anthropic API │
│  (database) │           │ (Claude)      │
└─────────────┘           └──────────────┘
       │
┌──────▼──────────────────────────────────┐
│  Supabase tables                        │
│  users │ sessions │ messages │ logs     │
│  agent_actions │ audit_trail            │
└─────────────────────────────────────────┘
```

### Database schema — Supabase

```sql
-- Gebruikers
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'power_user', 'user')),
  allowed_agents TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ
);

-- Sessies per gebruiker per agent
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- Berichten per sessie
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  tokens_used INTEGER
);

-- Agent acties in externe systemen
CREATE TABLE agent_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  target_system TEXT NOT NULL,
  target_id TEXT,
  details JSONB,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending_approval')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit trail
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  agent_id TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS policies — kritieke implementatie

```sql
-- Users: ziet enkel zichzelf
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Sessions: ziet enkel eigen sessies
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- Messages: ziet enkel berichten van eigen sessies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_messages" ON messages
  FOR ALL USING (
    session_id IN (
      SELECT id FROM sessions WHERE user_id = auth.uid()
    )
  );

-- Agent actions: enkel server key — geen client toegang
ALTER TABLE agent_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "server_only" ON agent_actions
  FOR ALL USING (false); -- enkel via service_key

-- Audit log: enkel admins en owners
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_read_audit" ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

---

## 2. Agent server implementatie — kernpatronen

### Agent dispatcher

```typescript
// server/dispatcher.ts
import { loadAgentConfig } from './config-loader'
import { getSessionHistory } from './session'
import { callClaude } from './claude'
import { logAction } from './audit'

export async function dispatchMessage(
  userId: string,
  agentId: string,
  sessionId: string,
  userMessage: string
): Promise<string> {

  // 1. Verifieer toegang
  const hasAccess = await verifyAgentAccess(userId, agentId)
  if (!hasAccess) throw new Error('Access denied')

  // 2. Laad agent config vanuit GitHub
  const config = await loadAgentConfig(agentId)

  // 3. Haal sessiehistoriek op
  const history = await getSessionHistory(sessionId)

  // 4. Bouw de messages array
  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage }
  ]

  // 5. Call Claude API
  const response = await callClaude({
    system: config.systemPrompt,
    messages,
    maxTokens: 2048
  })

  // 6. Sla op in database
  await saveMessage(sessionId, 'user', userMessage)
  await saveMessage(sessionId, 'assistant', response)

  // 7. Audit log
  await logAction(userId, agentId, 'message_sent', sessionId)

  return response
}
```

### Config loader — laadt MD bestanden vanuit GitHub

```typescript
// server/config-loader.ts
import { Octokit } from '@octokit/rest'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function loadAgentConfig(agentId: string) {
  const sharedFiles = ['ARCHER', 'PRODUCTS', 'TONE_OF_VOICE', 'TEAM', 'KPIS', 'PROCESSES', 'TOOLS']
  const agentFiles = ['CLAUDE', 'SKILL', 'TASK']

  // Laad shared docs
  const sharedContent = await Promise.all(
    sharedFiles.map(f => fetchFile(`shared/${f}.md`))
  )

  // Laad agent-specifieke docs
  const agentContent = await Promise.all(
    agentFiles.map(f => fetchFile(`agents/${agentId}/${f}.md`))
  )

  // Combineer tot system prompt
  return {
    systemPrompt: [
      '# GEDEELDE ARCHER KENNISBANK',
      ...sharedContent,
      `# ${agentId.toUpperCase()} AGENT CONFIGURATIE`,
      ...agentContent
    ].join('\n\n---\n\n')
  }
}

async function fetchFile(path: string): Promise<string> {
  const response = await octokit.repos.getContent({
    owner: process.env.GITHUB_OWNER!,
    repo: 'archer-agents',
    path,
  })
  // Decode base64 content
  return Buffer.from((response.data as any).content, 'base64').toString('utf-8')
}
```

### Sessie management

```typescript
// server/session.ts
import { supabase } from './supabase'

export async function getOrCreateSession(
  userId: string,
  agentId: string
): Promise<string> {
  // Zoek bestaande actieve sessie
  const { data: existing } = await supabase
    .from('sessions')
    .select('id')
    .eq('user_id', userId)
    .eq('agent_id', agentId)
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) return existing.id

  // Maak nieuwe sessie aan
  const { data: newSession } = await supabase
    .from('sessions')
    .insert({ user_id: userId, agent_id: agentId })
    .select('id')
    .single()

  return newSession!.id
}

export async function getSessionHistory(
  sessionId: string,
  limit = 50
): Promise<Array<{ role: string; content: string }>> {
  const { data } = await supabase
    .from('messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  return data || []
}
```

---

## 3. Security implementatie patronen

### Authenticatie flow

```typescript
// middleware/auth.ts
import { createClient } from '@supabase/supabase-js'

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  // Haal gebruikersprofiel op
  const { data: profile } = await supabase
    .from('users')
    .select('role, allowed_agents')
    .eq('id', user.id)
    .single()

  req.user = { id: user.id, ...profile }
  next()
}
```

### Agent toegangscontrole

```typescript
// middleware/agent-access.ts
export async function verifyAgentAccess(
  userId: string,
  agentId: string
): Promise<boolean> {
  const { data: user } = await supabase
    .from('users')
    .select('role, allowed_agents')
    .eq('id', userId)
    .single()

  if (!user) return false

  // Owners en admins hebben altijd toegang
  if (['owner', 'admin'].includes(user.role)) return true

  // Anderen enkel tot hun toegewezen agents
  return user.allowed_agents.includes(agentId)
}
```

### Input validatie en sanitisatie

```typescript
// utils/validation.ts
import { z } from 'zod'

export const MessageSchema = z.object({
  agentId: z.string().regex(/^[a-z-]+$/).max(50),
  sessionId: z.string().uuid().optional(),
  content: z.string().min(1).max(10000),
})

export function validateMessage(input: unknown) {
  return MessageSchema.parse(input) // throws ZodError bij ongeldig
}
```

---

## 4. GitHub Actions — CI/CD patronen

### Auto-deploy bij push naar main

```yaml
# .github/workflows/deploy.yml
name: Deploy agent server

on:
  push:
    branches: [main]
    paths: ['server/**', 'agents/**', 'shared/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run typecheck

      - name: Run tests
        run: npm test

      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

### Security scan

```yaml
# .github/workflows/security.yml
name: Security scan

on: [push, pull_request]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check for hardcoded secrets
        uses: trufflesecurity/trufflehog@main
        with:
          path: ./
          base: ${{ github.event.repository.default_branch }}

      - name: Dependency audit
        run: npm audit --audit-level=high
```

---

## 5. Veelvoorkomende problemen en oplossingen

### Railway server crasht bij hoge load
```
Oorzaak: Te veel gelijktijdige Anthropic API calls
Oplossing: Request queue implementeren met p-limit
```

### Supabase connection pool exhausted
```
Oorzaak: Te veel open database connections
Oplossing: Connection pooler (pgBouncer) activeren in Supabase
```

### GitHub API rate limiting
```
Oorzaak: Te veel config-loader calls
Oplossing: Cache agent configs in memory met TTL van 5 minuten
           Herlaad enkel na GitHub webhook (push naar main)
```

### Anthropic API timeout
```
Oorzaak: Grote system prompts + lange conversation history
Oplossing: 
  1. Trim conversation history naar laatste 20 berichten
  2. Compress oude berichten via summarization
  3. Implement retry met exponential backoff
```

### Session interferentie tussen gebruikers
```
Oorzaak: Verkeerde RLS policy of session ID verwarring
Oplossing:
  1. Controleer RLS policies in Supabase
  2. Verifieer dat session_id altijd user-specifiek is
  3. Audit log controleren op cross-user access
```

---

## 6. Documentatiestandaarden

### README structuur voor elke service

```markdown
# [Service naam]

## Wat doet dit?
[1-2 zinnen]

## Vereisten
- Node.js 20+
- Environment variables (zie .env.example)

## Lokaal draaien
```bash
npm install
cp .env.example .env
# Vul .env in
npm run dev
```

## Deployment
[Hoe deploy je dit naar Railway/Vercel?]

## Environment variables
| Variable | Beschrijving | Verplicht |
|---|---|---|
| SUPABASE_URL | Supabase project URL | Ja |
| ... | ... | ... |

## API endpoints (indien van toepassing)
[Lijst van endpoints met beschrijving]

## Bekende issues en workarounds
[Lijst van bekende problemen]
```

---

*Dit bestand definieert de technische expertise van de dev assistent agent. Aanpassen via pull request — alleen Ward of Bjorn kan mergen.*
