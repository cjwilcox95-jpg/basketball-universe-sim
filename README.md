# Basketball Universe Sim

A deep simulation engine for building NBA dynasty legacies. Track player careers, simulate seasons, manage trades, and build your basketball empire with meaningful progression and historical records.

## Vision

This is a power fantasy lore-building simulator inspired by:
- **2K Dynasty modes** (career progression, legacy tracking)
- **Melvor Idle** (idle/management game presentation)
- **Deep spreadsheet analysis** (historical records, legacy scoring)

The core is a **simulation engine** that generates realistic seasons, then wraps it in an intuitive UI for dynasty management.

## Features (In Progress)

- ✅ Database schema for players, teams, seasons, trades
- 🚧 Attribute-to-stat conversion system (core simulation logic)
- 🚧 Season simulation (82 games, playoffs, all-star game)
- 🚧 Award generation (MVP, DPOY, All-NBA, etc.)
- 🚧 Trading system (off-season, chemistry, performance-based)
- 🚧 Career progression & retirement logic
- 🚧 Historical records tracking
- 🚧 Legacy scoring system (your custom weights)
- 🚧 UI for season simulation & historical deep-dive

## Project Structure

```
basketball-universe-sim/
├── README.md
├── docs/
│   ├── ARCHETYPE_SYSTEM.md
│   ├── LEGACY_SCORING.md
│   ├── SIMULATION_LOGIC.md
│   └── DATABASE_SCHEMA.md
├── src/
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed_data.sql
│   ├── simulation/
│   │   ├── stat_generator.js
│   │   ├── season_simulator.js
│   │   ├── trade_engine.js
│   │   └── progression.js
│   ├── awards/
│   │   └── award_calculator.js
│   ├── legacy/
│   │   └── legacy_scorer.js
│   └── api/
│       └── routes.js
├── tests/
│   └── stat_generator.test.js
└── .gitignore
```

## Getting Started

1. Clone the repo
2. Set up database (PostgreSQL recommended)
3. Seed with baseline NBA players
4. Run first season simulation
5. Iterate on stat generation until it matches IRL data

## Next Steps

Building attribute-to-stat conversion system to match real NBA player performances.