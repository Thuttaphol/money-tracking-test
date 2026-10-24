import { randomUUID } from "node:crypto";
import { test, expect } from "../../fixtures/index.fixture";
import { environment } from "../../config/environment";
import {
  CategoryErrorInvalidTransactionType,
  GetCategoryResponse,
} from "../../zod/category-response.schema";
import { testData } from "../../data/test-data";
import { TransactionType } from "../../types";

const categoryUrl = `${environment.apiUrl}/api/Categories`;

test.describe("Get category", () => {
  test.describe.configure({ mode: "default" });

  test("get category successfully", async ({
    request,
    accessToken,
    createCategory,
  }) => {
    // prepare
    await createCategory({
      name: `ทดสอบสร้างประเภทรายการ ${randomUUID().split("-")[0]}`,
      transactionType: "Income",
    });

    // execute
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // expected
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });

  test("filter category by name successfully", async ({
    request,
    accessToken,
    createCategory,
  }) => {
    // prepare
    await Promise.allSettled(
      testData.categories.map(async (c) => {
        await createCategory({
          name: `${c.name} ${randomUUID().split("-")[0]}`,
          transactionType: c.transactionType as TransactionType,
        });
      }),
    );

    // execute
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
    expect(result.data?.length).toBeGreaterThan(0);
  });

  test("filter category by transaction type successfully", async ({
    request,
    accessToken,
    createCategory,
  }) => {
    // prepare
    await Promise.allSettled(
      testData.categories.map(async (c) => {
        await createCategory({
          name: `${c.name} ${randomUUID().split("-")[0]}`,
          transactionType: c.transactionType as TransactionType,
        });
      }),
    );

    // execute
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        transactionType: "Expense",
      },
    });

    // expected
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveLength(3);
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });

  test("filter category by name and transaction type successfully", async ({
    request,
    accessToken,
    createCategory,
  }) => {
    // prepare
    await Promise.allSettled(
      testData.categories.map(async (c) => {
        await createCategory({
          name: `${c.name} ${randomUUID().split("-")[0]}`,
          transactionType: c.transactionType as TransactionType,
        });
      }),
    );

    // execute
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        name: "เงิน",
        transactionType: "Income",
      },
    });

    // expected
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveLength(1);
    const result = GetCategoryResponse.safeParse(data);
    expect(result.success).toBe(true);
    expect(result.data?.length).toBeGreaterThan(0);
  });

  test("filter category fail because sending wrong transaction type", async ({
    request,
    accessToken,
    createCategory,
  }) => {
    // prepare
    await Promise.allSettled(
      testData.categories.map(async (c) => {
        await createCategory({
          name: `${c.name} ${randomUUID().split("-")[0]}`,
          transactionType: c.transactionType as TransactionType,
        });
      }),
    );

    // execute
    const response = await request.get(categoryUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        transactionType: "Wrong",
      },
    });

    // expected
    expect(response.status()).toEqual(400);
    const data = await response.json();
    const result = CategoryErrorInvalidTransactionType.safeParse(data);
    expect(result.success).toBe(true);
  });
});
