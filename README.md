# Money Tracking Test

## About

This project is for testing web app 'Money Tracking' using Playwright (Typescript) supports multiple test environment.

## How to run this test

Install pakage by run command `bun install`
<br> By TEST_ENV can be local, dev, staging, production

### Test API

1. Test without ui

> `TEST_ENV=local bunx playwright test --project=api-test`

2. Test with ui

> `TEST_ENV=local bunx playwright test --ui --project=api-test`

### Test UI (Web mobile)

1. Test api without ui

> `TEST_ENV=local bunx playwright test --project=web-mobile`

2. Test api with ui

> `TEST_ENV=local bunx playwright test --ui --project=web-mobile`

## For Your Information

1. API test spec file that i create by myself is

```plain
 .test/api/create-category.spec.ts
 .test/api/get-category.spec.ts
```

2. API test spec file that i create by using AI skill that i created is

```plain
.test/api/delete-category.spec.ts
.test/api/update-category.spec.ts
```

3. Web-mobile viewport size that i create is

```plain
.test/web/*
```
