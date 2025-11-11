import { test, expect } from "@playwright/test";

const requiredTokens = ["E2E_SESSION_TOKEN", "E2E_REFRESH_TOKEN"] as const;
const skipDashboard = requiredTokens.some((key) => !process.env[key]);

(skipDashboard ? test.describe.skip : test.describe)("Dashboard reservas", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "sb-access-token", value: process.env.E2E_SESSION_TOKEN!, domain: "localhost", path: "/" },
      { name: "sb-refresh-token", value: process.env.E2E_REFRESH_TOKEN!, domain: "localhost", path: "/" },
    ]);
  });

  test("Bloqueia quarta reserva", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText(/Limite Mensal/i)).toBeVisible();
    const button = page.getByRole("button", { name: /Reservar Agora/i });
    if (await button.isDisabled()) {
      await expect(page.getByText(/Limite de reservas atingido/i)).toBeVisible();
    }
  });
});
