# TOOLS.md
> Toolstack & toegangsrechten — geldig voor alle Archer agents
> Laatste update: April 2026 | Beheerd door: Ward & Victor
> Aangevuld door: Bjorn

---

## 1. Volledige toolstack Archer

### CRM & Sales
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **HubSpot** | CRM, pipeline beheer, contacten, deals, workflows | Bjorn, Anthony, Thomas, Creneua, Xavier, mentoren, Ward, Victor |
| **Zoom** | Sales calls, mentorgesprekken, online sessies | Alle teamleden |
| **Billit** | Facturen opmaken en versturen | Rha, Bjorn, Anthony |
| **Mail (Gmail/Outlook)** | Factuuropvolging en klantcommunicatie | Rha, salesteam |

### Communicatie & samenwerking
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **Telegram** | Interne communicatie — primair kanaal voor heel het team | Alle teamleden |
| **Zoom** | Video calls intern en extern | Alle teamleden |

> **Opmerking:** Archer gebruikt geen formeel projectmanagementtool. Operationele afstemming gebeurt via Telegram en op de vloer.

### Finance & administratie
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **Billit** | Facturen opmaken, versturen en opvolgen | Rha, Bjorn, Anthony |
| **Excel / Google Sheets** | Financiële overzichten, rapportages, ad-hoc analyses | Rha, Bjorn, Anthony |

### Design & contentcreatie
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **Canva** | Social media content, presentaties, templates | Yannick, Annelies |
| **Figma** | UI/UX design, mockups, visuele ontwerpen | Yannick, Annelies, Ward, Victor |
| **Adobe Creative Suite** | Professionele grafische content, video editing | Yannick, Annelies |

### Website & applicaties
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **Lovable** | Website Archer + Archer Invest applicatie (frontend builder) | Ward, Victor, Bjorn |
| **GitHub** | Centrale coderepository — archer-agents + alle Lovable projecten | Ward, Victor, Bjorn, Anthony |
| **Vercel** | Hosting van Agent Hub webapp en dashboards | Ward, Victor |
| **Supabase** | Database voor agent sessies, gebruikers, chatgeschiedenis | Ward, Victor |
| **Railway** | Agent server hosting — altijd online | Ward, Victor |

### AI & automatisatie
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **Anthropic API** | Claude modellen voor alle Archer agents | Ward, Victor (beheer), alle teamleden (gebruik via Agent Hub) |
| **Claude Code** | AI-geassisteerd ontwikkelen — Ward & Victor via VS Code SSH | Ward, Victor, Bjorn, Anthony |
| **Archer Agent Hub** | Centrale interface voor alle AI agents | Alle teamleden (elk met eigen toegangsrechten) |

### Content & podcast distributie
| Tool | Waarvoor | Wie heeft toegang |
|---|---|---|
| **Spotify** | Distributie Mind to Invest podcast | Yannick, Annelies |
| **YouTube** | Video content + podcast video versie | Yannick, Annelies |
| **Meta (Facebook/Instagram)** | Organic content + paid advertising (op te starten) | Yannick, Annelies |
| **LinkedIn** | Professioneel netwerk en content | Yannick, Annelies, Bjorn, Anthony |

---

## 2. Welke agent mag welke tool gebruiken

Dit is de kritische toegangsmatrix — agents mogen enkel tools aanroepen die hier zijn toegewezen.

| Agent | HubSpot | Telegram | Billit | Zoom | GitHub | Supabase | Meta |
|---|---|---|---|---|---|---|---|
| CEO agent | Lezen | Sturen | Nee | Nee | Nee | Nee | Nee |
| COO agent | Lezen | Sturen | Nee | Nee | Nee | Nee | Nee |
| Sales manager | Lezen + schrijven | Sturen | Nee | Nee | Nee | Nee | Nee |
| Sales trainer | Lezen | Nee | Nee | Nee | Nee | Nee | Nee |
| HubSpot agent | Lezen + schrijven + workflows | Sturen | Nee | Nee | Nee | Nee | Nee |
| Paid advertising | Nee | Nee | Nee | Nee | Nee | Nee | Lezen + rapporteren |
| Copywriting | Nee | Nee | Nee | Nee | Nee | Nee | Nee |
| Content & social | Nee | Nee | Nee | Nee | Nee | Nee | Lezen |
| Podcast agent | Nee | Nee | Nee | Nee | Nee | Nee | Nee |
| Dev assistent | Nee | Nee | Nee | Nee | Lezen | Lezen | Nee |
| Mentor coach | Lezen | Nee | Nee | Nee | Nee | Nee | Nee |
| HR & Finance | Nee | Nee | Lezen | Nee | Nee | Nee | Nee |
| Event & office | Nee | Sturen | Nee | Nee | Nee | Nee | Nee |

> **Schrijven ≠ deleten.** Geen enkele agent mag zelfstandig records deleten in HubSpot of andere tools. Enkel lezen, aanmaken of aanpassen — nooit verwijderen.

---

## 3. Koppelingen & integraties

| Koppeling | Hoe | Status |
|---|---|---|
| HubSpot ↔ Agent server | MCP (Model Context Protocol) | Actief |
| GitHub ↔ Railway | Webhook — auto-deploy bij push naar main | In te stellen door Ward |
| Supabase ↔ Agent server | Direct database connectie | In te stellen door Ward |
| Anthropic API ↔ Agent server | REST API via server | In te stellen door Ward |
| Lovable ↔ GitHub | Automatische sync | Actief |
| Vercel ↔ GitHub | Auto-deploy frontend bij push | In te stellen door Ward |
| Billit ↔ HubSpot | TODO — te onderzoeken door Ward & Rha | Niet actief |
| Zoom ↔ HubSpot | TODO — call logging | Niet actief |

---

## 4. Toegangsrechten per persoon

| Persoon | Admin toegang | Gebruikerstoegang |
|---|---|---|
| Bjorn | GitHub (owner), HubSpot, Lovable, Agent Hub | Alle tools |
| Anthony | HubSpot, Agent Hub | Alle tools |
| Ward | GitHub (maintainer), Railway, Supabase, Vercel, Lovable, Figma | Alle technische tools |
| Victor | GitHub (maintainer), Railway, Supabase, Vercel, Lovable, Figma | Alle technische tools |
| Yannick | Meta, Canva, Adobe, YouTube, Spotify | Marketing tools |
| Annelies | Meta, Canva, Adobe, YouTube, Spotify | Marketing tools |
| Thomas | HubSpot | Zoom, Agent Hub |
| Creneua | HubSpot | Zoom, Agent Hub |
| Xavier | HubSpot | Zoom, Agent Hub |
| Mentoren (7x) | HubSpot (eigen klanten) | Zoom, Agent Hub |
| Rha | Billit, Excel | Agent Hub |
| Sophie | — | Agent Hub, Telegram |

---

## 5. Wat agents NOOIT mogen doen in tools

- **Nooit** zelfstandig records deleten in HubSpot — contacten, deals of bedrijven
- **Nooit** facturen aanmaken of versturen in Billit zonder expliciete goedkeuring van Rha
- **Nooit** rechtstreeks publiceren op sociale media — altijd ter goedkeuring voorleggen
- **Nooit** betalingen initiëren of financiële transacties uitvoeren
- **Nooit** wachtwoorden of API keys opslaan of delen in chats
- **Nooit** GitHub bestanden aanpassen in de `main` branch — altijd via pull request
- **Nooit** Zoom calls starten of plannen namens iemand zonder expliciete opdracht

---

## 6. Toolstack samenvatting

```
Klantcontact:     HubSpot · Zoom · Billit · Mail
Intern team:      Telegram · Zoom
Design:           Canva · Figma · Adobe
Website & apps:   Lovable · GitHub · Vercel
Database:         Supabase
Server:           Railway
AI:               Anthropic API · Claude Code · Agent Hub
Podcast:          Spotify · YouTube
Social:           Meta · LinkedIn · YouTube
Finance:          Billit · Excel
```

---

*Dit document is de toolreferentie voor alle Archer agents. Ward houdt dit document up-to-date bij nieuwe integraties of toegangswijzigingen.*
