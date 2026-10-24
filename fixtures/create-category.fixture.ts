import { test as base } from "./access-token.fixture";
import { createCategory, deleteCategory } from "../utils/category-helper";
import { CategoryResponse } from "../zod/category-response.schema";
import type { Category, CategoryInput } from "../types/category";

type CategoryFixtures = {
  createCategory: (input: CategoryInput) => Promise<Category>;
};

export const test = base.extend<CategoryFixtures>({
  createCategory: async ({ request, accessToken }, use) => {
    const createdCategoryIds: number[] = [];

    try {
      const addCategory = async ({
        name,
        transactionType,
      }: CategoryInput): Promise<Category> => {
        const category: Category = await createCategory(request, accessToken, {
          name: name,
          transactionType: transactionType,
        });

        createdCategoryIds.push(category.id);
        const result = CategoryResponse.parse(category);

        return result;
      };

      await use(addCategory);
    } finally {
      await Promise.allSettled(
        createdCategoryIds.map(
          async (id) => await deleteCategory(request, accessToken, id),
        ),
      );
    }
  },
});

export { expect } from "@playwright/test";
