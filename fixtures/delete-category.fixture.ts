import { test as base, expect } from "./access-token.fixture";
import { environment } from "../config/environment";

type DeleteCategoryResult = {
  isDeleted: boolean;
};

type CategoryFixtures = {
  deleteCategory: (id: number) => Promise<DeleteCategoryResult>;
};

export const test = base.extend<CategoryFixtures>({
  deleteCategory: async ({ request, accessToken }, use) => {
    const removeCategory = async (id: number): Promise<DeleteCategoryResult> => {
      const response = await request.delete(
        `${environment.apiUrl}/api/Categories/${id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      expect(response.ok()).toBeTruthy();

      const deleteResult: DeleteCategoryResult = await response.json();
      return deleteResult;
    };

    await use(removeCategory);
  },
});

export { expect } from "@playwright/test";
