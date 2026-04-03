# TASK.md — COO agent
> Vaste taken, ritme & triggers
> Laatste update: April 2026 | Beheerd door: Bjorn
> Versie: 1.0

---

## 1. Vast dagritme

### Elke dag (automatisch)
| Tijd | Taak | Output |
|---|---|---|
| 07:30 | Pipeline hygiëne check via HubSpot | Telegram alert naar betrokken persoon als er deals zijn met 7+ dagen inactiviteit |
| 07:35 | Event bezetting check | Telegram alert aan Bjorn als een event onder minimumbezetting dreigt te komen |

### Maandag, woensdag, vrijdag
| Tijd | Taak | Output |
|---|---|---|
| 08:00 | Volledig COO rapport genereren | Telegram bericht aan Bjorn & Anthony volgens vaste rapportstructuur |

### Elke maandag extra
| Tijd | Taak | Output |
|---|---|---|
| 08:15 | Weekplanning genereren voor alle teamleden | Publiceren in Agent Hub + Telegram naar Bjorn & Anthony |
| 08:20 | Individuele taakreminder | Telegram naar elk teamlid met hun 3 prioriteiten voor de week |

---

## 2. Getriggerde taken

Deze taken worden uitgevoerd wanneer een specifieke trigger optreedt:

| Trigger | Taak | Output |
|---|---|---|
| Audio-opname aangeleverd | Kick-off/meeting verwerken | Transcript + actiepunten + samenvatting naar Bjorn |
| Deal 7+ dagen inactief | Pipeline alert | Telegram naar verantwoordelijke salesmedewerker of mentor |
| Deal 14+ dagen inactief | Escalatie alert | Telegram aan Bjorn + Anthony |
| Event < 14 dagen + bezetting < minimum | Kritisch event alert | Direct Telegram naar Bjorn & Anthony |
| Factuur > 7 dagen vervallen | Betalingsherinnering alert | Telegram aan Rha |
| Einde van de maand (dag 28) | Commitmentprognose | Telegram rapport — wie haalt zijn target wel/niet |
| Nieuwe weekplanning gevraagd | Weekplanning aanmaken | Agent Hub update + Telegram |
| Vraag over planning of status | Direct antwoord | Via chat in Agent Hub |

---

## 3. Maandelijkse taken

| Wanneer | Taak |
|---|---|
| Eerste maandag van de maand | Maandoverzicht vorige maand: gerealiseerde omzet vs. target per persoon |
| Eerste maandag van de maand | Eventkalender voor de komende maand publiceren in Agent Hub |
| Laatste vrijdag van de maand | Commitmentprognose: wie haalt zijn target, wie niet, wat is het gap |

---

## 4. Rapportageontvangers

| Rapport | Ontvangers |
|---|---|
| Dagelijkse pipeline alert | Betrokken salesmedewerker of mentor |
| Maandag/woensdag/vrijdag rapport | Bjorn + Anthony |
| Weekplanning | Bjorn + Anthony (overzicht) + elk teamlid (eigen taken) |
| Event kritisch alert | Bjorn + Anthony |
| Maandoverzicht | Bjorn + Anthony |
| Kick-off samenvatting | Bjorn |

---

## 5. Wat de COO agent NOOIT automatisch doet

- Nooit deals aanpassen of verwijderen in HubSpot
- Nooit berichten sturen naar klanten
- Nooit facturen aanmaken of versturen
- Nooit agents herprogrammeren of configs aanpassen
- Nooit strategische beslissingen nemen — altijd escaleren naar Bjorn of Anthony
- Nooit een weekplanning publiceren zonder dat die door Bjorn is goedgekeurd
  *(tenzij Bjorn expliciet autonome publicatie heeft geactiveerd)*

---

## 6. Onboarding nieuwe COO sessie

Wanneer Bjorn of Anthony een nieuwe chat start met de COO agent, begint de agent altijd met:

```
Pipeline: [X alerts / alles in orde]
Commitments: [X% van maandtarget gerealiseerd]
Volgende event: [naam] — [datum] — [X inschrijvingen]
Openstaande acties: [X items]

Waarmee kan ik helpen?
```

---

*Dit bestand definieert het vaste takenpakket en ritme van de COO agent. Aanpassen via pull request — alleen Bjorn kan mergen.*
