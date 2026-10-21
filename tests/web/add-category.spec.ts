import { randomUUID } from "node:crypto";
import { test, expect } from "../../fixtures/index.fixture";
import { CategoryAddPage } from "../../page-object-model/category-add-page";
import { environment } from "../../config/environment";
import { TransactionType } from "../../types/transaction";

test("go to add category page successfully", async ({ page }) => {
  // prepare
  const categoryPage = new CategoryAddPage(page);

  // execute
  await categoryPage.gotoAddCategory();

  // expected
  await expect(categoryPage.categoryHeader).toBeVisible();
  await expect(categoryPage.nameField).toBeVisible();
  await expect(categoryPage.transactionTypeField).toBeVisible();
});

for (const transactionType of [
  "Income" as TransactionType,
  "Expense" as TransactionType,
]) {
  test(`add category with transaction type ${transactionType}`, async ({
    page,
    getCategory,
    deleteCategory,
  }) => {
    // prepare
    const categoryPage = new CategoryAddPage(page);
    const categoryName = `สร้างประเภทรายการแบบ ${transactionType} - ${randomUUID().split("-")[0]}`;

    // execute
    await categoryPage.gotoAddCategory();
    await categoryPage.enterCategoryName(categoryName);
    await categoryPage.selecTransactionType(transactionType);
    await categoryPage.addNewCategory();

    // expected
    await expect(page).toHaveURL(`${environment.webUrl}/category`);
    await expect(page.getByText(categoryName)).toBeVisible();

    //tear down
    const category = await getCategory(categoryName);
    await deleteCategory(category[0].id);
  });
}

for (const length of [3, 5]) {
  test(`create category successfully by name with ${length} characters`, async ({
    page,
    getCategory,
    deleteCategory,
  }) => {
    // prepare
    const categoryPage = new CategoryAddPage(page);
    const categoryName = "a".repeat(length);

    // execute
    await categoryPage.gotoAddCategory();
    await categoryPage.enterCategoryName(categoryName);
    await categoryPage.selecTransactionType("Income");
    await categoryPage.addNewCategory();

    // tear down
    const category = await getCategory(categoryName);
    await deleteCategory(category[0].id);
  });
}

const invalidCategories: {
  title: string;
  changes: Record<string, string>;
}[] = [
  { title: "an empty name", changes: { name: "" } },
  {
    title: "a name shorter than 3 characters",
    changes: { name: "ab" },
  },
  {
    title: "a name longer than 50 characters",
    changes: { name: "b".repeat(51) },
  },
];

for (const { title, changes } of invalidCategories) {
  test(`can not create category with ${title}`, async ({ page }) => {
    // prepare
    const categoryPage = new CategoryAddPage(page);

    // execute
    await categoryPage.gotoAddCategory();
    await categoryPage.enterCategoryName(changes.name);
    await categoryPage.selecTransactionType("Income");
    await categoryPage.addNewCategory();

    //will implement expected after fixing app
  });
}
