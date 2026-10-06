import { test, expect } from "@playwright/test";

test.describe("Login", () => {
  test("should show validation error when email is wrong format", async ({
    page,
  }) => {
    await page.goto(`${process.env.WEB_URL}/signin`);

    await expect(page.getByRole("button", { name: "เข้าใช้งาน" })).toBeVisible();

    await page.getByPlaceholder("email@example.com").fill("t.com");
    await page.locator("#password").fill("P@ssw0rd");
    await page.getByRole("button", { name: "เข้าใช้งาน" }).click();

    await expect(page.getByText("Please enter a valid email.")).toBeVisible();
  });

  test("should login successfully", async ({ page }) => {
    await page.goto(`${process.env.WEB_URL}/signin`);

    await expect(page.getByRole("button", { name: "เข้าใช้งาน" })).toBeVisible();

    await page.getByPlaceholder("email@example.com").fill("t@m.com");
    await page.locator("#password").fill("P@ssw0rd");
    await page.getByRole("button", { name: "เข้าใช้งาน" }).click();

    await page.waitForURL(`${process.env.WEB_URL}/transaction`);

    await expect(page.getByText("เงินทั้งหมด")).toBeVisible();
  });
});
