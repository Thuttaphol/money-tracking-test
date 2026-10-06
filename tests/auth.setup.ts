import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  await page.goto(`${process.env.WEB_URL}/signin`);
  await page.getByPlaceholder("email@example.com").fill("t@m.com");
  await page.locator("#password").fill("P@ssw0rd");
  await page.getByRole("button", { name: "เข้าใช้งาน" }).click();

  await page.waitForURL(`${process.env.WEB_URL}/transaction`);

  await expect(page.getByText("เงินทั้งหมด")).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
