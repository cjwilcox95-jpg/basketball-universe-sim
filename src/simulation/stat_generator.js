/**
 * Stat Generator v2.3
 * Converts player attributes into realistic season statistics
 * Foundation: Usage Rate × Efficiency × Role
 * 
 * FIX: PPG now properly converts possessions → FG attempts → points
 * Formula: PPG = (Scoring Possessions × FG%) × 2.0 / Games
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

    // Role archetypes: possession allocation (% of team possessions)
    this.archetypes = {
      "The King": { 
        scorer: 0.40,
        playmaker: 0.30,
        rebounder: 0.15,
        defender: 0.15,
        usageModifier: 1.0
      },
      "The Joker": { 
        scorer: 0.25,
        playmaker: 0.45,
        rebounder: 0.20,
        defender: 0.10,
        usageModifier: 0.85
      },
      "The Point God": { 
        scorer: 0.20,
        playmaker: 0.55,
        rebounder: 0.10,
        defender: 0.15,
        usageModifier: 0.90
      },
      "The Slim Reaper": { 
        scorer: 0.65,
        playmaker: 0.10,
        rebounder: 0.10,
        defender: 0.15,
        usageModifier: 1.05
      },
      "The SGA": {
        scorer: 0.50,
        playmaker: 0.20,
        rebounder: 0.10,
        defender: 0.20,
        usageModifier: 1.0
      },
      "The Luka": {
        scorer: 0.45,
        playmaker: 0.35,
        rebounder: 0.10,
        defender: 0.10,
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
      usageRate = this.calculateUsageRate(player.overall, player.archetype_name);
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

    // Calculate FG% (this is now the efficiency metric)
    const fgPercent = this.calculateFGPercent(player, adjustedOverall, archetype);

    // Distribute stats
    const stats = this.distributeStats(
      playerPossessions,
      gamesPlayed,
      player,
      archetype,
      posMultipliers,
      fgPercent
    );

    // Calculate shooting percentages (3P% and FT%)
    const percentages = this.calculatePercentages(player, archetype, fgPercent);

    return {
      season,
      games_played: gamesPlayed,
      minutes_played: Math.round(totalMinutes),
      ppg: Math.round(stats.ppg * 10) / 10,
      rpg: Math.round(stats.rpg * 10) / 10,
      apg: Math.round(stats.apg * 10) / 10,
      spg: Math.round(stats.spg * 10) / 10,
      bpg: Math.round(stats.bpg * 10) / 10,
      fg_percent: fgPercent,
      three_percent: percentages.three,
      ft_percent: percentages.ft,
      adjusted_overall: adjustedOverall,
      usage_rate: Math.round(usageRate * 1000) / 10
    };
  }

  /**
   * Calculate usage rate based on overall and archetype (LINEAR)
   */
  calculateUsageRate(overall, archetypeName) {
    const archetype = this.archetypes[archetypeName] || this.archetypes["The King"];
    
    // Linear base usage from overall rating
    const baseUsage = 0.15 + (overall - 70) / 30 * 0.23;
    
    // Modify by archetype usage tendency
    const modifiedUsage = baseUsage * archetype.usageModifier;
    
    // Clamp to realistic range
    return Math.max(0.20, Math.min(0.40, modifiedUsage));
  }

  /**
   * Calculate FG% from player attributes and overall
   * Returns value between 0.35 and 0.65 (35% - 65%)
   */
  calculateFGPercent(player, overall, archetype) {
    // Base FG% from shooting attributes
    const shootingAvg = (player.shooting_3pt + player.shooting_mid + player.finishing) / 3;
    const basePercentage = 0.40 + (shootingAvg / 100) * 0.20; // Range: 40% - 60%

    // Scorer archetype gets efficiency bonus
    const archetypeBonus = archetype.scorer * 0.05; // 0% - 5% bonus

    // Overall rating contributes to efficiency
    const overallBonus = (overall - 75) / 100 * 0.08; // 75 OVR = baseline, 99 OVR = +19.2%

    const fgPercent = basePercentage + archetypeBonus + overallBonus;

    // Clamp to realistic range
    return Math.max(0.35, Math.min(0.65, fgPercent));
  }

  /**
   * Get age multiplier for progression/decline
   */
  getAgeMultiplier(age) {
    if (age < 18) return 0.5;
    if (age < 21) return 0.7 + (age - 18) * 0.1;
    if (age < 26) return 1.0 + (age - 21) * 0.02;
    if (age <= 34) return 1.1;
    if (age < 38) return 1.1 - (age - 34) * 0.05;
    return Math.max(0.7, 1.1 - (age - 34) * 0.05);
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
   * 
   * PPG = (Scoring Possessions × FG%) × 2.0 / Games
   * APG = Playmaking Possessions × Position Multiplier / Games
   * RPG = Rebounding Possessions × Position Multiplier / Games
   * SPG/BPG = Defense Possessions split 35%/65%
   */
  distributeStats(possessions, gamesPlayed, player, archetype, posMultipliers, fgPercent) {
    // Possession allocation
    const scoringPossessions = possessions * archetype.scorer;
    const playmakingPossessions = possessions * archetype.playmaker;
    const reboundingPossessions = possessions * archetype.rebounder;
    const defensePossessions = possessions * archetype.defender;

    // PPG: Scoring possessions × FG% × 2 points per FG / Games
    let ppg = (scoringPossessions * fgPercent * 2.0 * posMultipliers.PPG) / gamesPlayed;

    // APG: Roughly 1 assist per playmaking possession
    let apg = (playmakingPossessions * posMultipliers.APG) / gamesPlayed;

    // RPG: Roughly 1 rebound per rebounding possession
    let rpg = (reboundingPossessions * posMultipliers.RPG) / gamesPlayed;

    // Defense: steals (35%) and blocks (65%)
    let spg = (defensePossessions * 0.35) / gamesPlayed;
    let bpg = (defensePossessions * 0.65) / gamesPlayed;

    // Position-specific constraints
    if (player.position === "C") {
      rpg = Math.max(rpg, ppg * 0.45);
      bpg = Math.max(bpg, ppg * 0.10);
      apg = Math.min(apg, ppg * 0.20);
    } else if (player.position === "PG") {
      apg = Math.max(apg, ppg * 0.25);
      rpg = Math.min(rpg, ppg * 0.30);
      spg = Math.max(spg, 1.5);
    } else if (player.position === "SF") {
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
   * Calculate 3P% and FT%
   */
  calculatePercentages(player, archetype, fgPercent) {
    // 3P% from 3pt shooting attribute (independent of FG%)
    const threePercent = Math.round((25 + (player.shooting_3pt / 100) * 35) * 10) / 10;

    // FT% from finishing attribute
    const ftPercent = Math.round((65 + (player.finishing / 100) * 25) * 10) / 10;

    return {
      three: threePercent,
      ft: ftPercent
    };
  }
}

module.exports = StatGenerator;
