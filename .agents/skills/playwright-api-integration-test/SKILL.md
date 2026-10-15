---
name: playwright-api-integration-test
description: Create maintain review and debug Playwright integration test for api using Typescript. Use when implementing api tests, fix flaky tests, handling test data, or running test across different environments
---

# Playwright API integration testing

## Goal

Create reliable and maintainable Playwright tests
that follow the project's existing architecture.

## Workflow

### 1. Understand the test project

- Read package.json.
- Read playwright.config.ts.
- Inspect existing tests and fixtures.
- Inspect environment configuration.
- Identify existing test data management patterns.

### 2. Look for api specification

- Always reads api specs at `http://localhost:5194/openapi/v1.json`
- Matching possible api path from specs to user's request.
- Ask user actually api path for implement confirmation if it look a like or missed spelling.

### 3. Implement the test

- Use Playwright Test with TypeScript.
- Reuse existing fixtures, helpers and zod schema.
- If zod schema don't exist create by referencing the retrieved api specs only.
- Keep test independent for each api path and HTTP method.
- Avoid hardcoded environment-specific URLs.
- Never hardcode credentials or secrets.
- Always verify api response by zod schema.
- Do not edit test data at `./data/*`

### 4. Verify

1. Ask user for environment to run test.
2. Run the created Playwright test.
3. Run relevent only if it needs.
4. Investigate failure if it happens.
5. Re-run tests after fixing test-related files.
6. Do not change zod schema to make test pass.
7. Stop edit files after test failed 3 times.

## Expected output

- Test scenarios added or modified.
- Files created or modified.
- Executed test command.
- Actual test result from `./playwright-report/` folder.
- Limitation and unresolved failures.
