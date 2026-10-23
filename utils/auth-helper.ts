import { expect, type APIRequestContext } from "@playwright/test";
import { environment } from "../config/environment";
import type { LoginResponseType } from "../types/index";

const apiUrl = new URL("/api/auth", environment.apiUrl).toString();

export async function getAccessToken(api: APIRequestContext): Promise<string> {
  const response = await api.post(`${apiUrl}/login`, {
    data: {
      email: environment.testUser.email,
      password: environment.testUser.password,
    },
  });

  expect(response).toBeOK();
  const data: LoginResponseType = await response.json();
  const accessToken: string = data.accessToken;

  return accessToken;
}
