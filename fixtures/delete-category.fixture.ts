import { test as base } from "./access-token.fixture";
import { deleteCategory } from "../utils/category-helper";

type CategoryFixtures = {
  deleteCategory: (id: number) => Promise<void>;
};

export const test = base.extend<CategoryFixtures>({
  deleteCategory: async ({ request, accessToken }, use) => {
    try {
      const removeCategory = async (id: number): Promise<void> => {
        await deleteCategory(request, accessToken, id);
      };

      await use(removeCategory);
    } finally {
    }
  },
});

export { expect } from "@playwright/test";
