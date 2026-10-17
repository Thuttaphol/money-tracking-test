import { mergeTests } from "@playwright/test";
import { test as accessToken } from "./access-token.fixture";
import { test as createCategory } from "./create-category.fixture";
import { test as deleteCategory } from "./delete-category.fixture";
import { test as getCategory } from "./get-category.fixture";

export const test = mergeTests(
  accessToken,
  createCategory,
  deleteCategory,
  getCategory,
);

export { expect } from "@playwright/test";
