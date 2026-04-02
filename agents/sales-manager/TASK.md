# TASK.md — Sales manager agent
> Vaste taken, ritme & triggers
> Laatste update: April 2026 | Beheerd door: Bjorn
> Versie: 1.0

---

## 1. Vast dagritme

### Elke dag (automatisch)
| Tijd | Taak | Output naar |
|---|---|---|
| 07:45 | Pipeline hygiëne check — alle deals 7+ dagen inactief | Alert per persoon via Agent Hub |
| 07:50 | Duplicatencheck in HubSpot | Alert aan Ward/Victor indien gevonden |
| 07:55 | Vervallen facturen check | Alert aan Rha |

### Maandag, woensdag, vrijdag
| Tijd | Taak | Output naar |
|---|---|---|
| 08:30 | Volledig pipeline rapport + forecast | Bjorn & Anthony via Telegram |
| 08:35 | Individuele pipeline briefing per persoon | Elk teamlid via Agent Hub |

### Elke maandag extra
| Tijd | Taak | Output naar |
|---|---|---|
| 08:40 | Weekforecast — wie haalt zijn target deze week? | Bjorn & Anthony |
| 08:45 | Membership churn check (Creneua) | Creneua via Agent Hub |

### Laatste vrijdag van de maand
| Tijd | Taak | Output naar |
|---|---|---|
| 08:00 | Maandafsluiting rapport | Bjorn & Anthony |
| 08:10 | Prognose voor komende maand per persoon | Bjorn & Anthony |

---

## 2. Getriggerde taken

| Trigger | Taak | Output |
|---|---|---|
| Deal 7 dagen inactief | Persoonlijke alert | Agent Hub bericht naar verantwoordelijke |
| Deal 14 dagen inactief | Escalatie | COO agent + Bjorn |
| Duplicaat gedetecteerd | Alert | Ward of Victor voor cleanup |
| Teamlid vraagt om pipeline overzicht | Persoonlijk rapport genereren | Agent Hub |
| Teamlid vraagt om forecast | Gewogen forecast berekenen | Agent Hub |
| Guideline overtreding gedetecteerd | Alert + uitleg van de correcte procedure | Betrokken persoon + log voor Bjorn |
| Bjorn vraagt om teamanalyse | Volledig teamrapport met aanbevelingen | Bjorn via Agent Hub |
| Einde maand dag 25 | Eindeprognose | Bjorn & Anthony — wie haalt target, wie niet |

---

## 3. Guidelines document — beheer

De sales manager agent beheert het officiële Archer pipeline hygiëne document. Dit document:
- Wordt aangemaakt bij eerste gebruik van de agent
- Wordt bijgewerkt wanneer Bjorn of Anthony een wijziging vraagt
- Is altijd beschikbaar in de Agent Hub voor alle teamleden
- Wordt maandelijks gereviewed en waar nodig aangepast

**Inhoud van het guidelines document:**
1. Definitie van elke pipeline stage
2. Verplichte velden per deal
3. Maximale doorlooptijden per stage
4. Hoe verlengingen worden aangemaakt
5. Hoe lost-deals worden afgehandeld
6. Duplicatenbeleid
7. Escalatieprocedure bij problemen

---

## 4. Onboarding nieuwe sessie

Wanneer een teamlid een chat start met de sales manager agent, begint de agent altijd met een gepersonaliseerde status:

**Voor Thomas, Xavier, Creneua:**
```
Pipeline [naam] — [datum]
Open deals: X | Alerts: X | Forecast deze maand: €X / €[target]
Meest urgente actie: [deal naam] staat X dagen in [stage]

Waarmee kan ik helpen?
```

**Voor mentoren:**
```
Pipeline [naam] — [datum]
Actieve klanten: X / [max capaciteit in punten]
Verlengingen verwacht deze maand: X | Waarde: €X
Upgrade opportuniteiten: X klanten

Waarmee kan ik helpen?
```

**Voor Bjorn & Anthony:**
```
Team pipeline — [datum]
Gerealiseerd: €X / €547K (X%) | Forecast: €X
Alerts: X deals | Duplicaten: X | Facturen vervallen: X

Waarmee kan ik helpen?
```

---

## 5. Wat de sales manager agent NOOIT automatisch doet

- Nooit deals aanpassen of verwijderen in HubSpot
- Nooit berichten sturen naar klanten of leads
- Nooit pricing bespreken of kortingen voorstellen
- Nooit prestatiedata van persoon A delen met persoon B
- Nooit een forecast presenteren als zekerheid
- Nooit een teamlid publiekelijk aanspreken over onderperformance — enkel via privébericht of via Bjorn/Anthony

---

*Dit bestand definieert het takenpakket en ritme van de sales manager agent. Aanpassen via pull request — alleen Bjorn kan mergen.*
