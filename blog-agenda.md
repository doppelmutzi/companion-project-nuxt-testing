# Blog Agenda: An advanced guide to Nuxt testing and mocking

- ✅ **Intro: Why Nuxt testing needs its own guide**
  - Nuxt adds layers (auto-imports, SSR, routing, layouts) that pure Vue unit tests can't cover
  - Three testing tiers — each with a different confidence/speed trade-off

- ✅ **Project setup: TodoMVC as the demo app**
  - Nuxt 4, Pinia store, SQLite API, dark mode composable, route middleware, custom error page
  - Vitest workspace with three projects: `unit`, `nuxt`, `e2e`

- ✅ **Setting up Vitest in a Nuxt project**
  - Install: `@nuxt/test-utils`, `vitest`, `happy-dom`, `@testing-library/vue`, `@testing-library/user-event`, `playwright-core`
  - Register the module in `nuxt.config.ts`: add `@nuxt/test-utils/module` to `modules`
  - Create `vitest.config.mts`: use `defineConfig` with a `projects` array (Vitest workspace)
    - Unit project: `@vitejs/plugin-vue` plugin + `environment: 'happy-dom'`
    - E2E project: `environment: 'node'`
    - Nuxt project: wrap with `defineVitestProject` from `@nuxt/test-utils/config` + `environment: 'nuxt'`
  - Optional `vitest.setup.ts`: configure global `@vue/test-utils` stubs (e.g. icon components)

- ✅ **The three Vitest environments explained**
  - `happy-dom` (unit): fast browser-like DOM, no Nuxt context, no auto-imports
  - `nuxt` (nuxt runtime): full Nuxt app context — auto-imports, Pinia, router, plugins all active
  - `node` (e2e): no DOM — tests talk to a real running Nuxt server over HTTP or via Playwright

- ✅ **Tier 1 — Unit tests (`test/unit/`, `environment: 'happy-dom'`)**
  - When to use: simple components, pure composable logic, isolated store logic
  - ✅ T1 — `Headline.test.ts`: render a plain component with `render()` from Vue Testing Library
  - T2 — `TodosStore.test.ts`: test synchronous store getters and state mutations in isolation (no Nuxt runtime, no `$fetch`) — *referenced but not shown; reader directed to previous article*

- ✅ **Tier 2 — Nuxt runtime tests (`test/nuxt/`, `environment: 'nuxt'`)**
  - How `environment: 'nuxt'` works: auto-imports, Pinia, router — all wired up
  - ✅ `mountSuspended` vs `renderSuspended`: component-level vs page-level mounting
    - ✅ T3 — `TodoItem.test.ts`: `mountSuspended`, assert label + `<NuxtLink>` href; contrast with manual `mount()` + router setup
  - ✅ `registerEndpoint`: mocking API routes in-process
    - ✅ T4 — `IndexPage.test.ts`: mock `/api/todos`, verify seeded todos render with `renderSuspended`
    - T5 — `TodosStoreActions.test.ts`: mock CRUD endpoints with method matching, test async store actions (`addTodo`, `toggleCheckTodo`, `removeTodo`, `clearCheckedTodos`, `toggleTodos`)
    - ✅ T6 — `DetailPageErrorCase.test.ts`: register 404 endpoint + middleware 400 case; assert `renderSuspended` rejects with correct status; render `error.vue` directly with props
    - ✅ T7 — `DetailPageHappyPath.test.ts`: mock `/api/todos/:id`, assert rendered content + `useHead` title via `mockNuxtImport` + `vi.hoisted`
  - ✅ `mockNuxtImport`: replacing auto-imported composables
    - ✅ T8 — `DefaultLayout.test.ts`: mock `useRuntimeConfig` to inject custom `appTitle`; note on `app.baseURL` requirement for router init
    - ✅ T9 — `UseDarkMode.test.ts`: `vi.hoisted` + `vi.fn()` for `useState`; two tests with different initial states to showcase per-test mock control
    - T10 ✅ — `ValidateTodoIdMiddleware.test.ts`: mock `abortNavigation` + `createError`, test middleware function directly without rendering a page
  - ✅ `mockComponent`: replacing child components with stubs
    - ✅ T11 — `TodoList.test.ts`: `defineComponent + h()` stub, seed store directly with `setTodos()`
    - ✅ T12 — `TodoList.globalstub.test.ts`: `global.stubs` as a per-call alternative to the file-scoped `mockComponent` macro — enables different stubs per test without workarounds
  - User interactions in the Nuxt environment
    - T13 — `TodoInput.test.ts`: VTU `setValue`/`trigger` vs `userEvent.type()` + `userEvent.keyboard('{Enter}')`, assert new todo appears

- **Tier 3 — E2E tests (`test/e2e/`, `environment: 'node'`)**
  - How `setup()` boots a real Nuxt server; `$fetch` vs `createPage`
  - T14 — `app.test.ts`: SSR smoke test, `$fetch('/')`, assert HTML contains todo input
  - T15 — `api.test.ts`: test all CRUD API endpoints (`GET`, `POST`, `PATCH`, `DELETE`) via `$fetch`
  - T16 — `navigation.test.ts` / `navigation.headed.test.ts`: full navigation flow with Playwright — add todo, click `<NuxtLink>`, verify detail page, click headline to go home

- **Summary: choosing the right tier**
  - Decision matrix: unit → nuxt runtime → e2e
  - Key utilities cheat sheet: `mountSuspended`, `renderSuspended`, `registerEndpoint`, `mockNuxtImport`, `mockComponent`, `$fetch`, `createPage`
