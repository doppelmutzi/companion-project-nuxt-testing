# Copilot instructions for this repo

## Project overview
- Nuxt 4 app using the app/ directory layout; this is a TodoMVC-style UI used as a companion project for a Nuxt unit/e2e testing article.
- Core data model is defined in the Pinia store in [app/stores/todos.ts](app/stores/todos.ts) and drives all UI.
- The main page renders the Todo view in [app/pages/index.vue](app/pages/index.vue) (currently identical to [app/views/Todos.vue](app/views/Todos.vue)).

## Architecture & data flow
- State lives in the Pinia store: todos, filterIndex, and theme are in [app/stores/todos.ts](app/stores/todos.ts).
- Read-only state in components uses `storeToRefs()` (see [app/components/ActionBar.vue](app/components/ActionBar.vue) and [app/components/TodoList.vue](app/components/TodoList.vue)).
- Mutations happen only via store actions (e.g., `addTodo`, `toggleCheckTodo`, `clearCheckedTodos`).
- Filtering is centralized in the store getter `filteredTodos`; list rendering should consume that getter (see [app/components/TodoList.vue](app/components/TodoList.vue)).
- Theme is a simple object in [app/utils/theme.ts](app/utils/theme.ts) toggled by the store action `toggleDarkMode()`.
- i18n is minimal and local: strings are pulled from [app/utils/translation.ts](app/utils/translation.ts) in components like [app/components/TodoInput.vue](app/components/TodoInput.vue).
- The ActionBar uses the store theme directly as inline styles (see [app/components/ActionBar.vue](app/components/ActionBar.vue)).

## Conventions & patterns
- Vue SFCs use `<script setup lang="ts">` and SCSS (`<style lang="scss">`). Do **not** use `scoped` styles.
- Components pass callbacks as props named `onClick` (kebab-cased in templates as `:on-click`), e.g., [app/components/ClearButton.vue](app/components/ClearButton.vue) and [app/components/DeleteButton.vue](app/components/DeleteButton.vue).
- Prefer computed state for derived view text (example: [app/components/Status.vue](app/components/Status.vue)).
- Keep Todo item updates immutable (clone array then assign), as in `toggleCheckTodo` in [app/stores/todos.ts](app/stores/todos.ts).

## Styling
- Global reset and typography live in [app/assets/global-styles/_reset.scss](app/assets/global-styles/_reset.scss) and [app/assets/global-styles/main.scss](app/assets/global-styles/main.scss).
- Component styles are **not** scoped; do not add the `scoped` attribute to `<style>` tags.

## Testing focus (companion project)
- This repo is meant to be extended with unit and e2e tests; keep UI logic deterministic and easy to select in tests (e.g., stable DOM structure, minimal side effects).
- Nuxt test tooling is configured with Vitest in [vitest.config.mts](vitest.config.mts) and module integration in [nuxt.config.ts](nuxt.config.ts).
- Vitest setup stubs live in [vitest.setup.ts](vitest.setup.ts).
- Recommended structure: `test/unit/` for pure unit tests, `test/nuxt/` for Nuxt runtime tests, and `test/e2e/` for end-to-end (per Nuxt guidance).

## Developer workflows
- Dev server: `npm run dev` (Nuxt dev server on http://localhost:3000).
- Build/preview: `npm run build`, `npm run preview`.
- Tests: `npm test` (runs Vitest projects from [vitest.config.mts](vitest.config.mts)).
