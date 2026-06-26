# Simulation Logic

## Attribute-to-Stat Conversion

The core of the simulation converts player attributes into season statistics.

### Input Attributes

- `overall`: Player rating (70-99 scale)
- `shooting_3pt`: Three-point ability (0-100)
- `shooting_mid`: Mid-range ability (0-100)
- `finishing`: Finishing/dunking ability (0-100)
- `playmaking`: Passing/assist ability (0-100)
- `pace`: Game pace (affects volume)
- `archetype_id`: Player style/tendencies
- `position`: PG, SG, SF, PF, C
- `age`: Player age (affects performance)

### Output Stats (Per Season)

- PPG (Points Per Game)
- RPG (Rebounds Per Game)
- APG (Assists Per Game)
- SPG (Steals Per Game)
- BPG (Blocks Per Game)
- FG% (Field Goal %)
- 3P% (Three-Point %)
- FT% (Free Throw %)
- Games Played
- Minutes Played

### Calculation Flow

1. **Base volume** = `overall * pace * age_multiplier`
2. **Position multipliers** = Apply position-specific stat weights
3. **Archetype tendencies** = Adjust scoring vs. playmaking vs. defense
4. **Game logic** = Distribute volume across PPG, APG, RPG, SPG, BPG
5. **Efficiency** = Calculate FG%, 3P%, FT% from shooting attributes

### Real NBA Baseline

We'll test against:
- Shai Gilgeous-Alexander (97 overall, PG)
- Nikola Jokic (98 overall, C)
- Giannis Antetokounmpo (97 overall, PF)
- etc.

## Season Simulation

1. **Regular Season**: 82 games → Generate stats for each player
2. **All-Star Game**: Top vote-getters selected
3. **Awards**: MVP, DPOY, Scoring Title, etc.
4. **Playoffs**: 16 teams, best-of-7 series
5. **Finals**: Champion crowned

## Progression & Retirement

- **Ages 18-25**: Gradual improvement
- **Ages 26-34**: Peak performance (stable)
- **Ages 35+**: Gradual decline (LeBron-coded, slow)
- **Retirement**: Dynamic based on overall declining below threshold

## Trading System

**Triggers**:
- Team chemistry issues
- Performance-based (team record, player stats)
- Financial constraints
- Storyline events

**Timing**: Off-season or before Feb 1 trade deadline

**Traceability**: All trades logged with reason, date, and teams involved