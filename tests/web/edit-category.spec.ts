import { randomUUID } from "node:crypto";
import { test, expect } from "../../fixtures/create-category.fixture";
import { DetailCategoryPage } from "../../page-object-model/category-detail-page";
import { environment } from "../../config/environment";

test("change category name and transaction type to Expense successfully", async ({
  page,
  createCategory,
}) => {
  const category = await createCategory({
    name: `ทดสอบสร้างประเภทรายการ ${randomUUID().split("-")[0]}`,
    transactionType: "Income",
  });

  await page.goto(`${environment.webUrl}/category`);
  await expect(page.getByText("ประเภทรายการ", { exact: true })).toBeVisible();
  await page.getByText(category.name).click();

  const detailCategoryPage = new DetailCategoryPage(page);

  await detailCategoryPage.changeCategoryName(`แก้ไข ${category.name}`);
  await detailCategoryPage.changeTransactionType("Expense");
  await page.getByRole("button", { name: "บันทึก" }).click();

  await expect(page).toHaveURL(`${environment.webUrl}/category`);
  await expect(
    page.getByText(`แก้ไข ${category.name}`, { exact: true }),
  ).toBeVisible();
});

test("change category name and transaction type to Income successfully", async ({
  page,
  createCategory,
}) => {
  const category = await createCategory({
    name: `ทดสอบสร้างประเภทรายการ ${randomUUID().split("-")[0]}`,
    transactionType: "Expense",
  });

  await page.goto(`${environment.webUrl}/category`);
  await expect(page.getByText("ประเภทรายการ", { exact: true })).toBeVisible();
  await page.getByText(category.name).click();

  const detailCategoryPage = new DetailCategoryPage(page);

  await detailCategoryPage.changeCategoryName(`แก้ไข ${category.name}`);
  await detailCategoryPage.changeTransactionType("Income");
  await page.getByRole("button", { name: "บันทึก" }).click();

  await expect(page).toHaveURL(`${environment.webUrl}/category`);
  await expect(
    page.getByText(`แก้ไข ${category.name}`, { exact: true }),
  ).toBeVisible();
});
