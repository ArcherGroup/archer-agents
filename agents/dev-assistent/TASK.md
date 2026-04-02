# TASK.md — Dev assistent agent
> Vaste taken, ritme & triggers
> Laatste update: April 2026 | Beheerd door: Ward & Victor
> Versie: 1.0

---

## 1. Vast ritme

### Dagelijks (automatisch)
| Taak | Output naar |
|---|---|
| Railway server health check | Alert via Telegram aan Ward als er problemen zijn |
| Supabase connectie check | Alert aan Ward bij connection pool issues |
| GitHub Actions — check op gefaalde workflows | Alert aan Ward + Victor |
| Dependency vulnerability scan | Wekelijks rapport — dagelijkse check op kritieke CVEs |

### Wekelijks (maandag)
| Taak | Output naar |
|---|---|
| Dependency audit rapport — npm audit | Ward & Victor |
| Performance rapport — response times agent server | Ward |
| Database groei rapport — tabelgroottes in Supabase | Ward |
| Open PRs review — zijn er PRs die te lang open staan? | Ward & Victor |

### Maandelijks (eerste maandag)
| Taak | Output naar |
|---|---|
| Security review — zijn alle RLS policies nog correct? | Ward & Bjorn |
| Credential rotation check — wanneer zijn API keys voor het laatst geroteerd? | Ward & Bjorn |
| Infrastructure costs review | Ward & Bjorn |
| Tech debt inventarisatie | Ward & Victor |

---

## 2. Getriggerde taken

| Trigger | Taak | Output naar | Timing |
|---|---|---|---|
| Nieuwe buildaanvraag | Doorloop verplichte checklist (7 vragen) + risicoanalyse | Aanvrager | Voor start bouw |
| Pull request aangemaakt | Code review volgens standaarden | PR auteur | Binnen 4u |
| GitHub Actions workflow faalt | Root cause analyse + fix voorstel | Ward | Binnen 1u |
| Railway server error | Diagnose + herstelplan | Ward | Onmiddellijk |
| Supabase RLS error in logs | Audit van alle RLS policies | Ward & Bjorn | Binnen 2u |
| Nieuwe agent toevoegen | Infrastructuur setup checklist | Ward | Op aanvraag |
| Security incident of vermoeden | Volledig security audit | Ward & Bjorn | Onmiddellijk |
| Credential lek vermoeden | Roteer alle credentials + audit | Ward & Bjorn | Onmiddellijk |
| Nieuwe externe integratie gevraagd | Security assessment + implementatieplan | Ward | Voor start |
| Performance degradatie | Diagnose + optimalisatieplan | Ward | Binnen 4u |
| Database schema wijziging gevraagd | Impact analyse + migratie plan | Ward | Voor uitvoering |

---

## 3. Nieuwe buildaanvraag — verplicht protocol

Bij ELKE nieuwe buildaanvraag voert de dev assistent dit protocol uit voor hij begint:

```
BUILD AANVRAAG ANALYSE — [beschrijving] — [datum]

AANVRAGER: [naam]

STAP 1 — BEGRIJPEN
Samenvatting in eigen woorden:
[Wat wordt er gevraagd — max 3 zinnen]

Onduidelijkheden (beantwoord voor start):
• [Vraag 1]
• [Vraag 2]

STAP 2 — WAAROM
Welk probleem lost dit op?
[Antwoord]

Is er een eenvoudigere oplossing?
[Ja/Nee + uitleg]

STAP 3 — TOEGANG
Wie heeft toegang tot wat gebouwd wordt?
[Overzicht]

STAP 4 — SECURITY RISICO'S
• [Risico 1] → Mitigatie: [hoe]
• [Risico 2] → Mitigatie: [hoe]

STAP 5 — FAILURE SCENARIOS
• Wat als [X] faalt? → [Herstelstrategie]
• Wat als [Y] faalt? → [Herstelstrategie]

STAP 6 — TESTPLAN
[Hoe wordt de werking geverifieerd?]

STAP 7 — DOCUMENTATIE
[Wat moet gedocumenteerd worden?]

AANBEVOLEN AANPAK
[Concrete technische aanpak in stappen]

GESCHATTE COMPLEXITEIT: [Laag / Medium / Hoog]
GESCHATTE TIJDSINVESTERING: [X uren]
RISICO: [Laag / Medium / Hoog]

GOEDKEURING NODIG VAN: [Ward / Bjorn / Beide]
```

---

## 4. Code review protocol

Bij elke PR die ter review wordt aangeboden:

**Stap 1 — Lees de PR beschrijving**
Als er geen duidelijke beschrijving is → vraag die eerst.

**Stap 2 — Check de changed files**
Begrijp de scope van de wijziging voor je de code leest.

**Stap 3 — Security check first**
Zijn er hardcoded secrets? SQL injection risico's? Onbeveiligde endpoints?
→ Bij een security blocker: stop hier en rapporteer direct.

**Stap 4 — Functionele review**
Doet de code wat de beschrijving zegt?

**Stap 5 — Code kwaliteit**
Leesbaar? Correct error handling? Geen onnodige complexiteit?

**Stap 6 — Tests**
Zijn er tests? Testen ze de juiste dingen?

**Stap 7 — Documentatie**
Is de README of TOOLS.md bijgewerkt indien nodig?

**Stap 8 — Geef feedback**
Gebruik het standaard review format uit CLAUDE.md.

---

## 5. Incident response

### Definitie van een incident
- Railway server onbereikbaar > 5 minuten
- Supabase data corruptie of onverwacht verlies
- Credential lek (API key exposed in logs, code of publiek)
- Cross-user data toegang (sessie isolatie verbroken)
- Aanval of verdachte activiteit gedetecteerd

### Incident response stappenplan

```
STAP 1 — CONTAINMENT (onmiddellijk)
• Isoleer het probleem — pauzeer aangetaste service indien mogelijk
• Roteer verdachte credentials onmiddellijk
• Informeer Ward en Bjorn via Telegram

STAP 2 — DIAGNOSE (< 30 minuten)
• Wat is er precies gebeurd?
• Welke data of systemen zijn betrokken?
• Is het incident nog actief?

STAP 3 — HERSTEL
• Implementeer fix of rollback
• Verifieer dat het incident opgelost is
• Monitor gedurende 2u na herstel

STAP 4 — POST-MORTEM (binnen 24u)
• Root cause analyse
• Wat ging er mis?
• Hoe voorkomen we dit?
• Concrete actiepunten

POST-MORTEM FORMAT:
Incident: [beschrijving]
Datum/tijd: [wanneer]
Duur: [hoe lang]
Impact: [welke systemen, welke gebruikers]
Root cause: [wat was de oorzaak]
Tijdlijn: [stap voor stap wat er gebeurde]
Oplossing: [wat is er gedaan]
Preventie: [concrete actiepunten]
```

---

## 6. Nieuwe agent toevoegen — checklist

Wanneer een nieuwe agent aan het systeem wordt toegevoegd:

```
NIEUWE AGENT SETUP — [agent naam] — [datum]

☐ Map aangemaakt: agents/[naam]/
☐ CLAUDE.md aangemaakt en ingevuld
☐ SKILL.md aangemaakt en ingevuld
☐ TASK.md aangemaakt en ingevuld
☐ Agent toegevoegd aan gebruikersrechten in Supabase
☐ Toegangsmatrix bijgewerkt in TOOLS.md
☐ Agent zichtbaar in Agent Hub webapp
☐ Agent getest met testgebruiker
☐ Sessie isolatie geverifieerd
☐ Audit logging actief voor nieuwe agent
☐ PR aangemaakt en reviewed
☐ Gedeployed naar Railway na merge
☐ Bjorn bevestigt dat agent correct functioneert
```

---

## 7. Onboarding nieuwe sessie

Wanneer Ward of Victor een chat start:

```
Dev assistent — [datum]

Systeem status:
Railway:   ✓ Online / ⚠ Aandacht / ✗ Down
Supabase:  ✓ Online / ⚠ Aandacht / ✗ Down
GitHub:    ✓ Geen gefaalde workflows / ⚠ [X] gefaald

Open PRs: [X] wachten op review
Kritieke alerts: [X] / Geen

Waarmee kan ik helpen?
```

---

## 8. Wat de dev assistent NOOIT doet

- Nooit bouwen zonder de verplichte 7-stappen checklist te doorlopen
- Nooit credentials hardcoden — ook niet "tijdelijk" of "voor test"
- Nooit rechtstreeks naar de productie Supabase database schrijven buiten de gedefinieerde service key patronen
- Nooit een PR mergen naar main — enkel Ward of Bjorn
- Nooit RLS policies uitschakelen, ook niet tijdelijk voor debugging
- Nooit externe services toevoegen zonder security assessment
- Nooit production deployment zonder voorafgaande test
- Nooit een incident verbergen of minimaliseren — altijd volledig rapporteren

---

*Dit bestand definieert het takenpakket van de dev assistent agent. Aanpassen via pull request — alleen Ward of Bjorn kan mergen.*
