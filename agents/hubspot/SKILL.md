# SKILL.md — HubSpot agent
> Technische expertise, queries & HubSpot kennis
> Laatste update: April 2026 | Beheerd door: Ward & Bjorn
> Versie: 1.0

---

## 1. HubSpot objecten die de agent beheert

### Contacten
Het primaire object. Elke lead, prospect en klant van Archer is een contact in HubSpot.

**Standaard properties die altijd ingevuld moeten zijn:**
- `firstname` + `lastname`
- `email`
- `phone`
- `hs_lead_status` (lead status)
- `hubspot_owner_id` (verantwoordelijke teamlid)
- `lead_source` (hoe binnengekomen: marketing, netwerk, referral, event)
- `lifecyclestage` (subscriber → lead → MQL → SQL → opportunity → klant)

**Archer-specifieke properties:**
- `traject_type` (1-op-1 / mentorship / membership / invest / fonds)
- `traject_startdatum`
- `traject_einddatum`
- `mentor_naam`
- `event_inschrijving` (boolean)
- `discovery_actief` (boolean)

---

### Deals
Elke verkoopkans is een deal. Een contact kan meerdere deals hebben over tijd (verlenging, upgrade).

**Standaard properties:**
- `dealname`
- `amount` (deal waarde in €)
- `closedate` (verwachte sluitdatum)
- `hubspot_owner_id`
- `dealstage`
- `pipeline`

**Archer pipeline stages:**

| Stage ID | Stage naam | Sluitingskans |
|---|---|---|
| `new_opportunity` | New Opportunity | 5% |
| `gekwalificeerd` | Gekwalificeerd | 15% |
| `discovery_actief` | Discovery actief | 25% |
| `event_uitgenodigd` | Event uitgenodigd | 30% |
| `event_bijgewoond` | Event bijgewoond | 40% |
| `gesprek_gepland` | Gesprek gepland | 55% |
| `gesprek_gehad` | Gesprek gehad | 70% |
| `factuur_uitgestuurd` | Factuur uitgestuurd | 90% |
| `closedwon` | Gesloten gewonnen | 100% |
| `closedlost` | Gesloten verloren | 0% |

---

### Lijsten
HubSpot lijsten worden gebruikt voor event-inschrijvingen, emailcampagnes en segmentatie.

**Actieve lijsten (automatisch bijgewerkt op basis van criteria)**
Worden gebruikt voor:
- Event-inschrijvingen per event
- Actieve klanten per traject
- Leads in specifieke pipeline stage

**Statische lijsten (handmatig)**
Worden gebruikt voor:
- Specifieke doelgroepen voor emailcampagnes
- Export-lijsten

---

### Email marketing
HubSpot email statistieken die de agent ophaalt en analyseert:

| Metric | Definitie | Archer benchmark |
|---|---|---|
| Open rate | % ontvangers die de mail openden | Target: 35%+ (huidig: 35%) |
| Click rate | % ontvangers die klikten | Target: 5%+ (huidig: 3%) |
| Click-through rate | % openers die klikten | Target: 10%+ |
| Bounce rate | % mails niet afgeleverd | Alert bij >2% |
| Unsubscribe rate | % uitschrijvingen | Alert bij >0.5% |

---

### Workflows
De agent kan bestaande workflows triggeren en nieuwe bouwen.

**Standaard Archer workflows:**
- `new_lead_onboarding` — triggered bij nieuw contact aanmaken via marketing
- `discovery_start` — triggered wanneer prospect start met 7-dagen free trial
- `event_inschrijving_bevestiging` — triggered bij inschrijving op event
- `factuur_herinnering` — triggered 7 dagen na vervaldatum factuur
- `traject_afloop_reminder` — triggered 30 dagen voor einddatum traject

**Workflow opbouw die de agent kan uitvoeren:**
1. Trigger definiëren (contact property wijziging, deal stage update, datum-gebaseerd)
2. Enrollment criteria instellen
3. Acties toevoegen (email versturen, taak aanmaken, eigenaar toewijzen, property updaten)
4. Vertakkingen instellen op basis van condities
5. Activeren na goedkeuring

---

## 2. Standaard HubSpot queries

### Pipeline queries

```javascript
// Alle open deals per eigenaar
{
  filterGroups: [{
    filters: [{
      propertyName: "dealstage",
      operator: "NOT_IN",
      values: ["closedwon", "closedlost"]
    }, {
      propertyName: "hubspot_owner_id",
      operator: "EQ",
      value: "[owner_id]"
    }]
  }],
  sorts: [{ propertyName: "hs_lastmodifieddate", direction: "ASCENDING" }],
  properties: ["dealname", "amount", "dealstage", "closedate", "hs_lastmodifieddate"]
}

// Deals zonder activiteit 7+ dagen
{
  filterGroups: [{
    filters: [{
      propertyName: "hs_lastmodifieddate",
      operator: "LT",
      value: "[7_dagen_geleden_timestamp]"
    }, {
      propertyName: "dealstage",
      operator: "NOT_IN",
      values: ["closedwon", "closedlost"]
    }]
  }]
}

// Forecast berekening
// Som van (amount × sluitingskans) per eigenaar
// Grouped by hubspot_owner_id
// Filtered by closedate <= einde huidige maand
```

### Contact queries

```javascript
// Event-inschrijvingen per event
{
  filterGroups: [{
    filters: [{
      propertyName: "event_inschrijving_[event_naam]",
      operator: "EQ",
      value: "true"
    }]
  }],
  properties: ["firstname", "lastname", "email", "phone", "hubspot_owner_id"]
}

// Duplicaten check
// Contacten met hetzelfde emailadres
{
  filterGroups: [{
    filters: [{
      propertyName: "email",
      operator: "EQ",
      value: "[email_adres]"
    }]
  }]
}

// Membership churn risico
{
  filterGroups: [{
    filters: [{
      propertyName: "traject_type",
      operator: "EQ",
      value: "membership"
    }, {
      propertyName: "traject_einddatum",
      operator: "LT",
      value: "[60_dagen_van_nu]"
    }, {
      propertyName: "hs_lastmodifieddate",
      operator: "LT",
      value: "[30_dagen_geleden]"
    }]
  }]
}
```

### Email queries

```javascript
// Campagne statistieken ophalen
GET /marketing/v3/emails/statistics/list
// Parameters: startTimestamp, endTimestamp, property filters

// Per campagne ophalen:
// - hs_email_sends_count
// - hs_email_open_count
// - hs_email_click_count
// - hs_email_bounce_count
// - hs_email_unsubscribed_count
```

---

## 3. Owner IDs — Archer team

> **Opmerking voor Ward:** Vul de exacte HubSpot owner IDs in per teamlid zodra de infrastructuur staat.

| Persoon | Rol | HubSpot Owner ID |
|---|---|---|
| Bjorn | Founder | TODO |
| Anthony | Founder | TODO |
| Thomas | Accountmanager | TODO |
| Creneua | Accountmanager | TODO |
| Xavier | Accountmanager | TODO |
| Kevin | Mentor | TODO |
| Lennard | Mentor | TODO |
| Nico | Mentor | TODO |
| Jietse | Mentor | TODO |
| Nigel | Mentor | TODO |
| Stijn | Mentor | TODO |
| Wout | Mentor | TODO |
| Armani | Extern | TODO |

---

## 4. Datakwaliteit checks — geautomatiseerd

De HubSpot agent voert dagelijks automatisch deze checks uit:

**Check 1 — Ontbrekende verplichte velden**
Contacten zonder emailadres, telefoonnummer of eigenaar.

**Check 2 — Deals zonder verwachte sluitdatum**
Alle deals waarbij `closedate` leeg is.

**Check 3 — Duplicatendetectie**
Contacten met identiek emailadres of combinatie naam + bedrijf.

**Check 4 — Deals te lang in stage**
Deals die langer dan de toegestane tijd in dezelfde stage staan (zie pipeline hygiëne regels in KPIS.md).

**Check 5 — Verlopen trajecten**
Contacten waarbij `traject_einddatum` verstreken is maar `lifecyclestage` nog op klant staat.

**Outputformaat datakwaliteitsrapport:**
```
🔍 DATAKWALITEIT RAPPORT — [datum]

Ontbrekende velden: X contacten
Deals zonder sluitdatum: X deals
Duplicaten gedetecteerd: X contacten
Pipeline hygiëne alerts: X deals
Verlopen trajecten: X contacten

Details: [lijst per categorie]
Aanbeveling: [actie + verantwoordelijke]
```

---

## 5. Integraties

| Integratie | Status | Beheerd door |
|---|---|---|
| HubSpot ↔ Agent server (MCP) | Actief | Ward |
| HubSpot ↔ Lovable dashboards | TODO — endpoint in te stellen | Ward |
| HubSpot ↔ Billit (facturatie) | TODO — te onderzoeken | Ward + Rha |
| HubSpot ↔ Zoom (call logging) | TODO | Ward |
| HubSpot ↔ Google Drive (transcripts) | Indirect via Supabase | Ward + Victor |

---

*Dit bestand definieert de technische expertise van de HubSpot agent. Aanpassen via pull request — alleen Bjorn of Ward kan mergen.*
