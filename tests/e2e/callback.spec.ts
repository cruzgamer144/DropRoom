import { test, expect } from "@playwright/test";

const callbackTokens = ["E2E_SESSION_TOKEN", "E2E_REFRESH_TOKEN", "E2E_INVITE_CODE"] as const;
const skipCallback = callbackTokens.some((key) => !process.env[key]);

(skipCallback ? test.describe.skip : test.describe)("Callback", () => {
  test("Redireciona para dashboard após callback", async ({ page }) => {
    await page.context().addCookies([
      { name: "sb-access-token", value: process.env.E2E_SESSION_TOKEN!, domain: "localhost", path: "/" },
      { name: "sb-refresh-token", value: process.env.E2E_REFRESH_TOKEN!, domain: "localhost", path: "/" },
    ]);

    const response = await page.goto(`/auth/callback?invite=${process.env.E2E_INVITE_CODE}`);
    expect(response?.status()).toBeLessThan(400);
  });
});
