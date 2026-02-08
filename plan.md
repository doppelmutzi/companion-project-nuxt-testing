# Plan: Extend TodoMVC with Nuxt features for testing

## Changes

- [x] **1. Runtime config for app title** — Add `runtimeConfig.public.appTitle` in `nuxt.config.ts`, consume via `useRuntimeConfig()` in `app/pages/index.vue`, render the existing `Headline` component with it.
- [x] **2. Server API route + `useFetch`** — Create `server/api/todos.get.ts` with an in-memory todo array. Refactor `app/pages/index.vue` to seed the Pinia store from `useFetch('/api/todos')` instead of hardcoding todos in the store.
- [x] **3. Dynamic todo detail page** — Add `app/pages/todos/[id].vue` using `useRoute()` to read the param, display todo details, and throw `createError({ statusCode: 404 })` if not found. Add `useHead` to set a dynamic `<title>`.
- [ ] **4. `<NuxtLink>` in TodoItem** — Wrap the todo label in `app/components/TodoItem.vue` with `<NuxtLink>` for navigation to the detail page.
- [ ] **5. Default layout** — Create `app/layouts/default.vue` with `Headline` and a nav bar (`NuxtLink` to `/`). Update `app/app.vue` to use `<NuxtLayout>` wrapping `<NuxtPage />`.
- [ ] **6. `useState` for dark mode** — Create `app/composables/useDarkMode.ts` using `useState('darkMode', () => false)`. Replace the theme field in the Pinia store with this composable. Wire it into `ActionBar` and `FilterButton`.

## Persistence

- [ ] **10. Server-side persistence with SQLite** — Replace the static in-memory seed data with a SQLite database (`better-sqlite3`). Create `server/utils/db.ts` for DB setup. Add full CRUD API routes (`POST`, `PATCH`, `DELETE`). Wire Pinia store actions to call the API so all mutations persist across reloads. Remove `server/data/todos.ts`.

## Refactoring

- [x] **7. Refactor Pinia store to setup syntax** — Rewrite `app/stores/todos.ts` from the Options API style (`state`/`getters`/`actions` objects) to the Composition API style (setup function with `ref`, `computed`, and plain functions).

## Cleanup

- [x] **8. Delete `app/views/Todos.vue`** — Remove the unused duplicate of `index.vue`.
- [ ] **9. Update `.github/copilot-instructions.md`** — Reflect all new Nuxt features, file structure, and data flow changes.