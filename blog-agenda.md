# Blog Agenda: An advanced guide to Nuxt testing and mocking

- **Intro: Why Nuxt testing needs its own guide**
  - Nuxt adds layers (auto-imports, SSR, routing, layouts) that pure Vue unit tests can't cover
  - Three testing tiers — each with a different confidence/speed trade-off

- **Project setup: TodoMVC as the demo app**
  - Nuxt 4, Pinia store, SQLite API, dark mode composable, route middleware, custom error page
  - Vitest workspace with three projects: `unit`, `nuxt`, `e2e`

- **Setting up Vitest in a Nuxt project**
  - Install: `@nuxt/test-utils`, `vitest`, `happy-dom`, `@testing-library/vue`, `@testing-library/user-event`, `playwright-core`
  - Register the module in `nuxt.config.ts`: add `@nuxt/test-utils/module` to `modules`
  - Create `vitest.config.mts`: use `defineConfig` with a `projects` array (Vitest workspace)
    - Unit project: `@vitejs/plugin-vue` plugin + `environment: 'happy-dom'`
    - E2E project: `environment: 'node'`
    - Nuxt project: wrap with `defineVitestProject` from `@nuxt/test-utils/config` + `environment: 'nuxt'`
  - Optional `vitest.setup.ts`: configure global `@vue/test-utils` stubs (e.g. icon components)

- **The three Vitest environments explained**
  - `happy-dom` (unit): fast browser-like DOM, no Nuxt context, no auto-imports
  - `nuxt` (nuxt runtime): full Nuxt app context — auto-imports, Pinia, router, plugins all active
  - `node` (e2e): no DOM — tests talk to a real running Nuxt server over HTTP or via Playwright

- **Tier 1 — Unit tests (`test/unit/`, `environment: 'happy-dom'`)**
  - When to use: simple components, pure composable logic, isolated store logic
  - T1 — `Headline.test.ts`: render a plain component with `render()` from Vue Testing Library
  - T2 — `TodosStore.test.ts`: test store actions/getters in isolation, mock `$fetch` with `vi.fn()`
  - T3 — `UseDarkMode.test.ts` *(composables can be unit-tested too)*: `useState`-based composable logic without Nuxt runtime

- **Tier 2 — Nuxt runtime tests (`test/nuxt/`, `environment: 'nuxt'`)**
  - How `environment: 'nuxt'` works: auto-imports, Pinia, router — all wired up
  - `mountSuspended` vs `renderSuspended`: component-level vs page-level mounting
    - T4 — `TodoItem.test.ts`: `mountSuspended`, assert label + `<NuxtLink>` href
  - `registerEndpoint`: mocking API routes in-process
    - T5 — `IndexPage.test.ts`: mock `/api/todos`, verify seeded todos render with `renderSuspended`
    - T7 — `TodoList.test.ts`: `registerEndpoint` + `mockComponent` to stub `TodoItem`
    - T9 — `DetailPage404.test.ts`: register 404 endpoint, assert error page renders
    - T11 — `DetailPageHappyPath.test.ts`: mock `/api/todos/:id`, assert title + `useHead` `<title>`
  - `mockNuxtImport`: replacing auto-imported composables
    - T6 — `DefaultLayout.test.ts`: mock `useRuntimeConfig` to inject custom `appTitle`
    - T8 — `ValidateTodoIdMiddleware.test.ts`: mock `abortNavigation`, test middleware in isolation
  - `mockComponent`: replacing child components with stubs
    - T7 — `TodoList.test.ts` *(combined with `registerEndpoint` above)*
  - User interactions in the Nuxt environment
    - T10 — `TodoInput.test.ts`: `userEvent.type()` + `userEvent.keyboard('{Enter}')`, assert new todo appears

- **Tier 3 — E2E tests (`test/e2e/`, `environment: 'node'`)**
  - How `setup()` boots a real Nuxt server; `$fetch` vs `createPage`
  - T12 — `app.test.ts`: SSR smoke test, `$fetch('/')`, assert HTML contains todo input
  - T13 — `api.test.ts`: test all CRUD API endpoints (`GET`, `POST`, `PATCH`, `DELETE`) via `$fetch`
  - T14 — `navigation.test.ts` / `navigation.headed.test.ts`: full navigation flow with Playwright — add todo, click `<NuxtLink>`, verify detail page, click headline to go home

- **Summary: choosing the right tier**
  - Decision matrix: unit → nuxt runtime → e2e
  - Key utilities cheat sheet: `mountSuspended`, `renderSuspended`, `registerEndpoint`, `mockNuxtImport`, `mockComponent`, `$fetch`, `createPage`
