import { randomUUID } from "node:crypto";
import { test, expect } from "../../fixtures/index.fixture";
import { CategoryAddPage } from "../../page-object-model/category-add-page";
import { environment } from "../../config/environment";

test("go to add category page successfully", async ({ page }) => {
  const categoryPage = new CategoryAddPage(page);
  await categoryPage.gotoAddCategory();

  await expect(categoryPage.categoryHeader).toBeVisible();
  await expect(categoryPage.nameField).toBeVisible();
  await expect(categoryPage.transactionTypeField).toBeVisible();
});

for (const transactionType of ["Income", "Expense"]) {
  test(`add category with transaction type ${transactionType}`, async ({
    page,
    getCategory,
    deleteCategory,
  }) => {
    const categoryPage = new CategoryAddPage(page);
    await categoryPage.gotoAddCategory();

    const categoryName = `สร้างประเภทรายการแบบ ${transactionType} - ${randomUUID().split("-")[0]}`;

    await categoryPage.nameField.fill(categoryName);
    await categoryPage.transactionTypeField.click();
    await page.getByRole("option", { name: transactionType }).click();
    await categoryPage.saveButton.click();

    await expect(page).toHaveURL(`${environment.webUrl}/category`);
    await expect(page.getByText(categoryName)).toBeVisible();

    //tear down
    const category = await getCategory(categoryName);
    await deleteCategory(category[0].id);
  });
}
