/**
 * Stat Generator
 * Converts player attributes into realistic season statistics
 */

class StatGenerator {
  constructor() {
    // Position-specific stat multipliers (from your legacy scoring system)
    this.positionMultipliers = {
      PG: { APG: 1.4, RPG: 0.7, PPG: 1.0 },
      SG: { PPG: 1.2, APG: 1.0, RPG: 0.8 },
      SF: { PPG: 1.0, APG: 1.0, RPG: 1.0 },
      PF: { RPG: 1.2, PPG: 1.0, APG: 0.9 },
      C: { RPG: 1.4, BPG: 1.5, PPG: 0.85 }
    };

    // Archetype tendencies
    this.archetypes = {
      "The King": { scorer: 0.75, playmaker: 0.85, defender: 0.72, rebounder: 0.55 }, // LeBron
      "The Joker": { scorer: 0.55, playmaker: 0.95, defender: 0.55, rebounder: 0.80 }, // Jokic
      "The Point God": { scorer: 0.45, playmaker: 0.95, defender: 0.75, rebounder: 0.30 }, // Stockton
      "The Slim Reaper": { scorer: 0.92, playmaker: 0.25, defender: 0.68, rebounder: 0.40 }, // KD
    };
  }

  /**
   * Generate season stats for a player
   * @param {Object} player - Player object with attributes
   * @param {number} season - Season number
   * @returns {Object} Season statistics
   */
  generateSeasonStats(player, season) {
    // Apply age progression multiplier
    const ageMultiplier = this.getAgeMultiplier(player.age);
    const adjustedOverall = Math.floor(player.overall * ageMultiplier);

    // Base volume calculation
    const baseVolume = adjustedOverall * (player.pace / 100);

    // Get position multipliers
    const posMultipliers = this.positionMultipliers[player.position] || this.positionMultipliers.SF;

    // Get archetype tendencies
    const archetype = this.archetypes[player.archetype_name] || this.archetypes["The King"];

    // Calculate games played
    const gamesPlayed = this.calculateGamesPlayed(adjustedOverall);
    const minutesPerGame = this.calculateMinutesPerGame(adjustedOverall, player.position);
    const totalMinutes = gamesPlayed * minutesPerGame;

    // Distribute volume across stats
    const stats = this.distributeStats(baseVolume, player, archetype, posMultipliers, gamesPlayed);

    // Calculate shooting percentages
    const percentages = this.calculatePercentages(player, archetype);

    return {
      season,
      games_played: gamesPlayed,
      minutes_played: totalMinutes,
      ppg: stats.ppg,
      rpg: stats.rpg,
      apg: stats.apg,
      spg: stats.spg,
      bpg: stats.bpg,
      fg_percent: percentages.fg,
      three_percent: percentages.three,
      ft_percent: percentages.ft,
      adjusted_overall: adjustedOverall
    };
  }

  /**
   * Get age multiplier for progression/decline
   * Peak ages 26-34, drafted at 18
   */
  getAgeMultiplier(age) {
    if (age < 18) return 0.5;
    if (age < 21) return 0.7 + (age - 18) * 0.1; // Years 18-20: ramp up
    if (age < 26) return 1.0 + (age - 21) * 0.02; // Years 21-25: slight improvement
    if (age <= 34) return 1.1; // Years 26-34: peak (LeBron-coded slight bonus)
    if (age < 38) return 1.1 - (age - 34) * 0.05; // Years 35-37: gradual decline
    return Math.max(0.7, 1.1 - (age - 34) * 0.05); // Age 38+: steeper decline
  }

  /**
   * Games played based on overall rating
   * Higher rated players miss fewer games
   */
  calculateGamesPlayed(overall) {
    const injuryRisk = 1 - overall / 100; // Higher overall = lower injury risk
    const gamesLost = Math.floor(Math.random() * 10 * injuryRisk);
    return Math.max(50, 82 - gamesLost);
  }

  /**
   * Minutes per game based on position and overall
   */
  calculateMinutesPerGame(overall, position) {
    const baseMinutes = {
      PG: 34,
      SG: 34,
      SF: 35,
      PF: 35,
      C: 32
    };

    const base = baseMinutes[position] || 34;
    const variance = (overall - 75) / 25; // Scaled around 75 overall
    return Math.max(15, Math.min(38, base + variance));
  }

  /**
   * Distribute volume across PPG, RPG, APG, SPG, BPG
   */
  distributeStats(baseVolume, player, archetype, posMultipliers, gamesPlayed) {
    // Scoring tendency
    let ppg = (baseVolume * archetype.scorer * posMultipliers.PPG) / gamesPlayed;

    // Playmaking tendency
    let apg = (baseVolume * archetype.playmaker * posMultipliers.APG) / gamesPlayed;

    // Rebounding tendency
    let rpg = (baseVolume * archetype.rebounder * posMultipliers.RPG) / gamesPlayed;

    // Defense (steals + blocks)
    const defenseVolume = baseVolume * archetype.defender;
    let spg = (defenseVolume * 0.4) / gamesPlayed; // 40% to steals
    let bpg = (defenseVolume * 0.6) / gamesPlayed; // 60% to blocks

    // Apply position scaling
    if (player.position === "C") {
      rpg = Math.max(rpg, ppg * 0.4); // Centers rebound more
      bpg = Math.max(bpg, ppg * 0.08);
    } else if (player.position === "PG") {
      apg = Math.max(apg, ppg * 0.3); // PGs pass more
      rpg = Math.min(rpg, ppg * 0.35);
    }

    return {
      ppg: Math.round(ppg * 10) / 10,
      apg: Math.round(apg * 10) / 10,
      rpg: Math.round(rpg * 10) / 10,
      spg: Math.round(spg * 10) / 10,
      bpg: Math.round(bpg * 10) / 10
    };
  }

  /**
   * Calculate shooting percentages from attributes
   */
  calculatePercentages(player, archetype) {
    // FG% from overall + shooting attributes
    const shootingAvg = (player.shooting_3pt + player.shooting_mid + player.finishing) / 3;
    const fgPercent = 0.35 + (shootingAvg / 100) * 0.25; // Range: 35%-60%

    // 3P% from 3pt shooting attribute
    const threePercent = 0.25 + (player.shooting_3pt / 100) * 0.35; // Range: 25%-60%

    // FT% (tends to be high for all players)
    const ftPercent = 0.65 + (shootingAvg / 100) * 0.25; // Range: 65%-90%

    return {
      fg: Math.round(fgPercent * 1000) / 10,
      three: Math.round(threePercent * 1000) / 10,
      ft: Math.round(ftPercent * 1000) / 10
    };
  }
}

module.exports = StatGenerator;
