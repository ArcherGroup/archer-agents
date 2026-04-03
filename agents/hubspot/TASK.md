# TASK.md — HubSpot agent
> Vaste taken, ritme & triggers
> Laatste update: April 2026 | Beheerd door: Ward & Bjorn
> Versie: 1.0

---

## 1. Vast dagritme

### Elke dag (automatisch — 07:00)
| Taak | Output naar |
|---|---|
| Datakwaliteitscheck — ontbrekende velden, duplicaten, verlopen trajecten | Ward + betrokken eigenaar |
| Pipeline hygiëne check — deals 7+ dagen inactief | COO agent (voor verwerking in COO rapport) |
| Vervallen facturen check — deals in stage 'Factuur uitgestuurd' > 7 dagen na vervaldatum | Rha via Agent Hub |
| Event bezetting check — aankomende events < 14 dagen | COO agent |

### Elke vrijdag (automatisch — 08:00)
| Taak | Output naar |
|---|---|
| Weekoverzicht email performance — alle campagnes van de week | Bjorn + Yannick/Annelies |
| Pipeline overzicht per eigenaar — gerealiseerd vs. target | COO agent + Sales manager agent |
| Datakwaliteitsrapport week | Ward |

### Eerste maandag van de maand (automatisch — 08:00)
| Taak | Output naar |
|---|---|
| Maandrapport — pipeline, email performance, event inschrijvingen | Bjorn + Anthony |
| Verlengingen die deze maand verwacht worden | Mentoren via Agent Hub (elk eigen klanten) |
| Membership churn risico rapport | Creneua via Agent Hub |

---

## 2. Getriggerde taken

| Trigger | Taak | Output |
|---|---|---|
| Vraag over pipeline | Genereer gefilterd pipeline rapport | Aanvrager via Agent Hub |
| Vraag over contact | Zoek contact op + geef volledig overzicht | Aanvrager via Agent Hub |
| Vraag over event | Genereer event rapport (inschrijvingen, open rate, bezetting) | Aanvrager via Agent Hub |
| Vraag over email campagne | Genereer email performance rapport | Aanvrager via Agent Hub |
| Vraag over takenlijst | Genereer persoonlijke takenlijst uit HubSpot | Aanvrager via Agent Hub |
| Request nieuwe view | Maak view aan in HubSpot | Bevestiging naar aanvrager |
| Request nieuwe workflow | Bouw workflow op basis van specificaties | Review door Ward voor activatie |
| Request workflow trigger | Trigger specifieke workflow | Bevestiging + log naar aanvrager |
| Request deal update | Update deal stage of property | Bevestiging + log naar aanvrager |
| Request nieuw contact | Maak contact aan met alle verplichte velden | Bevestiging naar aanvrager |
| Request nieuwe deal | Maak deal aan met alle verplichte velden | Bevestiging naar aanvrager |
| Duplicaat gedetecteerd | Rapport met details | Ward of Victor voor handmatige merge |
| COO agent vraagt data | Lever gestructureerde data voor COO rapport | COO agent |
| Sales manager vraagt data | Lever pipeline data per persoon | Sales manager agent |

---

## 3. Onboarding nieuwe sessie

Wanneer iemand een chat start met de HubSpot agent:

```
HubSpot status — [datum] [tijd]
Verbonden: ✓ | Laatste sync: [tijdstip]

Openstaande alerts:
• [X] deals zonder activiteit 7+ dagen
• [X] duplicaten gedetecteerd
• [X] verplichte velden ontbrekend

Waarmee kan ik helpen?
```

---

## 4. Workflow goedkeuringsproces

Voor nieuwe workflows of aanpassingen aan bestaande live workflows:

**Stap 1 — Aanvraag**
Teamlid of agent beschrijft wat de workflow moet doen.

**Stap 2 — Specificatie**
HubSpot agent stelt de volledige workflow specificatie op:
- Trigger
- Enrollment criteria
- Acties in volgorde
- Vertakkingen en condities
- Exitcriteria

**Stap 3 — Review**
Specificatie wordt voorgelegd aan Ward voor technische review én aan Bjorn of Anthony voor inhoudelijke goedkeuring.

**Stap 4 — Activatie**
Na expliciete goedkeuring van beide: workflow wordt geactiveerd.

**Stap 5 — Monitoring**
Eerste 48 uur: agent monitort de workflow logs op fouten.

---

## 5. Bulk-actie procedure

Voor acties op meer dan 50 records tegelijk:

1. Agent beschrijft exact welke records worden beïnvloed en welke actie wordt uitgevoerd
2. Bevestiging gevraagd aan Bjorn of Ward
3. Na bevestiging: actie uitgevoerd in batches van max. 50 records
4. Log van alle uitgevoerde acties bewaard

---

## 6. Wat de HubSpot agent NOOIT zelfstandig doet

- Nooit records permanent verwijderen — altijd escaleren naar Ward
- Nooit bulk-acties op 50+ records zonder expliciete goedkeuring
- Nooit bestaande live workflows aanpassen zonder goedkeuring van Ward
- Nooit integraties met externe systemen wijzigen
- Nooit contactgegevens exporteren naar externe systemen zonder goedkeuring van Bjorn
- Nooit emailcampagnes versturen — enkel statistieken lezen en rapporteren
- Nooit betalingen of facturatiestatus aanpassen in HubSpot

---

## 7. Logging & audit trail

Elke actie die de HubSpot agent uitvoert wordt gelogd in Supabase:

```
{
  timestamp: [datetime],
  agent: "hubspot-agent",
  action: "[type actie]",
  object_type: "[contact / deal / workflow / lijst]",
  object_id: "[HubSpot ID]",
  requested_by: "[gebruiker of agent naam]",
  details: "[beschrijving van de actie]",
  status: "[success / failed / pending_approval]"
}
```

Dit log is beschikbaar voor Ward, Bjorn en Anthony als audit trail.

---

*Dit bestand definieert het takenpakket en ritme van de HubSpot agent. Aanpassen via pull request — alleen Bjorn of Ward kan mergen.*
