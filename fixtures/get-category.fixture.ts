import { test as base, expect } from "./access-token.fixture";
import { environment } from "../config/environment";

type TransactionType = "Income" | "Expense";

type Category = {
  id: number;
  name: string;
  transactionType: TransactionType;
};

type CategoryFixtures = {
  getCategory: (name: string) => Promise<Category[]>;
};

export const test = base.extend<CategoryFixtures>({
  getCategory: async ({ request, accessToken }, use) => {
    const loadCategory = async (name: string): Promise<Category[]> => {
      const response = await request.get(`${environment.apiUrl}/api/Categories`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          name: name,
        },
      });

      expect(response.ok()).toBeTruthy();
      const category: Category[] = await response.json();
      return category;
    };

    await use(loadCategory);
  },
});

export { expect } from "@playwright/test";
