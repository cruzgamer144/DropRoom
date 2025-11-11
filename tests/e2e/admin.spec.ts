import { test, expect } from "@playwright/test";

const adminTokens = ["E2E_ADMIN_ACCESS", "E2E_ADMIN_REFRESH"] as const;
const skipAdmin = adminTokens.some((key) => !process.env[key]);

(skipAdmin ? test.describe.skip : test.describe)("Admin CRUD", () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      { name: "sb-access-token", value: process.env.E2E_ADMIN_ACCESS!, domain: "localhost", path: "/" },
      { name: "sb-refresh-token", value: process.env.E2E_ADMIN_REFRESH!, domain: "localhost", path: "/" },
    ]);
  });

  test("Lista secções principais", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByText(/Painel DropRoom/)).toBeVisible();
    await expect(page.getByText(/Drops/)).toBeVisible();
    await expect(page.getByText(/Convites/)).toBeVisible();
    await expect(page.getByText(/Reservas/)).toBeVisible();
    await expect(page.getByText(/Utilizadores/)).toBeVisible();
  });
});
