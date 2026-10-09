import { test, expect } from "@playwright/test";

test.describe("Create transaction", () => {
  test("should create income successfully", async ({ page }) => {
    await page.goto("http://192.168.0.2:3000/transaction");

    await page.getByRole("button", { name: "เพิ่มรายการ" }).click();

    await expect(page.getByText("ระบุรายละเอียด")).toBeVisible();
    await expect(page.getByRole("button", { name: "บันทึก" })).toBeVisible();
  });
});
