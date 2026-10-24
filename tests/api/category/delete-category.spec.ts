import { randomUUID } from "node:crypto";
import { test, expect } from "../../../fixtures/index.fixture";
import { environment } from "../../../config/environment";
import { CategoryDeleteResponse } from "../../../zod/category-response.schema";

const categoryUrl = `${environment.apiUrl}/api/Categories`;

test.describe("DELETE /api/Categories/{categoryId}", () => {
  for (const transactionType of ["Income", "Expense"] as const) {
    test(`deletes an ${transactionType} category successfully`, async ({
      request,
      createCategory,
      getCategory,
      accessToken,
    }) => {
      // Arrange
      const category = await createCategory({
        name: `DELETE test ${randomUUID()}`,
        transactionType,
      });

      // Act
      const response = await request.delete(`${categoryUrl}/${category.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Assert
      expect(response.status()).toBe(200);
      const result = CategoryDeleteResponse.parse(await response.json());
      expect(result.isDeleted).toBe(true);
      expect(await getCategory(category.name)).toHaveLength(0);
    });
  }

  test("returns isDeleted false when the category does not exist", async ({
    request,
    createCategory,
    deleteCategory,
    getCategory,
    accessToken,
  }) => {
    // Arrange
    const category = await createCategory({
      name: `DELETE test ${randomUUID()}`,
      transactionType: "Expense",
    });
    await deleteCategory(category.id);

    // Act
    const response = await request.delete(`${categoryUrl}/${category.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    expect(response.status()).toBe(200);
    const result = CategoryDeleteResponse.parse(await response.json());
    expect(result.isDeleted).toBe(false);
    expect(await getCategory(category.name)).toHaveLength(0);
  });

  test("returns isDeleted false when deleting the same category twice", async ({
    request,
    createCategory,
    getCategory,
    accessToken,
  }) => {
    // Arrange
    const category = await createCategory({
      name: `DELETE test ${randomUUID()}`,
      transactionType: "Income",
    });

    // Act
    const firstResponse = await request.delete(`${categoryUrl}/${category.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const secondResponse = await request.delete(`${categoryUrl}/${category.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    expect(firstResponse.status()).toBe(200);
    const firstResult = CategoryDeleteResponse.parse(await firstResponse.json());
    expect(firstResult.isDeleted).toBe(true);
    expect(secondResponse.status()).toBe(200);
    const secondResult = CategoryDeleteResponse.parse(await secondResponse.json());
    expect(secondResult.isDeleted).toBe(false);
    expect(await getCategory(category.name)).toHaveLength(0);
  });

  test("deletes only the requested category", async ({
    request,
    createCategory,
    getCategory,
    accessToken,
  }) => {
    // Arrange
    const category = await createCategory({
      name: `DELETE test ${randomUUID()}`,
      transactionType: "Expense",
    });
    const otherCategory = await createCategory({
      name: `DELETE test ${randomUUID()}`,
      transactionType: "Income",
    });

    // Act
    const response = await request.delete(`${categoryUrl}/${category.id}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    expect(response.status()).toBe(200);
    const result = CategoryDeleteResponse.parse(await response.json());
    expect(result.isDeleted).toBe(true);
    expect(await getCategory(category.name)).toHaveLength(0);
    expect(await getCategory(otherCategory.name)).toContainEqual(otherCategory);
  });
});
