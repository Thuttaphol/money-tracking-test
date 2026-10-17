import { type Locator, type Page } from "@playwright/test";

type TransactionType = "Income" | "Expense";

export class DetailCategoryPage {
  readonly page: Page;
  readonly categoryHeader: Locator;
  readonly nameField: Locator;
  readonly transactionTypeField: Locator;
  readonly transactionTypeValue: Locator;
  readonly saveButton: Locator;
  readonly deleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryHeader = page.getByText("ระบุรายละเอียด", { exact: true });
    this.nameField = page.getByPlaceholder("ชื่อรายการ");
    this.transactionTypeField = page.getByTestId("transaction-type-select");
    this.transactionTypeValue = page.locator("input[name='transactionType']");
    this.saveButton = page.getByRole("button", { name: "บันทึก" });
    this.deleteButton = page.getByRole("button", { name: "ลบ" });
  }

  async changeCategoryName(name: string) {
    await this.nameField.fill(name);
  }

  async changeTransactionType(type: TransactionType) {
    await this.transactionTypeField.click();
    await this.page
      .getByRole("option", {
        name: type,
        exact: true,
      })
      .click();
  }

  async deleteCategory(name: string) {
    await this.page.getByText(`${name}`, { exact: false }).click();
    await this.deleteButton.click();
  }
}
