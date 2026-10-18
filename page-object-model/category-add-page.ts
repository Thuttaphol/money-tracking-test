import { type Locator, type Page } from "@playwright/test";
import { environment } from "../config/environment";

export class AddCategoryPage {
  readonly page: Page;
  readonly categoryHeader: Locator;
  readonly nameField: Locator;
  readonly transactionTypeField: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.categoryHeader = page.getByText("ระบุรายละเอียด", { exact: true });
    this.nameField = page.getByPlaceholder("ชื่อรายการ");
    this.transactionTypeField = page.getByTestId("transaction-type-select");
    this.saveButton = page.getByRole("button", { name: "บันทึก" });
  }

  async gotoAddCategory() {
    await this.page.goto(`${environment.webUrl}/category`);
    await this.page.getByTestId("add-category-button").click();
  }
}
