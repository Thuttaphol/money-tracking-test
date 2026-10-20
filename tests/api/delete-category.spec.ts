import { randomUUID } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";
import type * as z from "zod";
import { test as base, expect } from "../../fixtures/access-token.fixture";
import { environment } from "../../config/environment";
import { deleteCategory } from "../../data/test-data-helper";
import { ApiErrorResponse } from "../../zod/api-response.schema";
import {
  CategoryDeleteResponse,
  CategoryResponse,
} from "../../zod/category-response.schema";
import { type TransactionType } from "../../types/transaction";

type Category = z.infer<typeof CategoryResponse>;

const test = base.extend<{
  createCategory: (transactionType: TransactionType) => Promise<Category>;
}>({
  createCategory: async ({ request, accessToken }, use) => {
    const categoryIds: number[] = [];

    try {
      await use(async (transactionType) => {
        const response = await request.post(`${environment.apiUrl}/api/Categories`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: {
            name: `DELETE test ${randomUUID()}`,
            transactionType,
          },
        });

        const body = await response.json();
        const { id } = CategoryResponse.pick({ id: true }).parse(body);
        categoryIds.push(id);

        expect(response.status()).toBe(200);
        return CategoryResponse.parse(body);
      });
    } finally {
      await Promise.all(
        categoryIds.map((id) => deleteCategory(id, environment.testUser.id!)),
      );
    }
  },
});

async function deleteCategoryThroughApi(
  request: APIRequestContext,
  categoryId: number,
  accessToken: string,
) {
  const response = await request.delete(
    `${environment.apiUrl}/api/Categories/${categoryId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  expect(response.status()).toBe(200);
  return CategoryDeleteResponse.parse(await response.json());
}

async function expectCategoryMissing(
  request: APIRequestContext,
  categoryId: number,
  accessToken: string,
) {
  const response = await request.get(
    `${environment.apiUrl}/api/Categories/${categoryId}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  expect(response.status()).toBe(404);
  const error = ApiErrorResponse.parse(await response.json());
  expect(error.status).toBe(404);
}

test.describe("DELETE /api/Categories/{categoryId}", () => {
  test.beforeAll(async () => {
    if (!environment.testUser.id) {
      throw new Error("TEST_USER_ID is required for category cleanup.");
    }
  });

  for (const transactionType of ["Income", "Expense"] as const) {
    test(`deletes an ${transactionType} category successfully`, async ({
      request,
      createCategory,
      accessToken,
    }) => {
      const category = await createCategory(transactionType);

      const result = await deleteCategoryThroughApi(
        request,
        category.id,
        accessToken,
      );

      expect(result.isDeleted).toBe(true);
      await expectCategoryMissing(request, category.id, accessToken);
    });
  }

  test("returns isDeleted false when the category does not exist", async ({
    request,
    createCategory,
    accessToken,
  }) => {
    const category = await createCategory("Expense");
    await deleteCategory(category.id, environment.testUser.id!);
    await expectCategoryMissing(request, category.id, accessToken);

    const result = await deleteCategoryThroughApi(request, category.id, accessToken);

    expect(result.isDeleted).toBe(false);
    await expectCategoryMissing(request, category.id, accessToken);
  });

  test("returns isDeleted false when deleting the same category twice", async ({
    request,
    createCategory,
    accessToken,
  }) => {
    const category = await createCategory("Income");

    const firstResult = await deleteCategoryThroughApi(
      request,
      category.id,
      accessToken,
    );
    expect(firstResult.isDeleted).toBe(true);
    await expectCategoryMissing(request, category.id, accessToken);

    const secondResult = await deleteCategoryThroughApi(
      request,
      category.id,
      accessToken,
    );
    expect(secondResult.isDeleted).toBe(false);
    await expectCategoryMissing(request, category.id, accessToken);
  });

  test("deletes only the requested category", async ({
    request,
    createCategory,
    accessToken,
  }) => {
    const category = await createCategory("Expense");
    const otherCategory = await createCategory("Income");

    const result = await deleteCategoryThroughApi(request, category.id, accessToken);
    expect(result.isDeleted).toBe(true);
    await expectCategoryMissing(request, category.id, accessToken);

    const response = await request.get(
      `${environment.apiUrl}/api/Categories/${otherCategory.id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    expect(response.status()).toBe(200);
    expect(CategoryResponse.parse(await response.json())).toEqual(otherCategory);
  });
});
