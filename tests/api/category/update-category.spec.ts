import { randomUUID } from "node:crypto";
import { test, expect } from "../../../fixtures/index.fixture";
import { environment } from "../../../config/environment";
import {
  ApiErrorResponse,
  ApiValidationErrorResponse,
} from "../../../zod/api-response.schema";
import { CategoryResponse } from "../../../zod/category-response.schema";

const categoryUrl = `${environment.apiUrl}/api/Categories`;

test.describe("PUT /api/Categories", () => {
  for (const transactionType of ["Income", "Expense"] as const) {
    test(`updates a category with transaction type ${transactionType}`, async ({
      request,
      createCategory,
      getCategory,
      accessToken,
    }) => {
      // Arrange
      // Start with the opposite type to verify that the type really changes.
      const initialType = transactionType === "Income" ? "Expense" : "Income";
      const category = await createCategory({
        name: `PUT test ${randomUUID()}`,
        transactionType: initialType,
      });
      const updatedCategory = {
        id: category.id,
        name: `หมวดหมู่ ทดสอบ ${transactionType}`,
        transactionType,
      };

      // Act
      const response = await request.put(categoryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: updatedCategory,
      });

      // Assert
      expect(response.status()).toBe(200);
      expect(CategoryResponse.parse(await response.json())).toEqual(updatedCategory);
      expect(await getCategory(updatedCategory.name)).toContainEqual(
        updatedCategory,
      );
    });
  }

  for (const length of [3, 50]) {
    test(`accepts a name with ${length} characters`, async ({
      request,
      createCategory,
      getCategory,
      accessToken,
    }) => {
      // Arrange
      const category = await createCategory({
        name: `PUT test ${randomUUID()}`,
        transactionType: "Expense",
      });
      const updatedCategory = { ...category, name: "a".repeat(length) };

      // Act
      const response = await request.put(categoryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: updatedCategory,
      });

      // Assert
      expect(response.status()).toBe(200);
      expect(CategoryResponse.parse(await response.json())).toEqual(updatedCategory);
      expect(await getCategory(updatedCategory.name)).toContainEqual(
        updatedCategory,
      );
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
      createCategory,
      getCategory,
      accessToken,
    }) => {
      // Arrange
      const category = await createCategory({
        name: `PUT test ${randomUUID()}`,
        transactionType: "Expense",
      });
      const updatedCategory = { ...category, ...changes };

      // Act
      const response = await request.put(categoryUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: updatedCategory,
      });

      // Assert
      expect(response.status()).toBe(400);
      const error = ApiValidationErrorResponse.parse(await response.json());
      expect(error.status).toBe(400);
      expect(
        Object.entries(error.errors).some(
          ([key, messages]) =>
            key.toLowerCase() === field.toLowerCase() && messages.length > 0,
        ),
      ).toBe(true);
      expect(await getCategory(category.name)).toContainEqual(category);
    });
  }

  test("returns 404 for a category that no longer exists", async ({
    request,
    createCategory,
    deleteCategory,
    accessToken,
  }) => {
    // Arrange
    const category = await createCategory({
      name: `PUT test ${randomUUID()}`,
      transactionType: "Expense",
    });
    await deleteCategory(category.id);
    const updatedCategory = { ...category, name: "Missing category" };

    // Act
    const response = await request.put(categoryUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: updatedCategory,
    });

    // Assert
    expect(response.status()).toBe(404);
    const error = ApiErrorResponse.parse(await response.json());
    expect(error.status).toBe(404);
  });
});
