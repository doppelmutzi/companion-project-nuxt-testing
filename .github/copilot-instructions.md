# Copilot instructions for this repo

## Project overview
- Nuxt 4 app using the `app/` directory layout; this is a TodoMVC-style UI used as a companion project for a Nuxt unit/e2e testing article.
- Core data model is defined in the Pinia store in [app/stores/todos.ts](app/stores/todos.ts) (Composition API setup syntax) and drives all UI.
- The main page is [app/pages/index.vue](app/pages/index.vue). A detail page lives at [app/pages/todos/[id].vue](app/pages/todos/[id].vue).

## Architecture & data flow
- **Pinia store** (`app/stores/todos.ts`): holds `todos` and `filterIndex` as `ref()`, exposes computed getters (`filteredTodos`, `todosLeft`, `todosChecked`), and async actions that call the server API via `$fetch`.
- **Server API** (`server/api/`): full CRUD backed by SQLite (`better-sqlite3`). DB setup and helpers live in `server/utils/db.ts`. Routes: `GET /api/todos`, `GET /api/todos/:id`, `POST /api/todos`, `PATCH /api/todos/:id`, `DELETE /api/todos/:id`, `DELETE /api/todos` (clear checked), `PATCH /api/todos` (toggle all).
- **Data seeding**: `app/pages/index.vue` fetches todos via `useFetch('/api/todos')` and calls `store.setTodos(data.value)` on load.
- **Dark mode**: managed by the `useDarkMode` composable (`app/composables/useDarkMode.ts`) using `useState('darkMode', () => true)`. No longer in the Pinia store. Consumed by `ActionBar`, `FilterButton`, and the layout.
- **Layout**: `app/layouts/default.vue` renders the `Headline` component wrapped in a `<NuxtLink to="/">` and a dark mode toggle button. Applied to all routes via `<NuxtLayout>` in `app/app.vue`.
- Read-only state in components uses `storeToRefs()` (see `ActionBar.vue`, `TodoList.vue`).
- Mutations happen only via store actions (e.g., `addTodo`, `toggleCheckTodo`, `clearCheckedTodos`), which call the server API to persist changes.
- Filtering is centralized in the store getter `filteredTodos`; list rendering consumes that getter (`TodoList.vue`).
- Theme config objects (DARK/LIGHT) live in [app/utils/theme.ts](app/utils/theme.ts).
- i18n is minimal and local: strings come from [app/utils/translation.ts](app/utils/translation.ts) (used in `TodoInput.vue`).

## Nuxt features in use
- **Runtime config**: `runtimeConfig.public.appTitle` in `nuxt.config.ts`, consumed via `useRuntimeConfig()` in the layout.
- **`useFetch`**: seeds the Pinia store from `/api/todos` in `index.vue`.
- **`useRoute`**: reads the `id` param in `app/pages/todos/[id].vue`.
- **`useHead`**: sets a dynamic `<title>` on the detail page.
- **`useState`**: SSR-safe dark mode state in `app/composables/useDarkMode.ts`.
- **`createError`**: throws 404 on the detail page when a todo is not found.
- **`<NuxtLink>`**: used in `TodoItem.vue` (links to detail page) and `default.vue` (headline links home).
- **`<NuxtLayout>`**: wraps `<NuxtPage />` in `app.vue`.
- **Server routes**: Nitro API handlers in `server/api/`.

## Conventions & patterns
- Consolidate imports from the same module into a single `import` statement (e.g., `import { a, b } from "mod"` instead of two separate imports).
- Do **not** leave unused imports in the code. Remove any import that is not referenced in the file.
- Vue SFCs use `<script setup lang="ts">` and SCSS (`<style lang="scss">`). Do **not** use `scoped` styles.
- Components pass callbacks as props named `onClick` (kebab-cased in templates as `:on-click`), e.g., `ClearButton.vue` and `DeleteButton.vue`.
- Prefer computed state for derived view text (example: `Status.vue`).
- Keep Todo item updates immutable (clone array then assign), as in `toggleCheckTodo`.
- Store actions are `async` and call `$fetch` to persist mutations server-side.

## Styling
- Global reset and typography live in `app/assets/global-styles/_reset.scss` and `app/assets/global-styles/main.scss`.
- Component styles are **not** scoped; do not add the `scoped` attribute to `<style>` tags.

## Testing
- This repo is a companion project for an article on Nuxt testing; keep UI logic deterministic and easy to select in tests.
- **Three Vitest projects** configured in [vitest.config.mts](vitest.config.mts):
  - `unit` — `test/unit/`, `happy-dom` environment, uses `@vitejs/plugin-vue` + `@testing-library/vue`. For pure component rendering and logic tests without Nuxt context.
  - `nuxt` — `test/nuxt/` (+ `app/`), `nuxt` environment via `@nuxt/test-utils`. Full Nuxt runtime with auto-imports, Pinia, and route context. Uses `mountSuspended`, `renderSuspended`, `registerEndpoint`, `mockNuxtImport`, `mockComponent`.
  - `e2e` — `test/e2e/`, `node` environment. Boots a real Nuxt server via `setup()`, tests with `$fetch` (SSR/API) and `createPage` (Playwright browser).
- Vitest setup stubs live in [vitest.setup.ts](vitest.setup.ts).
- Run all tests: `npm test`. Single run: `npx vitest run`.

## Developer workflows
- Dev server: `npm run dev` (Nuxt dev server on http://localhost:3000).
- Build/preview: `npm run build`, `npm run preview`.
- Tests: `npm test` (runs Vitest projects from `vitest.config.mts`).
- SQLite database file (`db.sqlite3`) is git-ignored.
