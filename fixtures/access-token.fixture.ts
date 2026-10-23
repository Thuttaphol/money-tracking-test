import { test as base, request } from "@playwright/test";
import { environment } from "../config/environment";
import { getAccessToken } from "../utils/auth-helper";

type AccessTokenFixture = {
  accessToken: string;
};

export const test = base.extend<{}, AccessTokenFixture>({
  accessToken: [
    async ({}, use) => {
      const apiContext = await request.newContext({ baseURL: environment.apiUrl });

      try {
        const accessToken = await getAccessToken(apiContext);

        await use(accessToken);
      } finally {
      }
    },
    { scope: "worker" },
  ],
});

export { expect } from "@playwright/test";
