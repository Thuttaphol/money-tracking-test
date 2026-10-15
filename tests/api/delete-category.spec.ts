import { randomUUID } from "node:crypto";
import { test as base, expect, type APIRequestContext } from "@playwright/test";
import type * as z from "zod";
import { environment } from "../../config/environment";
import { deleteCategory } from "../../data/test-data-helper";
import { ApiErrorResponse } from "../../zod/api-response.schema";
import { AccessTokenResponse } from "../../zod/auth-response.schema";
import {
  CategoryDeleteResponse,
  CategoryResponse,
} from "../../zod/category-response.schema";

type Category = z.infer<typeof CategoryResponse>;
type TransactionType = "Income" | "Expense";

let accessToken: string;

const test = base.extend<{
  createCategory: (transactionType: TransactionType) => Promise<Category>;
}>({
  createCategory: async ({ request }, use) => {
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
  test.beforeAll(async ({ request }) => {
    if (!environment.testUser.id) {
      throw new Error("TEST_USER_ID is required for category cleanup.");
    }

    const response = await request.post(`${environment.apiUrl}/api/auth/login`, {
      data: {
        email: environment.testUser.email,
        password: environment.testUser.password,
      },
    });

    expect(response.status()).toBe(200);
    accessToken = AccessTokenResponse.parse(await response.json()).accessToken;
  });

  for (const transactionType of ["Income", "Expense"] as const) {
    test(`deletes an ${transactionType} category successfully`, async ({
      request,
      createCategory,
    }) => {
      const category = await createCategory(transactionType);

      const result = await deleteCategoryThroughApi(request, category.id);

      expect(result.isDeleted).toBe(true);
      await expectCategoryMissing(request, category.id);
    });
  }

  test("returns isDeleted false when the category does not exist", async ({
    request,
    createCategory,
  }) => {
    const category = await createCategory("Expense");
    await deleteCategory(category.id, environment.testUser.id!);
    await expectCategoryMissing(request, category.id);

    const result = await deleteCategoryThroughApi(request, category.id);

    expect(result.isDeleted).toBe(false);
    await expectCategoryMissing(request, category.id);
  });

  test("returns isDeleted false when deleting the same category twice", async ({
    request,
    createCategory,
  }) => {
    const category = await createCategory("Income");

    const firstResult = await deleteCategoryThroughApi(request, category.id);
    expect(firstResult.isDeleted).toBe(true);
    await expectCategoryMissing(request, category.id);

    const secondResult = await deleteCategoryThroughApi(request, category.id);
    expect(secondResult.isDeleted).toBe(false);
    await expectCategoryMissing(request, category.id);
  });

  test("deletes only the requested category", async ({
    request,
    createCategory,
  }) => {
    const category = await createCategory("Expense");
    const otherCategory = await createCategory("Income");

    const result = await deleteCategoryThroughApi(request, category.id);
    expect(result.isDeleted).toBe(true);
    await expectCategoryMissing(request, category.id);

    const response = await request.get(
      `${environment.apiUrl}/api/Categories/${otherCategory.id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    expect(response.status()).toBe(200);
    expect(CategoryResponse.parse(await response.json())).toEqual(otherCategory);
  });
});
