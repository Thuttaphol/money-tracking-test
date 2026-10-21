import { expect, type Locator, type Page } from "@playwright/test";
import { environment } from "../config/environment";
import { TransactionType } from "../types/transaction";
import { CategoryListPage } from "./category-list-page";

export class CategoryAddPage {
  readonly page: Page;
  readonly categoryHeader: Locator;
  readonly nameField: Locator;
  readonly transactionTypeField: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryHeader = page.getByText("ระบุรายละเอียด");
    this.nameField = page.getByPlaceholder("ชื่อรายการ");
    this.transactionTypeField = page.getByTestId("transaction-type-select");
    this.saveButton = page.getByRole("button", { name: "บันทึก" });
  }

  async gotoAddCategory() {
    await this.page.goto(`${environment.webUrl}/category`);
    const categoryListPage = new CategoryListPage(this.page);
    await expect(categoryListPage.categoryListHeader).toBeVisible();

    const addButton = this.page.getByTestId("add-category-button");
    await expect(addButton).toBeEnabled();
    await addButton.click();
    await this.page.waitForURL(`${environment.webUrl}/category/add`);
    await expect(this.page).toHaveURL(`${environment.webUrl}/category/add`);
    await expect(this.categoryHeader).toBeVisible();
  }

  async enterCategoryName(categoryName: string) {
    await this.nameField.fill(categoryName);
  }

  async selecTransactionType(transactionType: TransactionType) {
    await this.transactionTypeField.click();
    await this.page.getByRole("option", { name: transactionType }).click();
  }

  async addNewCategory() {
    const categoryListPage = new CategoryListPage(this.page);
    await this.saveButton.click();
    await expect(categoryListPage.categoryListHeader).toBeVisible();
  }
}
