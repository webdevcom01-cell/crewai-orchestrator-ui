import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page with Agents view', async ({ page }) => {
    await expect(page.getByText('Agents')).toBeVisible();
  });

  test('should navigate to Tasks view', async ({ page }) => {
    await page.getByRole('link', { name: /Tasks/i }).click();
    await expect(page.getByText('Task Flow')).toBeVisible();
  });

  test('should navigate to Run view', async ({ page }) => {
    await page.getByRole('link', { name: /Run/i }).click();
    await expect(page.getByText('Run Simulation')).toBeVisible();
  });

  test('should navigate to Export view', async ({ page }) => {
    await page.getByRole('link', { name: /Export/i }).click();
    await expect(page.getByText('Export')).toBeVisible();
  });
});

test.describe('Agents View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display agent list', async ({ page }) => {
    // Demo data should be loaded
    await expect(page.getByText('ResearchAgent')).toBeVisible({ timeout: 5000 });
  });

  test('should open agent form when clicking create button', async ({ page }) => {
    await page.getByRole('button', { name: /Create new agent/i }).click();
    await expect(page.getByText('Configure Agent')).toBeVisible();
  });

  test('should select agent and show details', async ({ page }) => {
    await page.getByText('ResearchAgent').click();
    await expect(page.getByText('Configure Agent')).toBeVisible();
    await expect(page.getByDisplayValue('ResearchAgent')).toBeVisible();
  });
});

test.describe('Tasks View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tasks');
  });

  test('should display task list', async ({ page }) => {
    await expect(page.getByText('Research Phase')).toBeVisible({ timeout: 5000 });
  });

  test('should open task form when clicking create button', async ({ page }) => {
    await page.getByRole('button', { name: /Create new task/i }).click();
    await expect(page.getByText('Configure Task Step')).toBeVisible();
  });
});

test.describe('Run View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/run');
  });

  test('should show run simulation view', async ({ page }) => {
    await expect(page.getByText('Run Simulation')).toBeVisible();
  });

  test('should show pipeline with demo tasks', async ({ page }) => {
    // Wait for demo data to load
    await expect(page.getByText(/Research Phase|research/i)).toBeVisible({ timeout: 5000 });
  });

  test('should have start button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Start/i })).toBeVisible();
  });
});
