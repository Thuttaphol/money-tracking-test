import { test as base, expect } from "./access-token.fixture";
import { type TransactionType } from "../types/transaction";
import { getCategory } from "../utils/category-helper";
import { GetCategoryResponse } from "../zod/category-response.schema";

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
      const response = await getCategory(request, accessToken, name);

      const result = GetCategoryResponse.parse(response);

      return result;
    };

    await use(loadCategory);
  },
});

export { expect } from "@playwright/test";
