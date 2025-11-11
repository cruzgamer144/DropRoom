import { test, expect } from "@playwright/test";

const requiredEnv = ["E2E_INVITE_CODE", "E2E_MEMBER_EMAIL"] as const;

const missingEnv = requiredEnv.some((key) => !process.env[key]);

(missingEnv ? test.describe.skip : test.describe)("Convite e login", () => {
  test("Convite inválido mostra erro", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=email]", "invalid@example.com");
    await page.fill("input[name=code]", "INVALID");
    await page.click("button[type=submit]");
    await expect(page.getByText(/convite inválido/i)).toBeVisible();
  });

  test("Convite válido dispara magic link", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name=email]", process.env.E2E_MEMBER_EMAIL!);
    await page.fill("input[name=code]", process.env.E2E_INVITE_CODE!);
    await page.click("button[type=submit]");
    await expect(page.getByText(/Magic Link/i)).toBeVisible();
  });
});
