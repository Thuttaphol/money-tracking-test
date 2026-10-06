import dotenv from "dotenv";
import path from "path";

export type TestEnvironment = "local" | "dev" | "staging" | "production";

const testEnvironment =
  (process.env.TEST_ENV as TestEnvironment | undefined) ?? "local";

const supportedEnvironments: TestEnvironment[] = [
  "local",
  "dev",
  "staging",
  "production",
];

if (!supportedEnvironments.includes(testEnvironment)) {
  throw new Error(
    `Invalid TEST_ENV "${testEnvironment}". ` +
      `Expected one of: ${supportedEnvironments.join(", ")}`,
  );
}

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${testEnvironment}`),
});

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export const environment = {
  name: testEnvironment,

  webUrl: required("WEB_URL"),

  apiUrl: required("API_URL"),

  testUser: {
    email: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  },
} as const;
