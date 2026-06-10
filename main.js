# Architecture Notes

## Goal

Keep Project Genesis: Archive simple enough to run as a free static browser game while giving it a scalable data foundation.

## Current Architecture

- `index.html` contains the static app shell.
- `style.css` controls the Sanctuary Amber / Archive Cyan visual style.
- `main.js` controls game state, rendering, upgrades, filtering, local save, and JSON loading.
- `data/species.json` stores species records.
- `data/habitats.json` stores habitat records.
- `data/upgrades.json` stores upgrade definitions.

## Data Philosophy

Game content should live in JSON whenever possible. This allows the species database to eventually be shared across:

- Project Genesis Observatory
- Project Genesis: Archive
- Genesis Hatchery
- Canidae Lineages
- Future Project Genesis simulations

## Future Refactor Targets

- Split rendering into modules.
- Add a `data/collections.json` file.
- Add a `data/eras.json` file.
- Add a `data/traits.json` library.
- Replace direct DOM rendering with component functions.
- Add import/export save support.
