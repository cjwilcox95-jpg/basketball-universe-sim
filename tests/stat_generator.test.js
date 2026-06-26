/**
 * Stat Generator Test Suite
 * Validates stat generation against real NBA player baselines
 */

const StatGenerator = require('../src/simulation/stat_generator');

class StatGeneratorTest {
  constructor() {
    this.generator = new StatGenerator();
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
  }

  /**
   * Define test case with expected ranges
   */
  addTest(name, player, expectedRanges) {
    this.tests.push({ name, player, expectedRanges });
  }

  /**
   * Check if actual value is within expected range
   */
  isInRange(actual, min, max) {
    return actual >= min && actual <= max;
  }

  /**
   * Run a single test
   */
  runTest(testCase) {
    const { name, player, expectedRanges } = testCase;
    const stats = this.generator.generateSeasonStats(player, 1);

    console.log(`\n📊 ${name}`);
    console.log(`   Overall: ${player.overall} | Archetype: ${player.archetype_name} | Position: ${player.position}`);
    console.log(`   Usage Rate: ${stats.usage_rate.toFixed(1)}%`);
    console.log(`   ─────────────────────────────────────`);

    let testPassed = true;

    // PPG
    const ppgMatch = this.isInRange(stats.ppg, expectedRanges.ppg.min, expectedRanges.ppg.max);
    const ppgStatus = ppgMatch ? '✅' : '❌';
    console.log(`   ${ppgStatus} PPG: ${stats.ppg.toFixed(1)} (expected: ${expectedRanges.ppg.min}-${expectedRanges.ppg.max})`);
    if (!ppgMatch) testPassed = false;

    // RPG
    const rpgMatch = this.isInRange(stats.rpg, expectedRanges.rpg.min, expectedRanges.rpg.max);
    const rpgStatus = rpgMatch ? '✅' : '❌';
    console.log(`   ${rpgStatus} RPG: ${stats.rpg.toFixed(1)} (expected: ${expectedRanges.rpg.min}-${expectedRanges.rpg.max})`);
    if (!rpgMatch) testPassed = false;

    // APG
    const apgMatch = this.isInRange(stats.apg, expectedRanges.apg.min, expectedRanges.apg.max);
    const apgStatus = apgMatch ? '✅' : '❌';
    console.log(`   ${apgStatus} APG: ${stats.apg.toFixed(1)} (expected: ${expectedRanges.apg.min}-${expectedRanges.apg.max})`);
    if (!apgMatch) testPassed = false;

    // SPG
    const spgMatch = this.isInRange(stats.spg, expectedRanges.spg.min, expectedRanges.spg.max);
    const spgStatus = spgMatch ? '✅' : '❌';
    console.log(`   ${spgStatus} SPG: ${stats.spg.toFixed(1)} (expected: ${expectedRanges.spg.min}-${expectedRanges.spg.max})`);
    if (!spgMatch) testPassed = false;

    // FG%
    const fgMatch = this.isInRange(stats.fg_percent, expectedRanges.fg_percent.min, expectedRanges.fg_percent.max);
    const fgStatus = fgMatch ? '✅' : '❌';
    console.log(`   ${fgStatus} FG%: ${stats.fg_percent.toFixed(1)}% (expected: ${expectedRanges.fg_percent.min}-${expectedRanges.fg_percent.max}%)`);
    if (!fgMatch) testPassed = false;

    if (testPassed) {
      this.passed++;
      console.log(`   ✅ PASSED`);
    } else {
      this.failed++;
      console.log(`   ❌ FAILED`);
    }

    return testPassed;
  }

  /**
   * Run all tests
   */
  runAll() {
    console.log('🏀 BASKETBALL UNIVERSE SIM - STAT GENERATOR TEST SUITE');
    console.log('═══════════════════════════════════════════════════════\n');

    this.tests.forEach(test => this.runTest(test));

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`📈 RESULTS: ${this.passed} passed, ${this.failed} failed out of ${this.tests.length} tests`);
    console.log(`═══════════════════════════════════════════════════════\n`);
  }
}

// ============================================================================
// DEFINE TESTS
// ============================================================================

const tester = new StatGeneratorTest();

// Test 1: Shai Gilgeous-Alexander
tester.addTest('Shai Gilgeous-Alexander (97 OVR, PG)', {
  name: 'Shai Gilgeous-Alexander',
  overall: 97,
  position: 'PG',
  archetype_name: 'The SGA',
  age: 26,
  pace: 72,
  shooting_3pt: 82,
  shooting_mid: 88,
  finishing: 91,
  playmaking: 90
}, {
  ppg: { min: 30.0, max: 33.5 },
  rpg: { min: 4.5, max: 6.0 },
  apg: { min: 5.5, max: 7.5 },
  spg: { min: 1.5, max: 2.2 },
  fg_percent: { min: 45.0, max: 52.0 }
});

// Test 2: Nikola Jokić
tester.addTest('Nikola Jokić (98 OVR, C)', {
  name: 'Nikola Jokic',
  overall: 98,
  position: 'C',
  archetype_name: 'The Joker',
  age: 29,
  pace: 58,
  shooting_3pt: 72,
  shooting_mid: 80,
  finishing: 85,
  playmaking: 98
}, {
  ppg: { min: 25.0, max: 29.0 },
  rpg: { min: 11.0, max: 13.5 },
  apg: { min: 9.0, max: 11.5 },
  spg: { min: 1.0, max: 1.6 },
  fg_percent: { min: 50.0, max: 58.0 }
});

// Test 3: Luka Dončić
tester.addTest('Luka Dončić (96 OVR, PG)', {
  name: 'Luka Doncic',
  overall: 96,
  position: 'PG',
  archetype_name: 'The Luka',
  age: 25,
  pace: 68,
  shooting_3pt: 78,
  shooting_mid: 90,
  finishing: 82,
  playmaking: 96
}, {
  ppg: { min: 30.5, max: 34.5 },
  rpg: { min: 7.0, max: 9.0 },
  apg: { min: 8.0, max: 10.5 },
  spg: { min: 1.0, max: 1.6 },
  fg_percent: { min: 47.0, max: 54.0 }
});

// Run all tests
tester.runAll();

module.exports = StatGeneratorTest;
