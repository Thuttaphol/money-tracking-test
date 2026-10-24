import { randomUUID } from "node:crypto";
import { test, expect } from "../../../fixtures/index.fixture";
import { CategoryListPage } from "../../../page-object-model/category-list-page";
import { CategoryDetailPage } from "../../../page-object-model/category-detail-page";
import { environment } from "../../../config/environment";

for (const transactionType of ["Income", "Expense"] as const) {
  test(`delete category with transaction type ${transactionType} successfully`, async ({
    page,
    createCategory,
    getCategory,
  }) => {
    // prepare
    const category = await createCategory({
      name: `ทดสอบลบประเภทรายการ ${randomUUID().split("-")[0]}`,
      transactionType,
    });
    const otherCategory = await createCategory({
      name: `ประเภทรายการที่เก็บไว้ ${randomUUID().split("-")[0]}`,
      transactionType,
    });
    const categoryListPage = new CategoryListPage(page);
    const categoryDetailPage = new CategoryDetailPage(page);

    // execute
    await categoryListPage.goToCategoryListPage();
    await categoryDetailPage.deleteCategory(category.name);

    // expected
    await expect(page).toHaveURL(`${environment.webUrl}/category`);
    await expect(categoryListPage.categoryListHeader).toBeVisible();
    await expect(page.getByText(otherCategory.name, { exact: true })).toBeVisible();
    await expect(page.getByText(category.name, { exact: true })).toHaveCount(0);
    expect(await getCategory(category.name)).toHaveLength(0);
  });
}
