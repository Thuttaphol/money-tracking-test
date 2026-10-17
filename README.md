# Money Tracking Test

## About

This project is for testing web app 'Money Tracking' using Playwright (Typescript) supports multiple test environment.

## How to run this test

Install pakage by runing command `bun install`

1. Test api without ui

> `TEST_ENV=local bunx playwright test --project=api-test`

2. Test api with ui

> `TEST_ENV=local bunx playwright test --ui --project=api-test`

TEST_ENV can be local, dev, staging, production

## For Your Information

1. API test spec file that i create by myself is

```plain
 .test/api/create-category.spec.ts
 .test/api/get-category.spec.ts
```

1. API test spec file that i create by using AI skill that i created is

```plain
.test/api/delete-category.spec.ts
.test/api/update-category.spec.ts
```
