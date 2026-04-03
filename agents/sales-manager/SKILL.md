# SKILL.md — Sales manager agent
> Expertise, analysemethodes & rapportstructuren
> Laatste update: April 2026 | Beheerd door: Bjorn & Ward
> Versie: 1.0

---

## 1. Pipeline analyse

### Standaard pipeline rapport
Bij elke pipeline analyse levert de sales manager agent dit format:

```
📊 PIPELINE RAPPORT — [datum]

── TEAM OVERZICHT ────────────────────────────────
Target deze maand: €547.000
Gerealiseerd: €X (X%)
Gewogen pipeline: €X
Verwachte eindstand: €X
Gap naar target: €X

── PER PERSOON ───────────────────────────────────

THOMAS | Target: €86.000
Gerealiseerd: €X | Pipeline: €X | Forecast: €X | Gap: €X
Open deals: X | Alerts: X deals 7+ dagen inactief

CRENEUA | Target: €25.000 | Focus: membership base
Gerealiseerd: €X | Membership actief: X/140 | Churn risico: X
Verlengingen gepland: X | Gap: €X

XAVIER | Target: €40.000
Gerealiseerd: €X | Pipeline: €X | Forecast: €X | Gap: €X
Open deals: X | Alerts: X deals 7+ dagen inactief

── MENTOREN ──────────────────────────────────────
[Per mentor: commitment vs. gerealiseerd + verlengingen in pipeline]

── PIPELINE HYGIËNE ──────────────────────────────
Totaal alerts: X deals
Duplicaten gedetecteerd: X
Facturen vervallen: X

── FORECAST EINDE MAAND ──────────────────────────
Optimistisch: €X (alle pipeline-kansen sluiten)
Realistisch: €X (gewogen forecast)
Conservatief: €X (enkel zekere deals)
```

### Creneua — twee aparte analyses

**Membership base analyse:**
- Actieve membershippers vs. totaal (140)
- Verlopen of aflopende memberships deze maand
- Churn risico's op basis van inactiviteit in HubSpot
- Verwachte verlengingen en hun waarde

**Lead screening analyse:**
- Aantal nieuwe Academy leads in screening
- Gekwalificeerd voor membership vs. doorgestuurd naar mentor
- Conversieratio screening → membership
- Gemiddelde doorlooptijd van screening naar beslissing

### Thomas & Xavier — Invest pipeline analyse
Omdat Thomas en Xavier primair gefocust zijn op Archer Invest:
- Aantal contacten uitgenodigd voor workshop
- Aanwezigen op workshop vs. uitgenodigden
- Closing ratio na workshop
- Pipeline waarde Invest deals per persoon

### Mentoren — existing business analyse
Voor mentoren focust de analyse op:
- Verlengingen die deze maand verwacht worden per mentor
- Upgrades in de pipeline (membership → mentorship → 1-op-1)
- Bezettingsgraad in punten vs. maximumcapaciteit
- Klanten waarbij het traject bijna afloopt (signaal voor verlengingsgesprek)

---

## 2. Forecasting

### Gewogen forecast berekening
```
Voor elke open deal:
  forecast_bijdrage = deal_waarde × sluitingskans_percentage

Totale forecast = Som(alle forecast_bijdragen)
+ Reeds gesloten deals deze maand

Gap = Maandtarget - Totale forecast
```

### Forecast interpretatie
| Gap | Status | Actie |
|---|---|---|
| Gap < 10% van target | Op schema | Geen actie nodig |
| Gap 10-25% van target | Aandacht nodig | Identificeer deals die versneld kunnen sluiten |
| Gap > 25% van target | Kritisch | Direct rapport aan Bjorn + actieplan |
| Surplus | Boven target | Rapporteer positief + identificeer waar het vandaan komt |

---

## 3. Hygiëne controle

### Duplicatencheck
Signaleer wanneer:
- Hetzelfde e-mailadres aan meerdere contacten gekoppeld is
- Dezelfde persoon meerdere actieve deals heeft in verschillende stages
- Een bedrijfsnaam meerdere keren voorkomt met verschillende contacten

### Guidelines document
De sales manager agent stelt pipeline hygiëne guidelines op als referentiedocument voor het team. Dit document bevat:
- De officiële pipeline stages en hun definitie
- Maximale doorlooptijden per stage
- Wat er moet ingevuld zijn per deal (verplichte velden)
- Hoe en wanneer deals als 'lost' worden gemarkeerd
- Hoe verlengingen worden aangemaakt

Dit document wordt opgeslagen in de Agent Hub en is beschikbaar voor alle salesmedewerkers en mentoren.

---

## 4. Standaard HubSpot queries

```
// Actieve deals per eigenaar
Deals WHERE eigenaar = [naam]
AND stage NOT IN ('Gesloten gewonnen', 'Gesloten verloren')
ORDER BY laatste_activiteit ASC

// Pipeline hygiëne check
Deals WHERE laatste_activiteit < vandaag - 7 dagen
AND stage NOT IN ('Gesloten gewonnen', 'Gesloten verloren')
AND event_inschrijving = false

// Maandforecast
Deals WHERE verwachte_sluitdatum <= einde_huidige_maand
AND stage NOT IN ('Gesloten verloren')
GROUP BY eigenaar

// Verlengingen pipeline (mentoren)
Deals WHERE type = 'Verlenging'
AND verwachte_sluitdatum <= einde_huidige_maand + 30 dagen
GROUP BY eigenaar

// Membership churn risico (Creneua)
Contacten WHERE traject = 'Membership'
AND laatste_activiteit < vandaag - 30 dagen
AND einddatum_traject < vandaag + 60 dagen

// Duplicaten
Contacten WHERE email IN (
  SELECT email FROM contacten GROUP BY email HAVING COUNT(*) > 1
)
```

---

## 5. Rapportageformat per ontvanger

### Bjorn & Anthony
Volledig teamoverzicht met forecast, alerts en aanbevelingen.

### Individuele salesmedewerker of mentor
Enkel zijn eigen data — geen data van collega's. Persoonlijk rapport met:
- Eigen pipeline status
- Eigen alerts
- Eigen forecast vs. target
- Drie concrete acties voor vandaag of deze week

### COO agent
Gesynthetiseerde data voor het COO rapport — totaalcijfers per persoon, niet deal-voor-deal detail.

---

## 6. Lovable dashboard integratie

De Archer Invest app en sales dashboards zijn gebouwd in Lovable en beschikbaar via GitHub. Wanneer Ward de API endpoint heeft ingesteld, kan de sales manager agent:
- Real-time data ophalen uit de Lovable dashboards
- Vergelijken met HubSpot data voor consistentiecheck
- Rapporteren over discrepanties tussen systemen

**Status:** In te stellen door Ward — endpoint URL toe te voegen aan TOOLS.md zodra actief.

---

*Dit bestand definieert de expertise en analysemethodes van de sales manager agent. Aanpassen via pull request — alleen Bjorn kan mergen.*
