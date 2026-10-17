import { test, expect } from "../../fixtures/access-token.fixture";
import { environment } from "../../config/environment";
import {
  CategoryErrorInvalidName,
  CategoryErrorInvalidTransactionType,
  CategoryResponse,
} from "../../zod/category-response.schema";
import { deleteCategory } from "../../data/test-data-helper";

const categoryUrl = `${environment.apiUrl}/api/Categories`;

test.describe("Create category", () => {
  test("create category successfully with transaction type Income", async ({
    request,
    accessToken,
  }) => {
    const response = await request.post(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: "category ทดสอบ income",
        transactionType: "Income",
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const result = CategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data?.name).toEqual("category ทดสอบ income");
    expect(result.data?.transactionType).toEqual("Income");

    await deleteCategory(result.data?.id!, environment.testUser.id!);
  });

  test("create category successfully with transaction type Expense", async ({
    request,
    accessToken,
  }) => {
    const response = await request.post(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: "category ทดสอบ expense",
        transactionType: "Expense",
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const result = CategoryResponse.safeParse(data);
    expect(result.data?.name).toEqual("category ทดสอบ expense");
    expect(result.data?.transactionType).toEqual("Expense");

    await deleteCategory(result.data?.id!, environment.testUser.id!);
  });

  test("create category fail because of invalid transaction type", async ({
    request,
    accessToken,
  }) => {
    const response = await request.post(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: "category ทดสอบ ผิด transaction type",
        transactionType: "Invalid",
      },
    });

    expect(response.status()).toEqual(400);
    const data = await response.json();
    const result = CategoryErrorInvalidTransactionType.safeParse(data);
    expect(result.success).toBe(true);
  });

  test("create category fail because of invalid name", async ({
    request,
    accessToken,
  }) => {
    const response = await request.post(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        name: "t",
        transactionType: "Expense",
      },
    });

    expect(response.status()).toEqual(400);
    const data = await response.json();
    const result = CategoryErrorInvalidName.safeParse(data);
    expect(result.success).toBe(true);
  });
});
