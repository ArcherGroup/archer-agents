# SKILL.md — COO agent
> Expertise, methodes & operationele kennis
> Laatste update: April 2026 | Beheerd door: Bjorn & Ward
> Versie: 1.0

---

## 1. Operationele kennis

### Pipeline hygiëne
De COO agent kent de volledige Archer salesflow en pipeline stages:

| Stage | Verwachte doorlooptijd | Alert na |
|---|---|---|
| New Opportunity | 1-3 dagen | 5 dagen |
| Gekwalificeerd | 1-5 dagen | 7 dagen |
| Discovery actief | 7 dagen (fixed) | 10 dagen |
| Event uitgenodigd | Tot event datum | 7 dagen zonder bevestiging |
| Event bijgewoond | 1-3 dagen | 5 dagen |
| Gesprek gepland | Op datum | 2 dagen voor gesprek reminder |
| Gesprek gehad | 1-3 dagen | 5 dagen |
| Factuur uitgestuurd | 14 dagen betaaltermijn | 7 dagen na vervaldatum |

**Uitzondering:** Als een deal gekoppeld is aan een event-inschrijving, is de tolerantie 3 weken.

### Commitment tracking
De COO agent kent de individuele maandcommitments van elk teamlid:

**Salesteam:**
- Thomas: €86.000/maand
- Creneua: €25.000/maand
- Xavier: €40.000/maand

**Mentoren:**
- Kevin, Lennard, Nico: €62.500/maand elk
- Jietse, Nigel: €50.000/maand elk
- Stijn, Wout: €33.000/maand elk
- Armani: €42.500/maand

**Totaal teamcommitment:** ~€547.000/maand

Bij het maken van een commitmentrapport berekent de COO agent:
- Hoeveel is er al gerealiseerd deze maand (gesloten deals)
- Hoeveel staat er in de pipeline als waarschijnlijk (gesprek gepland of gehad)
- Wat is het gap naar het maandtarget
- Wie zit ver onder zijn commitment en heeft prioritaire aandacht nodig

### Event management
De COO agent kent de volledige eventkalender van Archer:

| Event type | Frequentie | Minimum bezetting | Break-even |
|---|---|---|---|
| Academy live event | 13x/jaar (laatste vrijdag/maand) | 40 personen | 40 personen |
| Invest Vierdaagse | 4x/jaar (feb, jun, sep, dec) | 40 personen | 70 personen |
| Academy workshop | 1x/maand (eerste zaterdag) | n.v.t. | n.v.t. |
| Invest workshop | 1x/maand (laatste donderdag) | n.v.t. | n.v.t. |

Voor elk aankomend event trekt de COO agent uit HubSpot:
- Aantal inschrijvingen vs. capaciteit
- Open rate van uitnodigingsmail
- Hoeveel dagen tot het event
- Verwachte no-show percentage (TODO: zodra data beschikbaar)

### Rapportstructuur
Elk COO rapport (maandag, woensdag, vrijdag) volgt exact deze structuur:

```
📊 ARCHER RAPPORT — [dag] [datum]

STATUS: [één zin overall status]

── PIPELINE ──────────────────────
Alerts: [aantal deals met 7+ dagen inactiviteit]
[Naam deal / contactpersoon] — [stage] — [X dagen inactief] — @[verantwoordelijke]

── COMMITMENTS ───────────────────
Maand: [maand jaar] | Dagen resterend: [X]

[Naam] | Target: €X | Gerealiseerd: €X | Pipeline: €X | Gap: €X
[...]

Team totaal | Target: €547K | Gerealiseerd: €X | Gap: €X

── EVENTS ────────────────────────
[Naam event] — [datum] — [X] inschrijvingen / [capaciteit] — [X dagen tot event]
[Status: op schema / aandacht nodig / kritisch]

── FACTUREN ──────────────────────
Uitgestuurd deze maand: [X] facturen | Totaal: €X
Openstaand: [X] facturen | Totaal: €X
Vervallen: [X] facturen | Totaal: €X

── ACTIES VOOR VANDAAG ───────────
1. [Actie] → @[persoon]
2. [Actie] → @[persoon]
3. [Actie] → @[persoon]
```

---

## 2. Wekelijkse planning

De COO agent maakt elke maandag een weekplanning voor het team. De planning bevat:
- Per persoon: hun 3 prioritaire taken voor de week
- Aankomende events en deadlines
- Pipeline acties die deze week moeten gebeuren
- Agent-taken die ingepland staan

De planning wordt gepubliceerd in de Agent Hub én als Telegram bericht naar Bjorn en Anthony gestuurd.

---

## 3. Kick-off & meeting verwerking

Wanneer een audio-opname wordt aangeleverd:

**Stap 1 — Transcriptie**
Verwerk de audio via Whisper API naar een volledige tekst transcript.

**Stap 2 — Extractie**
Identificeer uit het transcript:
- Beslissingen die genomen zijn
- Actiepunten met verantwoordelijke persoon
- Deadlines die werden genoemd
- Prioriteiten die werden uitgesproken
- Vragen die open bleven

**Stap 3 — Structurering**
Organiseer de actiepunten per persoon en per prioriteit.

**Stap 4 — Inplanning**
Voeg de actiepunten toe aan de wekelijkse planning in de Agent Hub.

**Stap 5 — Samenvatting**
Stuur een gestructureerde samenvatting naar Bjorn via Telegram:

```
📋 SAMENVATTING [naam meeting] — [datum]

BESLISSINGEN:
• [Beslissing 1]
• [Beslissing 2]

ACTIEPUNTEN:
• [Actie] → @[persoon] — deadline: [datum]
• [Actie] → @[persoon] — deadline: [datum]

OPEN VRAGEN:
• [Vraag die nog beantwoord moet worden]

Alle actiepunten zijn ingepland in de Agent Hub.
```

---

## 4. Agent orchestratie

De COO agent kan taken delegeren aan andere agents:

| Taak | Delegeer naar |
|---|---|
| HubSpot data ophalen | HubSpot agent |
| Pipeline analyse | Sales manager agent |
| Deal coaching | Sales trainer agent |
| Copy schrijven voor rapport | Copywriting agent |
| Technisch probleem | Dev assistent agent |

Bij delegatie geeft de COO agent altijd mee:
- Wat er exact nodig is
- Voor wanneer
- In welk format het resultaat moet komen

---

## 5. HubSpot queries die de COO agent uitvoert

De COO agent kan de volgende standaard queries uitvoeren via de HubSpot agent:

```
// Pipeline hygiëne check
Alle deals waarbij laatste_activiteit > 7 dagen geleden
EN deal_stage != 'Gesloten gewonnen'
EN deal_stage != 'Gesloten verloren'
EN event_inschrijving = false

// Commitment tracking
Som van deal_waarde per eigenaar
WHERE deal_stage IN ('Gesprek gepland', 'Gesprek gehad', 'Factuur uitgestuurd')
AND sluitdatum <= einde_huidige_maand

// Event bezetting
Aantal contacten WHERE event_X_ingeschreven = true
AND event_mail_geopend = true/false

// Openstaande facturen
Alle deals WHERE stage = 'Factuur uitgestuurd'
AND factuurdatum < vandaag - 14 dagen
```

---

*Dit bestand definieert de expertise en werkmethodes van de COO agent. Aanpassen via pull request — alleen Bjorn kan mergen.*
