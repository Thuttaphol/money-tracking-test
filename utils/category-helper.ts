import { expect, type APIRequestContext } from "@playwright/test";
import { environment } from "../config/environment";
import type { TransactionType, Category, DeleteResultType } from "../types/index";

const apiUrl = new URL("/api/Categories", environment.apiUrl).toString();

export async function createCategory(
  api: APIRequestContext,
  accessToken: string,
  data: { name: string; transactionType: TransactionType },
): Promise<Category> {
  const response = await api.post(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    data: data,
  });

  expect(response).toBeOK();
  const category: Category = await response.json();

  return category;
}

export async function getCategory(
  api: APIRequestContext,
  accessToken: string,
  name: string,
): Promise<Category[]> {
  const response = await api.get(apiUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    params: { Name: name },
  });

  expect(response).toBeOK();
  const categories: Category[] = await response.json();

  return categories;
}

export async function deleteCategory(
  api: APIRequestContext,
  accessToken: string,
  id: number,
) {
  const response = await api.delete(`${apiUrl}/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  expect(response).toBeOK();
  const deleteResult: DeleteResultType = await response.json();

  return deleteResult;
}
