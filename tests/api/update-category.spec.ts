import { randomUUID } from "node:crypto";
import { test as base, expect, type APIRequestContext } from "@playwright/test";
import type * as z from "zod";
import { environment } from "../../config/environment";
import { deleteCategory } from "../../data/test-data-helper";
import {
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from "../../zod/api-response.schema";
import { AccessTokenResponse } from "../../zod/auth-response.schema";
import { CategoryResponse } from "../../zod/category-response.schema";

type Category = z.infer<typeof CategoryResponse>;

let accessToken: string;

const test = base.extend<{ category: Category }>({
  category: async ({ request }, use) => {
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

async function expectStoredCategory(request: APIRequestContext, category: Category) {
  const response = await request.get(
    `${environment.apiUrl}/api/Categories/${category.id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  expect(response.status()).toBe(200);
  expect(CategoryResponse.parse(await response.json())).toEqual(category);
}

test.describe("PUT /api/Categories", () => {
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
    test(`updates a category with transaction type ${transactionType}`, async ({
      request,
      category,
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
      await expectStoredCategory(request, updatedCategory);
    });
  }

  for (const length of [3, 50]) {
    test(`accepts a name with ${length} characters`, async ({
      request,
      category,
    }) => {
      const updatedCategory = { ...category, name: "a".repeat(length) };
      const response = await request.put(`${environment.apiUrl}/api/Categories`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: updatedCategory,
      });

      expect(response.status()).toBe(200);
      expect(CategoryResponse.parse(await response.json())).toEqual(updatedCategory);
      await expectStoredCategory(request, updatedCategory);
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
      await expectStoredCategory(request, category);
    });
  }

  test("returns 404 for a category that no longer exists", async ({
    request,
    category,
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
