import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("http://192.168.0.2:3000");

  await expect(page).toHaveTitle(/จดเงิน/);
});

test("get started link", async ({ page }) => {
  await page.goto("http://192.168.0.2:3000/transaction");

  await expect(page.getByText("เงินทั้งหมด")).toBeVisible();
  await expect(page.getByRole("button", { name: "เพิ่มรายการ" })).toBeVisible();
});
