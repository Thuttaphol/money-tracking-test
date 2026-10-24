import { expect, type Locator, type Page } from "@playwright/test";
import { environment } from "../config/environment";

export class CategoryListPage {
  readonly page: Page;
  readonly categoryListHeader: Locator;
  readonly addCategoryButton: Locator;
  readonly labelNotFound: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryListHeader = page.getByText("ประเภทรายการ", { exact: true });
    this.addCategoryButton = page.getByTestId("add-category-button");
    this.labelNotFound = page.getByText("ยังไม่มีข้อมูล", { exact: true });
  }

  async goToCategoryListPage() {
    await this.page.goto(`${environment.webUrl}/category`);
    await expect(this.categoryListHeader).toBeVisible();
    await expect(this.addCategoryButton).toBeVisible();
  }
}
