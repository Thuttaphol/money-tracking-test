import { test, expect } from "@playwright/test";
import { environment } from "../../config/environment";
import {
  CategoryErrorInvalidName,
  CategoryErrorInvalidTransactionType,
  CategoryResponse,
} from "../../zod/category-response.schema";
import { deleteCategory } from "../../data/test-data-helper";

let ACCESS_TOKEN: string;

test.describe("Create category", () => {
  test.describe.configure({ mode: "default" });
  test.beforeAll(async ({ request }) => {
    const response = await request.post(`${environment.apiUrl}/api/auth/login`, {
      data: {
        email: environment.testUser.email,
        password: environment.testUser.password,
      },
    });

    expect(response.ok()).toBeTruthy();

    const responseBody = await response.json();

    ACCESS_TOKEN = responseBody.accessToken;
  });

  test("create category successfully with transaction type Income", async ({
    request,
  }) => {
    const response = await request.post(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
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

    await deleteCategory(result.data?.id!, environment.testUser.id!);
  });

  test("create category successfully with transaction type Expense", async ({
    request,
  }) => {
    const response = await request.post(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      data: {
        name: "category ทดสอบ expense",
        transactionType: "Expense",
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    const result = CategoryResponse.safeParse(data);

    expect(result.success).toBe(true);

    await deleteCategory(result.data?.id!, environment.testUser.id!);
  });

  test("create category fail because of invalid transaction type", async ({
    request,
  }) => {
    const response = await request.post(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      data: {
        name: "category ทดสอบ ผิด transaction type",
        transactionType: "Invalid",
      },
    });

    expect(response.status()).toEqual(400);

    const data = await response.json();

    const result = CategoryErrorInvalidTransactionType.safeParse(data);

    expect(result.success).toBe(false);
  });

  test("create category fail because of invalid name", async ({ request }) => {
    const response = await request.post(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      data: {
        name: "t",
        transactionType: "Expense",
      },
    });

    expect(response.status()).toEqual(400);

    const data = await response.json();

    const result = CategoryErrorInvalidName.safeParse(data);

    expect(result.success).toBe(false);
  });
});
