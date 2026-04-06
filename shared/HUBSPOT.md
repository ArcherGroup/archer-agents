# HUBSPOT.md — Archer CRM Structuur

> HubSpot is de enige bron van waarheid voor klanten, deals en pipeline data.
> Dit bestand beschrijft hoe HubSpot bij Archer is opgebouwd zodat elke agent weet waar te zoeken.

## WAT IS EEN ACTIEVE KLANT?

Een klant = een deal in HubSpot in een actieve "Won" stage.
Totaal actief: ~358 klanten verdeeld over 3 trajecten.

## DE 3 TRAJECTEN

| Traject | Prijs | Klanten | Duur |
|---|---|---|---|
| 1-op-1 Coaching | €25.000 | ~105 | 12 maanden |
| Mentorship | €10.000 | ~113 | 12 maanden |
| Membership | €2.500/jaar | ~140 | 12 maanden |

## ACTIEVE KLANTEN — gebruik deze stage IDs

Won - Confirmation: 1991865554
Won - Send Invoice: 63137748
Won - Invoice Sent: 157726961
Won - Invoice Paid: 1134715080
Won - Deal Active: 63137244
Won - Deal Active (Renewal): 63247584
Won - Invoice Paid (Renewal): 1134715084
Won - Deal Active (MM): 5015150795
Won - Invoice Paid (MM): 5015150793

## DE 4 PIPELINES

### SUBSCRIPTIONS - NEW (ID: 19062760)
New Opportunity: 74045115
Discovery / 7d Trial: 4957683955
Meeting Scheduled: 582710757
Aanwezig op workshop: 4977533139
In Consideration: 66985972
Won - Confirmation: 1991865554
Won - Send Invoice: 63137748
Won - Invoice Sent: 157726961
Won - Invoice Paid: 1134715080
Won - Deal Active: 63137244
Won - Deal Expired: 1239721201
Lost - No Deal: 63137245

### SUBSCRIPTIONS - RENEWAL (ID: 19062984)
Up For Renewal: 67650809
Attempting: 1513597170
Won - Send Invoice (Renewal): 63247583
Won - Invoice Sent (Renewal): 157620964
Won - Invoice Paid (Renewal): 1134715084
Won - Deal Active (Renewal): 63247584
Won - Deal Expired (Renewal): 1240241362
Lost - No Renewal: 63247585

### MASTERCLASSES (ID: 2042063085)
New Opportunity (MC): 2803756220
VP intake ontvangen: 5073827008
Workshop / Event: 2803756222
Meeting Scheduled (MC): 2803756221
In Consideration (MC): 2804284646
Won - Confirmation (MC): 2803756223
Won - Send Invoice (MC): 2803756225
Won - Invoice Sent (MC): 2804286682
Won - Invoice Paid (MC): 2803756226
Won - Deal Closed (MC): 2804284647
Lost - No Deal (MC): 2803756224

### MASTERMIND (ID: 3534694613)
New Opportunity (MM): 4839599353
Meeting Scheduled (MM): 4839600314
In Consideration (MM): 4839600316
Won - Confirmation (MM): 4839600318
Won - Send Invoice (MM): 5015150790
Won - Invoice Sent (MM): 5015150791
Won - Invoice Paid (MM): 5015150793
Won - Deal Active (MM): 5015150795
Won - Deal Expired (MM): 5015150796
Lost - No Deal (MM): 4839600317

## RENEWAL PIPELINE

Klanten in renewal = deals in:
- Up For Renewal: 67650809
- Attempting: 1513597170

## VERLOREN / VERLOPEN — nooit meenemen als actieve klant

Lost - No Deal: 63137245
Lost - No Renewal: 63247585
Lost - No Deal (MC): 2803756224
Lost - No Deal (MM): 4839600317
Won - Deal Expired: 1239721201
Won - Deal Expired (Renewal): 1240241362
Won - Deal Expired (MM): 5015150796

## ZOEKREGELS VOOR AGENTS

- Dealname = naam van de klant
- hubspot_owner_id = verantwoordelijke mentor of salesperson
- Closedate = verwachte einddatum van het traject
- Actieve klanten = alle Won stages exclusief Expired en Lost
- Totaal ~358 actieve klanten — gebruik dit als referentie
