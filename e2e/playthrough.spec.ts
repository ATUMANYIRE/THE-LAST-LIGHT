import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'e2e', 'screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test.describe('THE LAST LIGHT: Complete 3-Chapter Independent Playthrough & Audit', () => {
  test('Complete Chapter 1, Chapter 2, Chapter 3 and Grand Finale via actual UI interactions', async ({ page }) => {
    // Navigate to game
    await page.goto('/');
    await expect(page).toHaveTitle(/THE LAST LIGHT/i);

    const runSim = async () => {
      const btn = page.getByTestId('run-simulation-button');
      await btn.scrollIntoViewIfNeeded();
      await btn.click({ force: true });
    };

    // -------------------------------------------------------------
    // CHAPTER 1: THE SHORTCUT
    // -------------------------------------------------------------
    // Verify Intro Modal
    const introModal = page.getByTestId('intro-modal');
    await expect(introModal).toBeVisible();
    await expect(introModal).toContainText('Chapter 1');
    await expect(introModal).toContainText('Maya');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01-ch1-intro-modal.png') });

    // Begin Chapter 1
    await page.getByTestId('begin-chapter-button').click({ force: true });
    await expect(introModal).toBeHidden();

    // Verify initial budget: $150
    const budgetDisplay = page.getByTestId('budget-display');
    await expect(budgetDisplay).toContainText('$150');

    // Select Paved Walkway tool
    await page.getByTestId('tool-paved_walkway').click();

    // Pave shortcut to library via sunken steps: (2, 1), (2, 2), (5, 2)
    await page.getByTestId('tile-2-1').click();
    await page.getByTestId('tile-2-2').click();
    await page.getByTestId('tile-5-2').click();

    // 3 paved walkways @ $15 = $45. Remaining budget: $105
    await expect(budgetDisplay).toContainText('$105');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02-ch1-phase1-paved.png') });

    // Run Simulation for Phase 1
    await runSim();

    // Wait for Invisible Resident reveal modal
    const revealModal = page.getByTestId('reveal-modal');
    await expect(revealModal).toBeVisible({ timeout: 6000 });
    await expect(revealModal).toContainText('The Invisible Resident Revealed');
    await expect(revealModal).toContainText('Sam');
    await expect(revealModal).toContainText('3-step drop');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03-ch1-sam-revealed.png') });

    // Acknowledge reveal
    await page.getByTestId('acknowledge-reveal-button').click({ force: true });
    await expect(revealModal).toBeHidden();

    // Verify Modular Ramp tool unlocked
    const rampTool = page.getByTestId('tool-ramp');
    await expect(rampTool).toBeVisible();
    await rampTool.click();

    // Place ramp over sunken stone steps at (3, 2)
    await page.getByTestId('tile-3-2').click();

    // Ramp costs $25. Remaining budget: $80
    await expect(budgetDisplay).toContainText('$80');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04-ch1-ramp-placed.png') });

    // Verify Universal Accessible Route
    await runSim();

    // Wait for Chapter 1 Victory Modal
    const victoryModal = page.getByTestId('victory-modal');
    await expect(victoryModal).toBeVisible({ timeout: 6000 });
    await expect(victoryModal).toContainText('Chapter 1 Complete!');
    await expect(victoryModal).toContainText('Clocktower Quarter Connected!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05-ch1-victory.png') });

    // Continue to Chapter 2
    await page.getByTestId('victory-continue-button').click({ force: true });

    // -------------------------------------------------------------
    // CHAPTER 2: THE SILENT CROSSING
    // -------------------------------------------------------------
    // Verify Chapter 2 Intro Modal
    await expect(introModal).toBeVisible({ timeout: 6000 });
    await expect(introModal).toContainText('Chapter 2');
    await expect(introModal).toContainText('Kai');
    await expect(introModal).toContainText('The Silent Crossing');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06-ch2-intro-modal.png') });

    await page.getByTestId('begin-chapter-button').click({ force: true });
    await expect(introModal).toBeHidden();

    // Verify starting budget: $190
    await expect(budgetDisplay).toContainText('$190');

    // Connect Kai across Neon Avenue: (2, 2), (3, 2), (5, 2), (6, 2)
    await page.getByTestId('tool-paved_walkway').click();
    await page.getByTestId('tile-2-2').click();
    await page.getByTestId('tile-3-2').click();
    await page.getByTestId('tile-5-2').click();
    await page.getByTestId('tile-6-2').click();

    // 4 * $15 = $60. Remaining budget: $130
    await expect(budgetDisplay).toContainText('$130');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07-ch2-phase1-paved.png') });

    // Run Simulation
    await runSim();

    // Wait for Elena (Invisible Resident) reveal modal
    await expect(revealModal).toBeVisible({ timeout: 6000 });
    await expect(revealModal).toContainText('Elena');
    await expect(revealModal).toContainText('silent');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08-ch2-elena-revealed.png') });

    await page.getByTestId('acknowledge-reveal-button').click({ force: true });
    await expect(revealModal).toBeHidden();

    // Unlocked tools: Tactile Pavers & Acoustic Signal
    const tactileTool = page.getByTestId('tool-tactile_paving');
    await expect(tactileTool).toBeVisible();
    await tactileTool.click();

    // Pave continuous tactile guide route for Elena on row 3
    await page.getByTestId('tile-2-3').click();
    await page.getByTestId('tile-3-3').click();
    await page.getByTestId('tile-5-3').click();
    await page.getByTestId('tile-6-3').click();

    // Select Acoustic Beacon
    const beaconTool = page.getByTestId('tool-acoustic_beacon');
    await expect(beaconTool).toBeVisible();
    await beaconTool.click();

    // Place Acoustic Beacon at road crosswalk (4, 3)
    await page.getByTestId('tile-4-3').click();

    // Remaining budget: $190 - 4*$15 - 4*$15 - $30 = $40
    await expect(budgetDisplay).toContainText('$40');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09-ch2-beacon-placed.png') });

    // Verify Universal Route
    await runSim();

    // Wait for Chapter 2 Victory
    await expect(victoryModal).toBeVisible({ timeout: 6000 });
    await expect(victoryModal).toContainText('Chapter 2 Complete!');
    await expect(victoryModal).toContainText('Avenue Crossing Made Inclusive!');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10-ch2-victory.png') });

    // Continue to Chapter 3
    await page.getByTestId('victory-continue-button').click({ force: true });

    // -------------------------------------------------------------
    // CHAPTER 3: ONE LIGHT LEFT
    // -------------------------------------------------------------
    // Verify Chapter 3 Intro Modal
    await expect(introModal).toBeVisible({ timeout: 6000 });
    await expect(introModal).toContainText('Chapter 3');
    await expect(introModal).toContainText('One Light Left');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11-ch3-intro-modal.png') });

    await page.getByTestId('begin-chapter-button').click({ force: true });
    await expect(introModal).toBeHidden();

    // Verify starting budget: $240
    await expect(budgetDisplay).toContainText('$240');

    // Build central corridor on row 3:
    // Place streetlamp at (5, 3) to light blackout center
    await page.getByTestId('tool-streetlamp').click();
    await page.getByTestId('tile-5-3').click();

    // Place ramp over staircase at (4, 3)
    await page.getByTestId('tool-ramp').click();
    await page.getByTestId('tile-4-3').click();

    // Pave connectors at (3, 3), (6, 3), (7, 3)
    await page.getByTestId('tool-paved_walkway').click();
    await page.getByTestId('tile-3-3').click();
    await page.getByTestId('tile-6-3').click();
    await page.getByTestId('tile-7-3').click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12-ch3-phase1-lit.png') });

    // Run Simulation
    await runSim();

    // Wait for Mr. Henderson reveal modal
    await expect(revealModal).toBeVisible({ timeout: 6000 });
    await expect(revealModal).toContainText('Mr. Henderson');
    await expect(revealModal).toContainText('exhaustion');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13-ch3-henderson-revealed.png') });

    await page.getByTestId('acknowledge-reveal-button').click({ force: true });
    await expect(revealModal).toBeHidden();

    // Select Resting Bench tool
    const benchTool = page.getByTestId('tool-resting_bench');
    await expect(benchTool).toBeVisible();
    await benchTool.click();

    // Place resting benches along the corridor at (3, 3) and (6, 3)
    await page.getByTestId('tile-3-3').click();
    await page.getByTestId('tile-6-3').click();

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14-ch3-benches-placed.png') });

    // Verify Universal Route
    await runSim();

    // Wait for Chapter 3 Victory
    await expect(victoryModal).toBeVisible({ timeout: 6000 });
    await expect(victoryModal).toContainText('Chapter 3 Complete!');
    await expect(victoryModal).toContainText('The City Fully Illuminated!');
    await expect(page.getByTestId('victory-continue-button')).toContainText('View Grand Finale');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15-ch3-victory.png') });

    // -------------------------------------------------------------
    // GRAND FINALE
    // -------------------------------------------------------------
    await page.getByTestId('victory-continue-button').click({ force: true });

    // Assert Finale Modal appears
    const finaleModal = page.getByTestId('finale-modal');
    await expect(finaleModal).toBeVisible({ timeout: 6000 });
    await expect(finaleModal).toContainText('Universal City Achieved');
    await expect(finaleModal).toContainText('Districts Connected');
    await expect(finaleModal).toContainText('3 / 3');
    await expect(finaleModal).toContainText('Neighbors Empowered');
    await expect(finaleModal).toContainText('6 / 6');
    await expect(finaleModal).toContainText('Barriers Eliminated');
    await expect(finaleModal).toContainText('100%');
    await expect(finaleModal).toContainText('Girls Who Code HHS Hackathon 2026');

    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '16-grand-finale.png') });

    // Test navigation from Finale to District Map
    await page.getByTestId('explore-district-map').click({ force: true });
    await expect(finaleModal).toBeHidden();

    const chapterSelectModal = page.getByTestId('chapter-select-modal');
    await expect(chapterSelectModal).toBeVisible();
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '17-all-chapters-unlocked.png') });
  });
});
