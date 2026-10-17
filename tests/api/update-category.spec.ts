import { randomUUID } from "node:crypto";
import type { APIRequestContext } from "@playwright/test";
import type * as z from "zod";
import { test as base, expect } from "../../fixtures/access-token.fixture";
import { environment } from "../../config/environment";
import { deleteCategory } from "../../data/test-data-helper";
import {
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from "../../zod/api-response.schema";
import { CategoryResponse } from "../../zod/category-response.schema";

type Category = z.infer<typeof CategoryResponse>;

const test = base.extend<{ category: Category }>({
  category: async ({ request, accessToken }, use) => {
    const response = await request.post(`${environment.apiUrl}/api/Categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: `PUT test ${randomUUID()}`,
        transactionType: "Expense",
      },
    });

    const body = await response.json();
    const { id } = CategoryResponse.pick({ id: true }).parse(body);

    try {
      expect(response.status()).toBe(200);
      await use(CategoryResponse.parse(body));
    } finally {
      await deleteCategory(id, environment.testUser.id!);
    }
  },
});

async function expectStoredCategory(
  request: APIRequestContext,
  category: Category,
  accessToken: string,
) {
  const response = await request.get(
    `${environment.apiUrl}/api/Categories/${category.id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  expect(response.status()).toBe(200);
  expect(CategoryResponse.parse(await response.json())).toEqual(category);
}

test.describe("PUT /api/Categories", () => {
  test.beforeAll(async () => {
    if (!environment.testUser.id) {
      throw new Error("TEST_USER_ID is required for category cleanup.");
    }
  });

  for (const transactionType of ["Income", "Expense"] as const) {
    test(`updates a category with transaction type ${transactionType}`, async ({
      request,
      category,
      accessToken,
    }) => {
      // Start with the opposite type to verify that the type really changes.
      const initialType = transactionType === "Income" ? "Expense" : "Income";
      if (category.transactionType !== initialType) {
        const response = await request.put(`${environment.apiUrl}/api/Categories`, {
          headers: { Authorization: `Bearer ${accessToken}` },
          data: { ...category, transactionType: initialType },
        });
        expect(response.status()).toBe(200);
        expect(CategoryResponse.parse(await response.json())).toEqual({
          ...category,
          transactionType: initialType,
        });
      }

      const updatedCategory = {
        id: category.id,
        name: `หมวดหมู่ ทดสอบ ${transactionType}`,
        transactionType,
      };
      const response = await request.put(`${environment.apiUrl}/api/Categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: updatedCategory,
      });

      expect(response.status()).toBe(200);
      expect(CategoryResponse.parse(await response.json())).toEqual(updatedCategory);
      await expectStoredCategory(request, updatedCategory, accessToken);
    });
  }

  for (const length of [3, 50]) {
    test(`accepts a name with ${length} characters`, async ({
      request,
      category,
      accessToken,
    }) => {
      const updatedCategory = { ...category, name: "a".repeat(length) };
      const response = await request.put(`${environment.apiUrl}/api/Categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: updatedCategory,
      });

      expect(response.status()).toBe(200);
      expect(CategoryResponse.parse(await response.json())).toEqual(updatedCategory);
      await expectStoredCategory(request, updatedCategory, accessToken);
    });
  }

  const invalidRequests: {
    title: string;
    field: string;
    changes: Record<string, unknown>;
  }[] = [
    { title: "an empty name", field: "name", changes: { name: "" } },
    {
      title: "a name shorter than 3 characters",
      field: "name",
      changes: { name: "ab" },
    },
    {
      title: "a name longer than 50 characters",
      field: "name",
      changes: { name: "a".repeat(51) },
    },
    { title: "a missing name", field: "name", changes: { name: undefined } },
    { title: "a null name", field: "name", changes: { name: null } },
    {
      title: "an invalid transaction type",
      field: "transactionType",
      changes: { transactionType: "Invalid" },
    },
    {
      title: "a missing transaction type",
      field: "transactionType",
      changes: { transactionType: undefined },
    },
    {
      title: "a null transaction type",
      field: "transactionType",
      changes: { transactionType: null },
    },
  ];

  for (const { title, field, changes } of invalidRequests) {
    test(`rejects ${title} without changing the category`, async ({
      request,
      category,
      accessToken,
    }) => {
      const response = await request.put(`${environment.apiUrl}/api/Categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { ...category, ...changes },
      });

      expect(response.status()).toBe(400);
      const error = ApiValidationErrorResponse.parse(await response.json());
      expect(error.status).toBe(400);
      expect(
        Object.entries(error.errors).some(
          ([key, messages]) =>
            key.toLowerCase() === field.toLowerCase() && messages.length > 0,
        ),
      ).toBe(true);
      await expectStoredCategory(request, category, accessToken);
    });
  }

  test("returns 404 for a category that no longer exists", async ({
    request,
    category,
    accessToken,
  }) => {
    await deleteCategory(category.id, environment.testUser.id!);

    const response = await request.put(`${environment.apiUrl}/api/Categories`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { ...category, name: "Missing category" },
    });

    expect(response.status()).toBe(404);
    const error = ApiErrorResponse.parse(await response.json());
    expect(error.status).toBe(404);
  });
});
