import { test as base, expect } from "./access-token.fixture";
import { environment } from "../config/environment";

type TransactionType = "Income" | "Expense";

type CategoryInput = {
  name: string;
  transactionType: TransactionType;
};

type Category = {
  id: number;
  name: string;
  transactionType: TransactionType;
};

type CategoryFixtures = {
  createCategory: (input: CategoryInput) => Promise<Category>;
};

export const test = base.extend<CategoryFixtures>({
  createCategory: async ({ request, accessToken }, use) => {
    const createdCategoryIds: number[] = [];

    const create = async ({
      name,
      transactionType,
    }: CategoryInput): Promise<Category> => {
      const response = await request.post(`${environment.apiUrl}/api/Categories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        data: {
          name,
          transactionType,
        },
      });

      expect(response.ok()).toBeTruthy();
      const category: Category = await response.json();
      createdCategoryIds.push(category.id);

      return category;
    };

    await use(create);

    for (const id of createdCategoryIds) {
      const response = await request.delete(
        `${environment.apiUrl}/api/Categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      expect(response.ok()).toBeTruthy();
    }
  },
});

export { expect } from "@playwright/test";
