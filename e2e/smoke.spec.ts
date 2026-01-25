import { test, expect } from '@playwright/test';

test.describe('Askvault Smoke Tests', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');

    // Page should load (either login or redirect somewhere)
    await expect(page).toHaveURL(/login|dashboard/);
  });

  test('login page has form elements', async ({ page }) => {
    await page.goto('/login');

    // Check form elements exist (using more flexible selectors)
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();

    // Check link to register
    await expect(page.getByRole('link', { name: /sign up/i })).toBeVisible();

    // Check "Sign in" text is visible somewhere on page
    await expect(page.getByText(/sign in/i).first()).toBeVisible();
  });

  test('register page loads correctly', async ({ page }) => {
    await page.goto('/register');

    // Check form elements exist
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|create account/i })).toBeVisible();
  });

  test('can navigate from login to register', async ({ page }) => {
    await page.goto('/login');

    // Click sign up link
    await page.getByRole('link', { name: /sign up/i }).click();

    // Should be on register page
    await expect(page).toHaveURL(/register/);
  });

  test('invalid login shows error or stays on login', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('invalid@test.com');
    await page.getByLabel(/password/i).fill('wrongpassword123');

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should stay on login page (not redirect to dashboard)
    // Wait a bit for potential redirect
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/login/);
  });

  test('login form has required fields', async ({ page }) => {
    await page.goto('/login');

    // Email and password fields should be required
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);

    await expect(emailInput).toHaveAttribute('required', '');
    await expect(passwordInput).toHaveAttribute('required', '');
  });
});
