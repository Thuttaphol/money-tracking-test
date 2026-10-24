# Playwright Project Structure

This repository tests the Money Tracking application with Playwright and TypeScript. It contains category API integration tests and browser tests using a mobile-sized Chromium viewport. PostgreSQL helpers support direct test-data setup and cleanup.

## Directory tree

Paths below are relative to the repository root. Installed dependencies, local environment files, and generated Playwright artifacts are omitted.

```text
money-tracking-test/
├── .agents/
│   ├── skills/
│   │   └── playwright-api-integration-test/
│   │       └── SKILL.md                 # Local API integration testing skill
│   └── stucture.md                     # This project structure guide
├── config/
│   └── environment.ts                 # Environment selection and configuration
├── data/
│   ├── dev/
│   │   └── category.data.ts            # Development category data
│   ├── local/
│   │   └── category.data.ts            # Local category data
│   ├── staging/
│   │   └── category.data.ts            # Staging category data
│   ├── test-data.ts                    # Selects data for the active environment
│   └── test-data-helper.ts             # SQL category setup and cleanup helpers
├── database/
│   └── db.ts                          # PostgreSQL connection pool and close helper
├── fixtures/
│   ├── access-token.fixture.ts        # Worker-scoped API authentication token
│   ├── create-category.fixture.ts     # Creates categories and cleans them up
│   ├── delete-category.fixture.ts     # Exposes a category deletion helper
│   ├── get-category.fixture.ts        # Loads and validates categories by name
│   └── index.fixture.ts               # Merges fixtures and re-exports expect
├── page-object-model/
│   ├── category-add-page.ts            # Category creation locators and actions
│   ├── category-detail-page.ts        # Category editing and deletion actions
│   └── category-list-page.ts          # Category list navigation and locators
├── tests/
│   ├── api/
│   │   └── category/
│   │       ├── create-category.spec.ts
│   │       ├── delete-category.spec.ts
│   │       ├── get-category.spec.ts
│   │       └── update-category.spec.ts
│   ├── setup/
│   │   └── auth.setup.spec.ts         # Signs in and saves browser storage state
│   └── web/
│       └── category/
│           ├── add-category.spec.ts
│           ├── edit-category.spec.ts
│           └── list-category.spec.ts
├── types/
│   ├── category.ts                    # Category and CategoryInput types
│   ├── index.ts                       # Shared exports, login and delete types
│   └── transaction.ts                 # Income | Expense transaction type
├── utils/
│   ├── auth-helper.ts                 # API login helper
│   └── category-helper.ts             # API create, get, and delete helpers
├── zod/
│   ├── api-response.schema.ts         # General API error and validation schemas
│   ├── auth-response.schema.ts        # Access-token response schema
│   └── category-response.schema.ts    # Category success and error schemas
├── .env.example                       # Environment variable template
├── .gitignore                         # Dependency, artifact, and local file ignores
├── bun.lock                           # Bun dependency lockfile
├── package-lock.json                  # npm dependency lockfile
├── package.json                       # Dependencies; no package scripts defined
├── playwright.config.ts               # Playwright projects and execution settings
├── README.md                          # Project introduction and run commands
└── tsconfig.json                       # Strict TypeScript configuration; no emit
```

## Playwright projects

`playwright.config.ts` uses `./tests` as the test directory and defines three active projects:

| Project | Test files | Behavior |
| --- | --- | --- |
| `setup-login` | `tests/setup/auth.setup.spec.ts` | Signs in through the web application and saves authentication to `playwright/.auth/user.json`. |
| `api-test` | `tests/api/**/*.spec.ts` | Runs API tests; bearer-token authentication comes from fixtures. |
| `web-mobile` | `tests/web/**/*.spec.ts` | Runs Chromium at a 440 × 956 viewport, loads saved browser authentication, and depends on `setup-login`. |

Tests are configured for full parallel execution. CI uses one worker, two retries, and rejects `test.only`; local runs use Playwright's default worker count and no retries. Reporting uses HTML, with traces collected on the first retry.

There is no active global `baseURL` or `webServer` configuration. Tests and helpers construct URLs from `environment.webUrl` and `environment.apiUrl`, so the application and API must already be running.

## Configuration and test data

`config/environment.ts` reads `TEST_ENV`, defaults to `local`, and loads `.env.<TEST_ENV>` from the repository root. The supported test environments are `local`, `dev`, and `staging`. Although `production` appears in the environment type, configuration explicitly rejects it to prevent direct database access.

`playwright.config.ts` also loads `.env`. Both dotenv calls use the default behavior of preserving environment variables that are already set.

| Variable | Purpose |
| --- | --- |
| `TEST_ENV` | Selects the environment configuration and category dataset. |
| `WEB_URL` | Web application URL; required by configuration. |
| `API_URL` | API URL; required by configuration. |
| `DATABASE_URL` | PostgreSQL connection string; required by configuration. |
| `TEST_USER_EMAIL` | Credentials used by API login and browser sign-in. |
| `TEST_USER_PASSWORD` | Credentials used by API login and browser sign-in. |
| `TEST_USER_ID` | User identifier used by direct database category helpers. |

The test-user values are read without configuration-time validation; tests that use them need valid values.

`data/test-data.ts` selects the category dataset from `data/local`, `data/dev`, or `data/staging`. Each dataset currently contains five categories with `Income` and `Expense` transaction types. `data/test-data-helper.ts` provides direct SQL insert/delete operations against `money.category` through the pool in `database/db.ts`.

## Fixtures and authentication flow

API authentication and browser authentication are prepared separately:

1. `access-token.fixture.ts` calls `utils/auth-helper.ts` to log in at `/api/auth/login`. Its `accessToken` fixture is scoped to a Playwright worker.
2. Category fixtures use the token with Playwright's `request` fixture and the HTTP helpers in `utils/category-helper.ts`.
3. `create-category.fixture.ts` tracks created category IDs, validates responses with Zod, and attempts API cleanup in its teardown.
4. `get-category.fixture.ts` validates category search results with Zod. `delete-category.fixture.ts` exposes API deletion to tests.
5. `index.fixture.ts` combines the shared fixtures with `mergeTests` and exports `test` and `expect`. Most specs import from this entry point; the API create spec imports the token fixture directly, and the web edit spec imports the create fixture directly.

For browser tests, `tests/setup/auth.setup.spec.ts` signs in at `/signin`, waits for `/transaction`, and saves storage state. The `web-mobile` project then loads that state before running the category page tests. Web specs can also use API fixtures to prepare or clean up data.

## Current test coverage

| Spec | Scenarios |
| --- | --- |
| `tests/api/category/create-category.spec.ts` | Create Income and Expense categories; reject invalid names and transaction types. Successful cases clean up through the database helper. |
| `tests/api/category/get-category.spec.ts` | List categories; filter by name, transaction type, or both; reject an invalid transaction type. |
| `tests/api/category/update-category.spec.ts` | Update names and transaction types; accept name-length boundaries; reject invalid or missing fields without changing the category; return 404 for a deleted category. |
| `tests/api/category/delete-category.spec.ts` | Delete either transaction type; handle missing categories and repeated deletion; preserve other categories. |
| `tests/web/category/add-category.spec.ts` | Open the add page and create categories. Invalid-name cases are present, but their expected validation assertions are still marked for implementation. |
| `tests/web/category/edit-category.spec.ts` | Change category names and switch between Income and Expense. |
| `tests/web/category/list-category.spec.ts` | Display populated and empty category lists. |

## Where changes belong

- Add API specs under `tests/api/<feature>/` and browser specs under `tests/web/<feature>/` so the existing Playwright project matchers discover them.
- Put reusable browser locators and actions in `page-object-model/`.
- Put reusable API operations in `utils/` and expose test-scoped setup or cleanup through `fixtures/`. Register shared fixtures in `fixtures/index.fixture.ts`.
- Put runtime response validation in `zod/` and shared TypeScript contracts in `types/`.
- Put environment-specific datasets in `data/<environment>/` and select them through `data/test-data.ts`.
- Keep database operations in `database/` and `data/test-data-helper.ts`.

## Running tests

The README uses Bun. Populate `.env.local` from `.env.example` for a local run, or use `.env.dev` / `.env.staging` with the corresponding `TEST_ENV`.

```sh
bun install
TEST_ENV=local bunx playwright test --project=api-test
TEST_ENV=local bunx playwright test --project=web-mobile
```

Add `--ui` to either test command to use Playwright UI mode. Selecting `web-mobile` also runs its login setup dependency.

## Generated files

- `playwright/.auth/user.json`: browser authentication state created by login setup.
- `playwright-report/`: HTML test report.
- `test-results/`: test artifacts, including traces when collected.

These paths are ignored by Git. `.gitignore` also excludes `node_modules/`, `blob-report/`, and `playwright/.cache/`.
