# PROCESSES.md
> Werkprocessen & salesflows — geldig voor alle Archer agents
> Laatste update: April 2026 | Beheerd door: Bjorn
> Vul aan per afdeling naarmate processen verder worden geformaliseerd

---

## 1. Salesflows — overzicht

Archer heeft twee hoofdcategorieën van salesflows:
- **New business** — een nieuw contact dat nog geen klant is
- **Existing business** — een bestaande klant die verlengt of upgradet

Binnen new business zijn er twee instroombronnen:
- **Eigen netwerk / referrals / word of mouth / events**
- **Marketing (Discovery via ads)**

---

## 2. New Business — Archer Academy

### 2A. Instroom via eigen netwerk, referrals of word of mouth

```
Nieuw contact
      ↓
New Opportunity aangemaakt in HubSpot
      ↓
Inchecken: gekwalificeerd?
      ↓
    ┌─────────────────────────────────┐
    │                                 │
Discovery (7 dagen free trial)    Uitnodigen op event
    │                                 │
    ↓                                 ↓
Ervaring goed?              Event bijgewoond?
    │                                 │
    ↓                                 ↓
1-op-1 gesprek met mentor   1-op-1 gesprek met mentor
    │                                 │
    ↓                                 ↓
Mentor closet gesprek
      ↓
    ┌──────────────┐
    │              │
   JA             NEE
    │              │
Factuur uit     Lost / No deal
    │
    ↓
Betaling ontvangen
    │
    ↓
Klant actief in traject
```

**Betrokkenen:** Mentor in kwestie (op basis van beschikbare punten)
**Verantwoordelijke voor kwalificatie:** Mentor of salesteam afhankelijk van herkomst
**Afsluiting:** Mentor

---

### 2B. Instroom via Marketing (Discovery flow)

```
Lead via Marketing (ad, social, podcast)
      ↓
Discovery aangevraagd (7 dagen free trial)
      ↓
Renault (eerste lijn) neemt contact op
      ↓
Kwalificatie door Renault:
    ┌─────────────────────────────────────┐
    │                                     │
Voldoende kapitaal?                  Beperkt budget?
→ Kandidaat voor 1-op-1 of mentorship  → Membership (€2.500)
    │                                     │
    ↓                                     ↓
1-op-1 gesprek                     Direct naar membership flow
met beschikbare mentor                    │
    │                                     ↓
    ↓                               Factuur uit → Betaling
Mentor closet gesprek                     │
    │                                     ↓
    ↓                               Klant actief
  JA → Factuur uit → Betaling
  NEE → Lost / No deal
```

**Betrokkenen:**
- Renault: eerste lijn kwalificatie en warm-up
- Mentor: closing gesprek voor 1-op-1 en mentorship
- Salesteam: ondersteuning indien nodig

**Kritisch beslismoment:** Renault bepaalt of een lead naar membership of naar mentorgesprek gaat op basis van beschikbaar kapitaal en profiel.

---

## 3. New Business — Archer Invest (Vierdaagse)

```
Nieuw contact (netwerk, marketing, referral)
      ↓
Thomas belt contact op voor uitnodiging workshop
      ↓
Contact neemt deel aan Invest Workshop
(maandelijks, laatste donderdag, Archer kantoor)
      ↓
Workshop gegeven door Anthony
      ↓
Na workshop: closing gesprek
    ┌──────────────────────────────┐
    │                              │
Beslissen ter plaatse         Gesprek nadien
    │                         (Thomas of Xavier)
    │                              │
    ↓                              ↓
         Inschrijving Vierdaagse
              ↓
         Factuur uit (€8.650 excl. btw)
              ↓
         Betaling ontvangen
              ↓
         Deelnemer bevestigd voor editie
```

**Betrokkenen:**
- Thomas: prospectie en uitnodiging voor workshop
- Anthony: geeft de workshop
- Thomas + Xavier: closing na workshop
- Mentoren: ondersteunen in mindere mate

**Opmerking:** De workshop fungeert als kwalificatie- én conversiemoment tegelijk. Leads die de workshop bijwonen zijn al warm — de closing is een bevestiging, geen koude verkoop.

---

## 4. New Business — Archer Fonds

- Fonds-investeerders komen typisch via de Academy of Invest als vertrouwen is opgebouwd
- Geen koude acquisitie voor het Fonds
- Minimale instap: €100.000
- Flow: TODO — verder te formaliseren door Bjorn en Anthony

---

## 5. Existing Business — verlenging & upgrade

### Verlenging van traject

```
Lopend traject nadert einde
      ↓
Mentor heeft wekelijks of maandelijks contact met klant
      ↓
Mentor signaleert moment voor verlengingsgesprek
      ↓
Klant uitgenodigd op kantoor
      ↓
Mentor doet verlengingsverzoek in persoonlijk gesprek
      ↓
    ┌──────────────┐
    │              │
   JA             NEE
    │              │
Factuur uit     Churn — klant stopt
    │
    ↓
Betaling → Traject verlengd
```

### Upgrade van traject (bv. membership → mentorship → 1-op-1)

```
Mentor observeert groei en potentieel bij klant
      ↓
Mentor signaleert upgrade-opportuniteit
(tijdens wekelijkse of maandelijkse call)
      ↓
Klant uitgenodigd op kantoor voor gesprek
      ↓
Mentor presenteert voordelen van hoger traject
      ↓
    ┌──────────────┐
    │              │
   JA             NEE
    │              │
Factuur uit     Klant blijft in huidig traject
    │
    ↓
Betaling → Upgrade actief
```

**Betrokkenen:** Mentor van de klant
**Initiatief:** Altijd bij de mentor — proactief, niet reactief
**Locatie:** Fysiek op kantoor waar mogelijk

---

## 6. HubSpot pipeline stages

Op basis van de salesflows zijn dit de verwachte pipeline stages in HubSpot:

| Stage | Omschrijving |
|---|---|
| New Opportunity | Nieuw contact, nog niet gekwalificeerd |
| Gekwalificeerd | Contact is gecheckt, klaar voor volgende stap |
| Discovery actief | Klant doet 7-dagen free trial |
| Event uitgenodigd | Contact heeft uitnodiging ontvangen voor workshop/event |
| Event bijgewoond | Contact heeft event of workshop bijgewoond |
| Gesprek gepland | 1-op-1 gesprek met mentor ingepland |
| Gesprek gehad | Mentor heeft closing gesprek gevoerd |
| Factuur uitgestuurd | Deal gesloten, factuur verstuurd |
| Betaling ontvangen | Klant actief |
| Lost / No deal | Contact heeft afgehaakt |

**Pipeline hygiëne regel:** Een deal die 7+ dagen in dezelfde stage staat zonder activiteit triggert een alert.
**Uitzondering:** Als een contact ingeschreven is op een event, is tolerantie tot 3 weken.

---

## 7. Overige processen (nog verder te formaliseren)

De volgende processen bestaan operationeel maar zijn nog niet volledig gedocumenteerd. Dit zijn TODO's voor het team:

| Proces | Verantwoordelijke | Status |
|---|---|---|
| Onboarding nieuwe Academy klant | Mentor + Sophie | TODO |
| Onboarding nieuwe Fonds investeerder | Bjorn + Rha | TODO |
| Event organisatie flow (intern) | Sophie | TODO |
| Invest Vierdaagse logistiek | Sophie + Thomas | TODO |
| Mentor onboarding (nieuw teamlid) | Bjorn + Anthony | TODO |
| Klachtenafhandeling | TODO | TODO |
| Facturatie & betalingsopvolging | Rha | TODO |
| Rapportage klantresultaten | Mentoren | TODO |

---

*Dit document is de procesreferentie voor alle Archer agents. Salesflows zijn leidend voor de sales manager en sales trainer agents. TODO-items worden aangevuld door de betrokken teamleden.*
