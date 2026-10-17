import { request, test as base, expect } from "@playwright/test";
import { environment } from "../config/environment";

type AccessTokenFixture = {
  accessToken: string;
};

export const test = base.extend<{}, AccessTokenFixture>({
  accessToken: [
    async ({}, use) => {
      const apiContext = await request.newContext({ baseURL: environment.apiUrl });

      const response = await apiContext.post("/api/auth/login", {
        data: {
          email: environment.testUser.email,
          password: environment.testUser.password,
        },
      });

      expect(response.ok()).toBeTruthy();

      const body = await response.json();

      await use(body.accessToken);
    },
    { scope: "worker" },
  ],
});

export { expect } from "@playwright/test";
