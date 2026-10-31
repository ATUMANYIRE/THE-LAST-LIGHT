import { test, expect, Page } from '@playwright/test';

type Position = { x: number; z: number; vx: number; vz: number; inputX: number; inputZ: number; mode: string; blocked: boolean; collision: string; frame: number };
const distance = (a: Position, b: Position) => Math.hypot(a.x - b.x, a.z - b.z);
const position = async (page: Page): Promise<Position> => page.evaluate(() => {
  const value = (window as typeof window & { __TLL_TEST_PLAYER__?: Position }).__TLL_TEST_PLAYER__;
  if (!value) throw new Error('Opt-in player diagnostics did not initialize');
  return value;
});
const hold = async (page: Page, key: string, ms = 650) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
  await page.waitForTimeout(180);
};

test('real keyboard movement has measurable speed, collision, reset and modal guards', async ({ page }) => {
  test.setTimeout(240000);
  await page.goto('/?tllDiagnostics=1');
  await expect(page.getByTestId('player-name-screen')).toBeVisible();
  const nameInput = page.getByRole('textbox', { name: 'Your name' });
  await nameInput.fill('Alex');
  await nameInput.focus();
  await hold(page, 'w', 350);
  await expect(nameInput).toHaveValue('Alexw');
  await page.getByTestId('begin-journey-button').click();
  await page.getByTestId('loop-begin-button').click();
  await page.getByTestId('enter-3d-world-button').click();
  await page.getByTestId('begin-chapter-button').click();
  await page.getByRole('button', { name: 'Skip tutorial' }).click();
  await expect(page.getByRole('button', { name: 'Switch to Design Mode' })).toBeVisible();
  await page.waitForFunction(() => Boolean((window as typeof window & { __TLL_TEST_PLAYER__?: Position }).__TLL_TEST_PLAYER__));
  await page.getByTestId('reset-camera-button').click();
  await page.getByTestId('city-canvas-3d-container').locator('canvas').focus();

  const start = await position(page);
  await hold(page, 'w');
  const walked = await position(page);
  expect(distance(start, walked)).toBeGreaterThan(0.25);
  await page.waitForTimeout(300);
  expect(distance(walked, await position(page))).toBeLessThan(0.12);
  await hold(page, 's');
  await hold(page, 'd');
  await hold(page, 'a');
  for (const arrow of ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']) {
    const before = await position(page);
    await hold(page, arrow, 350);
    expect(distance(before, await position(page))).toBeGreaterThan(0.08);
  }

  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(250);
  const reset = await position(page);
  expect(distance(reset, start)).toBeLessThan(0.12);
  // Walk into the open plaza before comparing speed; the spawn is beside two houses.
  await hold(page, 'w', 900);
  const cardinalStart = await position(page);
  await page.keyboard.down('s');
  await page.waitForTimeout(500);
  const cardinalMoving = await position(page);
  const cardinalSpeed = Math.hypot(cardinalMoving.vx, cardinalMoving.vz);
  expect(distance(cardinalStart, cardinalMoving)).toBeGreaterThan(0.2);
  await page.keyboard.up('s');
  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(250);
  await hold(page, 'w', 900);
  const diagonalStart = await position(page);
  await page.keyboard.down('s');
  await page.keyboard.down('a');
  await page.waitForTimeout(500);
  const diagonalMoving = await position(page);
  const diagonalSpeed = Math.hypot(diagonalMoving.vx, diagonalMoving.vz);
  await page.keyboard.up('s');
  await page.keyboard.up('a');
  expect(distance(diagonalStart, diagonalMoving)).toBeGreaterThan(0.25);
  expect(Math.hypot(cardinalMoving.inputX, cardinalMoving.inputZ)).toBeCloseTo(1, 2);
  expect(Math.hypot(diagonalMoving.inputX, diagonalMoving.inputZ)).toBeCloseTo(1, 2);
  expect(diagonalSpeed / cardinalSpeed).toBeLessThan(1.15);

  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(250);
  const jogStart = await position(page);
  await page.keyboard.down('Shift');
  await page.keyboard.down('w');
  await page.waitForTimeout(700);
  const jogging = await position(page);
  await page.keyboard.up('w');
  await page.keyboard.up('Shift');
  expect(distance(jogStart, jogging)).toBeGreaterThan(0.25);
  expect(Math.hypot(jogging.vx, jogging.vz)).toBeGreaterThan(cardinalSpeed * 1.25);

  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(250);
  const wallStart = await position(page);
  // Default camera yaw is PI, so D approaches Maya's house on world -X.
  await hold(page, 'd', 600);
  expect(Math.abs((await position(page)).x - wallStart.x)).toBeLessThan(0.12);
  await page.keyboard.down('d');
  await page.keyboard.down('w');
  const slideSample = await page.waitForFunction(({ x, z }) => {
    const current = (window as typeof window & { __TLL_TEST_PLAYER__?: Position }).__TLL_TEST_PLAYER__;
    return current?.collision === 'x' && Math.abs(current.z - z) > 0.05 ? { ...current } : false;
  }, { x: wallStart.x, z: wallStart.z }, { timeout: 3000 });
  const slid = await slideSample.jsonValue() as Position;
  await page.keyboard.up('d');
  await page.keyboard.up('w');
  expect(Math.abs(slid.x - wallStart.x)).toBeLessThan(0.16);
  expect(Math.abs(slid.z - wallStart.z)).toBeGreaterThan(0.05);
  await page.getByTestId('reset-button').click();
  await page.waitForTimeout(250);
  await hold(page, 'w', 2400);
  const edge = await position(page);
  expect(edge.z).toBeLessThanOrEqual(3.11);
  expect(edge.z).toBeGreaterThan(2.8);

  await page.getByTestId('help-button').click();
  const modalStart = await position(page);
  await hold(page, 'w', 400);
  expect(distance(modalStart, await position(page))).toBeLessThan(0.02);
  await page.getByTestId('close-help-button').click();
  await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
  await page.waitForFunction(() => (window as typeof window & { __TLL_TEST_PLAYER__?: Position }).__TLL_TEST_PLAYER__?.mode === 'design');
  const design = await position(page);
  expect(design.mode).toBe('design');
  await hold(page, 'w', 400);
  expect(distance(design, await position(page))).toBeLessThan(0.02);
  await page.getByRole('button', { name: 'Switch to Explore Mode' }).click();
  await page.waitForFunction(() => (window as typeof window & { __TLL_TEST_PLAYER__?: Position }).__TLL_TEST_PLAYER__?.mode === 'explore');
  const explore = await position(page);
  await page.waitForTimeout(300);
  expect(distance(explore, await position(page))).toBeLessThan(0.06);
});

test('mobile touch D-pad moves, combines two fingers and stops on cancellation', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 393, height: 851 });
  await page.addInitScript(() => {
    localStorage.setItem('tll_player_name', 'Touch Tester');
    localStorage.setItem('tll_loop_seen', '1');
    localStorage.setItem('tll_tutorial_done', '1');
  });
  await page.goto('/?tllDiagnostics=1');
  await page.getByTestId('enter-3d-world-button').click();
  await page.getByTestId('begin-chapter-button').click();
  await expect(page.getByTestId('touch-dpad')).toBeVisible();
  await page.waitForFunction(() => Boolean((window as typeof window & { __TLL_TEST_PLAYER__?: Position }).__TLL_TEST_PLAYER__));
  const forward = await page.getByTestId('touch-forward').boundingBox();
  const right = await page.getByTestId('touch-right').boundingBox();
  expect(forward && right).toBeTruthy();
  const touch = await page.context().newCDPSession(page);
  const f = { x: forward!.x + forward!.width / 2, y: forward!.y + forward!.height / 2, id: 1 };
  const r = { x: right!.x + right!.width / 2, y: right!.y + right!.height / 2, id: 2 };
  const start = await position(page);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [f] });
  await page.waitForTimeout(600);
  const forwardEnd = await position(page);
  expect(distance(start, forwardEnd)).toBeGreaterThan(0.2);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [f, r] });
  await page.waitForTimeout(600);
  const diagonalEnd = await position(page);
  expect(diagonalEnd.x).toBeLessThan(forwardEnd.x - 0.15);
  await touch.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await page.waitForTimeout(300);
  const stopped = await position(page);
  await page.waitForTimeout(300);
  expect(distance(stopped, await position(page))).toBeLessThan(0.1);
  await page.getByRole('button', { name: 'Switch to Design Mode' }).click();
  await expect(page.getByTestId('touch-dpad')).toHaveCount(0);
  await page.getByRole('button', { name: 'Switch to Explore Mode' }).click();
  await expect(page.getByTestId('touch-dpad')).toBeVisible();
  await touch.detach();
});
