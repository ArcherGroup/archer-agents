# INTEGRATION.md — Paid advertising agent
> Koppeling tussen archer-media-agent en de Archer Agent Hub
> Laatste update: April 2026 | Beheerd door: Ward & Bjorn
> Versie: 1.0

---

## 1. Context

De paid advertising agent is volledig geconfigureerd in de `media-agent/` submap van de repo.
De volledige CLAUDE.md en TASK.md zijn beschikbaar in die map.
Dit document beschrijft hoe de paid advertising agent integreert met de rest van het Archer agent ecosysteem.

---

## 2. Positie in het agent ecosysteem

```
CEO agent
    ↓ (strategische groeivragen over ads)
Paid advertising agent
    ↓ (funnel data)          ↓ (lead data)
HubSpot agent           COO agent
    ↓                       ↓
Sales manager           Weekplanning
```

---

## 3. Databronnen die de paid agent deelt

### Naar de COO agent
De paid advertising agent levert wekelijks gestructureerde data aan de COO agent:

```
{
  week: "[weeknummer]",
  spend: { meta: X, youtube: X, total: X },
  bookings: X,
  cpa: X,
  bottleneck: "[funnelstap met grootste drop-off]",
  alerts: ["[alert 1]", "[alert 2]"]
}
```

### Naar de HubSpot agent
Bij elke nieuwe geboekte call via paid traffic:
- Deal aanmaken in HubSpot pipeline stage "Call geboekt"
- UTM parameters meegeven als deal properties
- Lead kwalificatieantwoorden meegeven
- Traffic source markeren als "Paid — Meta" of "Paid — YouTube"

### Naar de CEO agent
Maandelijks strategisch overzicht:
- MER (Marketing Efficiency Ratio)
- CAC per gesloten deal
- Funnelconversieratio's
- Creative performance trends
- Aanbevelingen voor budgetschaling

---

## 4. Toegangsrechten in de Agent Hub

| Gebruiker | Toegang tot paid advertising agent |
|---|---|
| Bjorn | Volledig — strategisch + operationeel |
| Anthony | Volledig — review en goedkeuring |
| Yannick | Operationeel — dagelijkse rapportages, creative briefs |
| Annelies | Operationeel — dagelijkse rapportages, creative briefs |
| Ward | Technisch — tracking setup, API configuratie |
| Victor | Technisch — tracking setup, integraties |
| Overige teamleden | Geen toegang |

---

## 5. Goedkeuringsflow via Telegram

De paid advertising agent vraagt goedkeuring via Telegram voor:
- Nieuwe campagne lanceren
- Budget verhogen of verlagen > 20%
- Campagne of ad set pauzeren
- Nieuwe targeting strategie

**Goedkeuringschain:**
1. Agent stuurt voorstel naar Bjorn via Telegram
2. Bjorn antwoordt JA of NEE
3. Bij JA: agent voert uit en logt de actie
4. Bij NEE: agent logt de weigering en stelt alternatief voor

---

## 6. Rapportageintegratie

| Rapport | Frequentie | Ontvangers | Via |
|---|---|---|---|
| Dagelijks ads briefing | Dagelijks 08:00 | Bjorn | Telegram |
| Wekelijks performance | Maandag 09:00 | Bjorn + Yannick/Annelies | Telegram + Agent Hub |
| Funnel rapport | Maandag 09:00 | Bjorn + Anthony | Agent Hub |
| Maandelijks strategisch | Eerste maandag maand | Bjorn + Anthony + CEO agent | Agent Hub |

---

## 7. Geheimen en credentials

De paid advertising agent gebruikt volledig gescheiden credentials van de andere agents.
Alle secrets hebben het prefix `MEDIA_` in GitHub Actions.

**Nooit** de Meta of Google Ads credentials delen met andere agents.
**Nooit** HubSpot of Supabase credentials gebruiken vanuit de `media-agent/` submap — alleen via de HubSpot agent.

---

## 8. Wat nog gebouwd moet worden — checklist Ward

- [ ] Tracking fase 1: Meta events via GTM implementeren
- [ ] Tracking fase 1: CAPI server-side configureren
- [ ] Tracking fase 1: GA4 events instellen
- [ ] HubSpot pipeline aanmaken: "Paid Traffic Funnel" (zie TASK.md fase 6)
- [ ] HubSpot custom deal properties aanmaken (zie TASK.md fase 6)
- [ ] Webhook instellen: application form → HubSpot deal aanmaken
- [ ] Telegram bot koppelen aan paid agent
- [ ] GitHub Actions secrets instellen (prefix MEDIA_)
- [ ] Lovable: VSL pagina bouwen per product
- [ ] Lovable: Application funnel bouwen
- [ ] Lovable: Booking bevestigingspagina bouwen
- [ ] Meta Ad Account ID, Pixel ID doorgeven aan Ward
- [ ] Google Ads Customer ID doorgeven aan Ward

---

## 9. Snelreferentie — key metrics

| Metric | Target | Alarm |
|---|---|---|
| CPA (cost per call booking) | < €200 | > €300 |
| CTR | > 1,5% | < 0,8% |
| Hook rate | > 30% | < 20% |
| Landing page CVR | > 3% | < 1,5% |
| Show-up rate | > 65% | < 50% |
| Close rate | > 20% | < 12% |
| CAC (cost per deal) | < €1.500 | > €2.500 |

---

*Dit bestand koppelt de paid advertising agent aan het bredere Archer agent ecosysteem. De volledige agent configuratie staat in `media-agent/CLAUDE.md` en `media-agent/TASK.md`.*
