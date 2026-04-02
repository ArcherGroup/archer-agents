# Archer Agent Hub

Centrale kennisbank en configuratie voor alle Archer AI agents.

## Structuur

| Map | Doel |
|-----|------|
| `shared/` | Gedeelde kennisbank, alle agents lezen dit |
| `agents/` | Agent-specifieke configuraties per agent |
| `webapp/` | Agent Hub frontend |

## Toegangsrechten

| Rol | GitHub toegang |
|-----|---------------|
| Bjorn | Owner — merge rechten op main |
| Ward & Victor | Maintainer — enkel via Pull Request |
| Overige teamleden | Geen — werken via Agent Hub webapp |

## Branch protection

- Niemand pusht rechtstreeks naar `main`.
- Alle wijzigingen verlopen via een **Pull Request**.
- Enkel Bjorn heeft merge rechten.

---

*Beheerd door Bjorn & Ward — April 2026*
