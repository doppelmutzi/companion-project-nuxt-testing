# Plan: Extend TodoMVC with Nuxt features for testing

## Changes

- [x] **1. Runtime config for app title** — Add `runtimeConfig.public.appTitle` in `nuxt.config.ts`, consume via `useRuntimeConfig()` in `app/pages/index.vue`, render the existing `Headline` component with it.
- [x] **2. Server API route + `useFetch`** — Create `server/api/todos.get.ts` with an in-memory todo array. Refactor `app/pages/index.vue` to seed the Pinia store from `useFetch('/api/todos')` instead of hardcoding todos in the store.
- [x] **3. Dynamic todo detail page** — Add `app/pages/todos/[id].vue` using `useRoute()` to read the param, display todo details, and throw `createError({ statusCode: 404 })` if not found. Add `useHead` to set a dynamic `<title>`.
- [x] **4. `<NuxtLink>` in TodoItem** — Wrap the todo label in `app/components/TodoItem.vue` with `<NuxtLink>` for navigation to the detail page.
- [x] **5. Default layout** — Create `app/layouts/default.vue` with `Headline` wrapped in a `<NuxtLink to="/">` so it serves as shared header and home navigation for all routes (index and todo detail). Update `app/app.vue` to use `<NuxtLayout>` wrapping `<NuxtPage />`. Remove the per-page `<Headline>` from `index.vue` and the "← Back to list" link from `[id].vue`.
- [x] **6. `useState` for dark mode** — Create `app/composables/useDarkMode.ts` using `useState('darkMode', () => false)`. Replace the theme field in the Pinia store with this composable. Wire it into `ActionBar` and `FilterButton`.
- [ ] **11. Route middleware** — Add a named middleware `app/middleware/validate-todo-id.ts` that validates the `id` param on the detail route (e.g., reject non-numeric IDs with `abortNavigation`). Apply it via `definePageMeta` in `app/pages/todos/[id].vue`.
- [ ] **12. Custom `error.vue`** — Create `app/error.vue` to display a styled error page (404 and generic) with a "Back to home" `<NuxtLink>`. Replace the default Nuxt error screen.


## Persistence

- [x] **10. Server-side persistence with SQLite** — Replace the static in-memory seed data with a SQLite database (`better-sqlite3`). Create `server/utils/db.ts` for DB setup. Add full CRUD API routes (`POST`, `PATCH`, `DELETE`). Wire Pinia store actions to call the API so all mutations persist across reloads. Remove `server/data/todos.ts`.

## Cleanup

- [x] **8. Delete `app/views/Todos.vue`** — Remove the unused duplicate of `index.vue`.
- [x] **9. Update `.github/copilot-instructions.md`** — Reflect all new Nuxt features, file structure, and data flow changes.

## Testing

### Unit tests (Vitest + Vue Testing Library, `test/unit/`)

Pure unit tests that run in a `happy-dom` environment **without** any Nuxt context. Components are rendered with Vue Testing Library's `render()`, which uses `@vue/test-utils` under the hood. Nuxt auto-imports (like `useRuntimeConfig`, `useFetch`, `NuxtLink`) are **not** available — so these tests are best suited for simple components, composable logic, and store logic where you control all dependencies via props or mocks (`vi.fn`). They are the fastest to run and easiest to debug.

- [x] **T1. Headline renders text** — Render `Headline` with Vue Testing Library `render()`, assert text appears. _(already done)_
- [ ] **T2. Pinia store logic** — Test `useTodosStore` in isolation: `addTodo`, `toggleCheckTodo`, `removeTodo`, `clearCheckedTodos`, `filteredTodos` getter, `todosLeft` computed. Mock `$fetch` with `vi.fn`.
- [ ] **T3. `useDarkMode` composable** — Test `isDark` initial value, `toggleDarkMode` flips it, `theme` computed returns correct config.

### Nuxt runtime tests (`@nuxt/test-utils/runtime`, `test/nuxt/`)

These tests run inside a **full Nuxt environment** (`environment: 'nuxt'` in Vitest). Nuxt auto-imports, plugins, composables, and the Vue app context are all available — just like in the real app. This is what makes utilities like `mountSuspended` and `renderSuspended` possible: they mount components with async setup support, Pinia, route context, and injections already wired up. Use `registerEndpoint` to mock server API responses, `mockNuxtImport` to replace auto-imported composables, and `mockComponent` to stub child components. These tests are slower than unit tests (Nuxt must build once) but give much higher confidence that components work correctly within the framework.

- [ ] **T4. `mountSuspended` — TodoItem** — Mount `TodoItem` with `mountSuspended`, verify it renders the label text and date. Verify the `<NuxtLink>` points to `/todos/:id`.
- [ ] **T5. `renderSuspended` — ActionBar with Testing Library** — Use `renderSuspended` + `screen.getByText` to verify the action bar renders status text, filter buttons, and the "clear completed" link when todos are checked. Use `registerEndpoint` to mock `/api/todos`.
- [x] **T6. `registerEndpoint` — index page** — Register a mock `/api/todos` endpoint, render the index page with `renderSuspended`, verify todos from the mocked API appear in the DOM.
- [x] **T7. `mockNuxtImport` — useRuntimeConfig** — Mock `useRuntimeConfig` to return a custom `appTitle`, render the layout with `renderSuspended`, assert the headline shows the mocked title.
- [ ] **T8. `mockNuxtImport` — useState (dark mode)** — Mock `useState` to control `isDark`, render `ActionBar` with `renderSuspended`, verify the correct theme styles are applied.
- [ ] **T9. `mockComponent` — mock child component** — Render `TodoList` with `renderSuspended`, mock `TodoItem` via `mockComponent` to a simple stub, verify the list renders the correct number of stubs. Use `registerEndpoint` to provide data.
- [ ] **T10. Route middleware** — Test `validate-todo-id` middleware: mock `navigateTo`/`abortNavigation` via `mockNuxtImport`, call the middleware with valid and invalid `id` params, assert correct behavior.
- [ ] **T11. Detail page 404** — Use `renderSuspended` with a route pointing to a non-existent todo ID. Register an endpoint returning 404. Verify `createError` is thrown or the error page renders.
- [ ] **T12. Custom `error.vue`** — Render `error.vue` with `mountSuspended`, pass an error prop with `statusCode: 404`, verify it displays the error message and a "Back to home" link.

### E2E tests (`@nuxt/test-utils/e2e`, `test/e2e/`)

End-to-end tests boot a **real Nuxt server** (via `setup()`) and interact with it over HTTP or through a browser. The `$fetch` helper makes HTTP requests against the running server — great for testing SSR output and API routes directly. The `createPage` helper launches a real Playwright browser to simulate user interactions (clicking, typing, navigating). These tests run the full stack: server routes, SSR rendering, client-side hydration, and browser behavior. They are the slowest but give the highest confidence that everything works together in production-like conditions.

- [x] **T13. SSR smoke test** — Fetch `/` with `$fetch`, assert HTML contains the todo input. _(already done)_
- [ ] **T14. Server API routes** — Test each API endpoint (`GET`, `POST`, `PATCH`, `DELETE`) via `$fetch` against the running Nuxt server. Verify correct status codes and response bodies.
- [ ] **T15. Full navigation flow** — Use `createPage` (Playwright) to add a todo, click the `<NuxtLink>` to the detail page, verify the detail content, then click the headline to navigate back home.
- [ ] **T16. Dark mode toggle** — Use `createPage` to click the dark mode toggle button in the layout, verify the action bar style changes between dark/light theme.
- [ ] **T17. 404 error page** — Use `$fetch` or `createPage` to navigate to a non-existent todo (`/todos/999999`), verify the custom error page renders with the correct status message.