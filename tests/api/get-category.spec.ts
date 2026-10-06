import { test, expect } from "@playwright/test";
import { environment } from "../../config/environment";

let ACCESS_TOKEN: string;

test.describe("Get category", () => {
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

  test("get category successfully", async ({ request }) => {
    const response = await request.get(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    expect(response.ok()).toBeTruthy();
  });

  test("filter category by name successfully", async ({ request }) => {
    const response = await request.get(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        name: "เงิน",
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveLength(1);
  });

  test("filter category by transaction type successfully", async ({ request }) => {
    const response = await request.get(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        transactionType: "Expense",
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveLength(3);
  });

  test("filter category by name and transaction type successfully", async ({
    request,
  }) => {
    const response = await request.get(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        name: "เงิน",
        transactionType: "Income",
      },
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();

    expect(data).toHaveLength(1);
  });

  test("filter category fail because sending wrong transaction type", async ({
    request,
  }) => {
    const response = await request.get(`${environment.apiUrl}/api/Categories`, {
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
      params: {
        transactionType: "Wrong",
      },
    });

    expect(response.status()).toEqual(400);

    const data = await response.json();

    expect(data).toEqual({
      title: "Request Validation Failed",
      status: 400,
      detail: "One or more request value is invalid.",
      errors: {
        TransactionType: ["The TransactionType field must be Expense or Income."],
      },
    });
  });
});
