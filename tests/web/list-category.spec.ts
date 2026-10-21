import { randomUUID } from "node:crypto";
import { test, expect } from "../../fixtures/index.fixture";
import { CategoryListPage } from "../../page-object-model/category-list-page";
import { testData } from "../../data/test-data";
import { type TransactionType } from "../../types/transaction";
import { Category } from "../../types/category";

test("open category list page and it has transaction success fully", async ({
  page,
  createCategory,
}) => {
  const createdCategory: Category[] = [];

  for (const category of testData.categories) {
    const categoryResult = await createCategory({
      name: `${category.name}-${randomUUID().split("-")[0]}`,
      transactionType: category.transactionType as TransactionType,
    });

    createdCategory.push(categoryResult);
  }

  const categoryListPage = new CategoryListPage(page);

  await categoryListPage.goToCategoryListPage();

  createdCategory.forEach(async (category) => {
    await expect(page.getByText(category.name)).toBeVisible();
  });
});

test("open category list page and it has no transaction success fully", async ({
  page,
}) => {
  const categoryListPage = new CategoryListPage(page);

  await categoryListPage.goToCategoryListPage();

  await expect(categoryListPage.labelNotFound).toBeVisible();
});
