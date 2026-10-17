import { test as setup, expect } from "@playwright/test";
import path from "path";
import { environment } from "../../config/environment";

const authFile = path.join(__dirname, "../../playwright/.auth/user.json");

setup("login", async ({ page }) => {
  await page.goto(`${environment.webUrl}/signin`);
  await page
    .getByPlaceholder("email@example.com")
    .fill(`${environment.testUser.email}`);
  await page.locator("#password").fill(`${environment.testUser.password}`);
  await page.getByRole("button", { name: "เข้าใช้งาน" }).click();

  await page.waitForURL(`${environment.webUrl}/transaction`);

  await expect(page.getByText("เงินทั้งหมด")).toBeVisible();

  // End of authentication steps.

  await page.context().storageState({ path: authFile });
});
