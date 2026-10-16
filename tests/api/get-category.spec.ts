import { test, expect } from "../../fixtures/access-token.fixture";
import { environment } from "../../config/environment";

import { createCategories, deleteCategories } from "../../data/test-data-helper";
import {
  CategoryErrorInvalidTransactionType,
  GetCategoryResponse,
} from "../../zod/category-response.schema";
import { testData } from "../../data/test-data";

const categoryUrl = `${environment.apiUrl}/api/Categories`;

test.describe("Get category", () => {
  test.describe.configure({ mode: "default" });

  test.beforeAll(async () => {
    await createCategories(testData.categories);
  });

  test.afterAll(async () => {
    await deleteCategories(testData.categories);
  });

  test("get category successfully", async ({ request, accessToken }) => {
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("filter category by name successfully", async ({ request, accessToken }) => {
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        name: "เงิน",
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveLength(1);
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("filter category by transaction type successfully", async ({
    request,
    accessToken,
  }) => {
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        transactionType: "Expense",
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveLength(3);
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("filter category by name and transaction type successfully", async ({
    request,
    accessToken,
  }) => {
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        name: "เงิน",
        transactionType: "Income",
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveLength(1);
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("filter category fail because sending wrong transaction type", async ({
    request,
    accessToken,
  }) => {
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        transactionType: "Wrong",
      },
    });

    expect(response.status()).toEqual(400);
    const data = await response.json();
    const result = CategoryErrorInvalidTransactionType.safeParse(data);
    expect(result.success).toBe(true);
  });
});
