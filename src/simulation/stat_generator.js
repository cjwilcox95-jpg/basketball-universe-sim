/**
 * Stat Generator v2
 * Converts player attributes into realistic season statistics
 * Foundation: Usage Rate × Efficiency × Role
 */

class StatGenerator {
  constructor() {
    // Position stat multipliers
    this.positionMultipliers = {
      PG: { APG: 1.4, RPG: 0.7, PPG: 1.0, SPG: 1.1 },
      SG: { PPG: 1.2, APG: 0.8, RPG: 0.8, SPG: 1.0 },
      SF: { PPG: 1.0, APG: 1.0, RPG: 1.0, SPG: 1.0 },
      PF: { RPG: 1.2, PPG: 1.0, APG: 0.9, BPG: 1.1 },
      C: { RPG: 1.4, BPG: 1.5, PPG: 0.85, APG: 0.7 }
    };

    // Role archetypes: define scoring vs playmaking vs rebounding tendency
    this.archetypes = {
      "The King": { 
        // LeBron coded - balanced all-around
        scorer: 0.65, 
        playmaker: 0.75, 
        defender: 0.75, 
        rebounder: 0.55,
        usageModifier: 1.0
      },
      "The Joker": { 
        // Jokic - system engine, high efficiency, playmaking
        scorer: 0.50, 
        playmaker: 0.95, 
        defender: 0.55, 
        rebounder: 0.85,
        usageModifier: 0.95
      },
      "The Point God": { 
        // Stockton - assist-first PG
        scorer: 0.40, 
        playmaker: 0.95, 
        defender: 0.75, 
        rebounder: 0.20,
        usageModifier: 0.90
      },
      "The Slim Reaper": { 
        // KD - elite scorer, length
        scorer: 0.92, 
        playmaker: 0.25, 
        defender: 0.68, 
        rebounder: 0.40,
        usageModifier: 1.05
      },
      "The SGA": {
        // Shai - efficient scorer, moderate playmaking
        scorer: 0.85,
        playmaker: 0.50,
        defender: 0.70,
        rebounder: 0.35,
        usageModifier: 1.0
      },
      "The Luka": {
        // Luka - high usage, heliocentric scorer + playmaker
        scorer: 0.80,
        playmaker: 0.75,
        defender: 0.50,
        rebounder: 0.45,
        usageModifier: 1.15
      }
    };
  }

  /**
   * Generate season stats for a player
   * @param {Object} player - Player object with attributes
   * @param {number} season - Season number
   * @param {number} usageRate - Usage rate (0.25 - 0.40, typically)
   * @returns {Object} Season statistics
   */
  generateSeasonStats(player, season, usageRate = null) {
    // Apply age progression multiplier
    const ageMultiplier = this.getAgeMultiplier(player.age);
    const adjustedOverall = Math.floor(player.overall * ageMultiplier);

    // Determine usage rate if not provided
    if (!usageRate) {
      usageRate = this.calculateUsageRate(adjustedOverall, player.archetype_name);
    }

    // Get archetype data
    const archetype = this.archetypes[player.archetype_name] || this.archetypes["The King"];

    // Get position multipliers
    const posMultipliers = this.positionMultipliers[player.position] || this.positionMultipliers.SF;

    // Calculate games played
    const gamesPlayed = this.calculateGamesPlayed(adjustedOverall);
    const minutesPerGame = this.calculateMinutesPerGame(adjustedOverall, player.position);
    const totalMinutes = gamesPlayed * minutesPerGame;

    // Calculate possessions per game (NBA average ~100 possessions/game)
    const possessionsPerGame = 100;
    const playerPossessions = possessionsPerGame * usageRate;

    // Calculate efficiency (FG% basis)
    const efficiency = this.calculateEfficiency(player, adjustedOverall, archetype);

    // Distribute stats
    const stats = this.distributeStats(
      playerPossessions,
      gamesPlayed,
      player,
      archetype,
      posMultipliers,
      efficiency
    );

    // Calculate shooting percentages
    const percentages = this.calculatePercentages(player, archetype, efficiency);

    return {
      season,
      games_played: gamesPlayed,
      minutes_played: Math.round(totalMinutes),
      ppg: Math.round(stats.ppg * 10) / 10,
      rpg: Math.round(stats.rpg * 10) / 10,
      apg: Math.round(stats.apg * 10) / 10,
      spg: Math.round(stats.spg * 10) / 10,
      bpg: Math.round(stats.bpg * 10) / 10,
      fg_percent: percentages.fg,
      three_percent: percentages.three,
      ft_percent: percentages.ft,
      adjusted_overall: adjustedOverall,
      usage_rate: Math.round(usageRate * 1000) / 10 // Return as percentage
    };
  }

  /**
   * Calculate usage rate based on overall and archetype
   * Realistic range: 25% - 38%
   */
  calculateUsageRate(overall, archetypeName) {
    const archetype = this.archetypes[archetypeName] || this.archetypes["The King"];
    
    // Base usage from overall rating
    const baseUsage = 0.18 + (overall - 70) / 100 * 0.18; // 70 OVR = 18%, 90 OVR = 32%, 99 OVR = 36%
    
    // Modify by archetype usage tendency
    const modifiedUsage = baseUsage * archetype.usageModifier;
    
    // Clamp to realistic range
    return Math.max(0.20, Math.min(0.40, modifiedUsage));
  }

  /**
   * Calculate efficiency multiplier (affects PPG output)
   * Higher efficiency = more PPG from same possessions
   */
  calculateEfficiency(player, overall, archetype) {
    // Base efficiency from shooting attributes
    const shootingAvg = (player.shooting_3pt + player.shooting_mid + player.finishing) / 3;
    const shootingEfficiency = 0.45 + (shootingAvg / 100) * 0.15; // Range: 45% - 60%

    // Archetype modifier
    const archetypeEffBonus = archetype.scorer * 0.10; // Scorers get slight boost

    // Overall contributes to efficiency
    const overallEffBonus = (overall - 75) / 100 * 0.08; // 75 OVR = baseline, 99 OVR = +19%

    return shootingEfficiency + archetypeEffBonus + overallEffBonus;
  }

  /**
   * Get age multiplier for progression/decline
   * Peak ages 26-34, drafted at 18
   */
  getAgeMultiplier(age) {
    if (age < 18) return 0.5;
    if (age < 21) return 0.7 + (age - 18) * 0.1; // Years 18-20: ramp up
    if (age < 26) return 1.0 + (age - 21) * 0.02; // Years 21-25: slight improvement
    if (age <= 34) return 1.1; // Years 26-34: peak
    if (age < 38) return 1.1 - (age - 34) * 0.05; // Years 35-37: gradual decline
    return Math.max(0.7, 1.1 - (age - 34) * 0.05); // Age 38+: steeper decline
  }

  /**
   * Games played based on overall rating
   */
  calculateGamesPlayed(overall) {
    const injuryRisk = 1 - overall / 100;
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
    const variance = (overall - 75) / 25;
    return Math.max(15, Math.min(38, base + variance));
  }

  /**
   * Distribute possessions across PPG, APG, RPG, SPG, BPG
   * Key: Archetype tendency determines split
   */
  distributeStats(possessions, gamesPlayed, player, archetype, posMultipliers, efficiency) {
    // Responsibility distribution (must sum to ~1.0)
    const scoringResponsibility = archetype.scorer; // 0.50 - 0.92
    const playmakingResponsibility = archetype.playmaker; // 0.25 - 0.95
    const reboundingResponsibility = archetype.rebounder; // 0.20 - 0.85
    const defendingResponsibility = archetype.defender; // 0.45 - 0.75

    // Scoring: possessions × scoring tendency × efficiency × position multiplier
    let ppg = (possessions * scoringResponsibility * efficiency * posMultipliers.PPG) / gamesPlayed;

    // Playmaking: possessions × playmaking tendency × position multiplier
    let apg = (possessions * playmakingResponsibility * posMultipliers.APG) / gamesPlayed;

    // Rebounding: based on rebounding tendency + position
    let rpg = (possessions * reboundingResponsibility * posMultipliers.RPG) / gamesPlayed;

    // Defense: steals + blocks
    const defenseVolume = possessions * defendingResponsibility;
    let spg = (defenseVolume * 0.35) / gamesPlayed; // 35% to steals
    let bpg = (defenseVolume * 0.65) / gamesPlayed; // 65% to blocks

    // Position-specific constraints
    if (player.position === "C") {
      // Centers rebound more
      rpg = Math.max(rpg, ppg * 0.45);
      bpg = Math.max(bpg, ppg * 0.10);
      apg = Math.min(apg, ppg * 0.20);
    } else if (player.position === "PG") {
      // Point guards pass more
      apg = Math.max(apg, ppg * 0.25);
      rpg = Math.min(rpg, ppg * 0.30);
      spg = Math.max(spg, 1.5); // Defensive ball handlers
    } else if (player.position === "SF") {
      // Versatile
      rpg = Math.max(rpg, ppg * 0.35);
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
   * Calculate shooting percentages
   */
  calculatePercentages(player, archetype, efficiency) {
    // FG% derived from efficiency calculation
    const fgPercent = Math.round(efficiency * 1000) / 10;

    // 3P% from 3pt shooting attribute
    const threePercent = 25 + (player.shooting_3pt / 100) * 35; // Range: 25% - 60%

    // FT% (high for all players, varies with finishing attribute)
    const ftPercent = 65 + (player.finishing / 100) * 25; // Range: 65% - 90%

    return {
      fg: fgPercent,
      three: Math.round(threePercent * 10) / 10,
      ft: Math.round(ftPercent * 10) / 10
    };
  }
}

module.exports = StatGenerator;
