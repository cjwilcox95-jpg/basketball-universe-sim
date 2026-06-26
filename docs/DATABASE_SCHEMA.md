# Database Schema

## Players

```sql
CREATE TABLE players (
  player_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  archetype_id INT REFERENCES archetypes(archetype_id),
  position VARCHAR(2),
  age INT,
  height VARCHAR(10),
  weight INT,
  overall INT,
  pace INT,
  shooting_3pt INT,
  shooting_mid INT,
  finishing INT,
  playmaking INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Archetypes

```sql
CREATE TABLE archetypes (
  archetype_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  style TEXT,
  tendency_scorer INT,
  tendency_playmaker INT,
  tendency_defender INT,
  tendency_rebounder INT,
  key_traits TEXT
);
```

## Teams

```sql
CREATE TABLE teams (
  team_id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  abbreviation VARCHAR(3),
  conference VARCHAR(10),
  division VARCHAR(20),
  city VARCHAR(100)
);
```

## Player Team Assignment

```sql
CREATE TABLE player_team (
  assignment_id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(player_id),
  team_id INT REFERENCES teams(team_id),
  season INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Season Stats

```sql
CREATE TABLE season_stats (
  stat_id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(player_id),
  season INT,
  team_id INT REFERENCES teams(team_id),
  games_played INT,
  minutes_played FLOAT,
  ppg FLOAT,
  rpg FLOAT,
  apg FLOAT,
  spg FLOAT,
  bpg FLOAT,
  fg_percent FLOAT,
  three_percent FLOAT,
  ft_percent FLOAT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Awards

```sql
CREATE TABLE awards (
  award_id SERIAL PRIMARY KEY,
  player_id INT REFERENCES players(player_id),
  award_name VARCHAR(100),
  season INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Trades

```sql
CREATE TABLE trades (
  trade_id SERIAL PRIMARY KEY,
  season INT,
  player_id INT REFERENCES players(player_id),
  from_team_id INT REFERENCES teams(team_id),
  to_team_id INT REFERENCES teams(team_id),
  trade_reason VARCHAR(100),
  trade_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## League History

```sql
CREATE TABLE league_history (
  history_id SERIAL PRIMARY KEY,
  season INT,
  champion_team_id INT REFERENCES teams(team_id),
  mvp_player_id INT REFERENCES players(player_id),
  finals_mvp_player_id INT REFERENCES players(player_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```