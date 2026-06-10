# Project Genesis: Archive

**Project Genesis: Archive** is a browser-based idle collection game about discovering, registering, and cataloging life inside a post-collapse sanctuary system.

The 0.1.0 foundation package establishes the first playable loop and the project structure needed for future expansion.

## Core Loop

1. Begin biome scans to generate Knowledge.
2. Spend Knowledge to register species into the Archive.
3. Buy research systems to automate Knowledge gain.
4. Complete the Archive index and expand into future habitats, eras, and lineages.

## Aesthetic Direction

- Reconstructed Pleistocene biome environments
- Sanctuary amber + Archive cyan UI language
- Genesis Archive glyphs and registration systems
- Hopeful, scientific, dangerous, mysterious atmosphere
- Stewardship-survives-the-steward tone

## Current Features

- Static browser app
- Mobile-friendly layout
- Local browser save
- Species archive cards
- Manual scanning
- Auto research upgrades
- Filterable archive index
- External JSON data files

## Project Structure

```text
project-genesis-archive-v0.1.0/
├─ index.html
├─ style.css
├─ main.js
├─ data/
│  ├─ species.json
│  ├─ habitats.json
│  └─ upgrades.json
├─ docs/
│  ├─ architecture.md
│  ├─ lore.md
│  ├─ roadmap.md
│  └─ save-system.md
├─ assets/
│  ├─ icons/
│  ├─ images/
│  └─ audio/
├─ README.md
├─ LICENSE
└─ .gitignore
```

## Running It

Upload the folder contents to GitHub and enable GitHub Pages, or deploy the folder to any static host.

Because the app loads JSON files, it is best viewed through GitHub Pages, Vercel, Netlify, or another static web host rather than opening `index.html` directly from local Android storage.

## Version

Current foundation version: **0.1.0**
