// Showcases: registerEndpoint + renderSuspended
/**
 * Showcases: registerEndpoint to mock Nuxt server API routes.
 *
 * Why registerEndpoint instead of mocking global fetch (e.g., vi.fn())?
 *
 * In Nuxt, useFetch and $fetch do NOT simply call the browser's global fetch().
 * During SSR (and in the nuxt test environment), Nuxt resolves internal API
 * routes (like /api/todos) by directly calling the Nitro server handler —
 * bypassing HTTP entirely. This means mocking globalThis.fetch or window.fetch
 * with vi.fn() would have NO effect on useFetch('/api/todos') calls, because
 * Nuxt never hits the global fetch for its own server routes.
 *
 * registerEndpoint (from @nuxt/test-utils/runtime) hooks into Nitro's internal
 * route resolution. It registers a mock handler for a given route path, so when
 * useFetch or $fetch targets that path, Nitro returns the mock data instead of
 * running the real server handler (which would need a database, etc.).
 *
 * When to use which:
 * - registerEndpoint → for Nuxt server routes (/api/*) consumed via useFetch
 *   or $fetch. This is the correct choice whenever you're testing components
 *   or pages that fetch data from Nuxt's own API layer.
 * - vi.fn() / global fetch mock → for external third-party APIs (e.g.,
 *   fetch('https://api.github.com/...')) that go through the browser's global
 *   fetch. These are not Nuxt server routes, so registerEndpoint won't
 *   intercept them.
 *
 * The endpoint must be registered at the top level of the file (before tests
 * run) so it's in place when renderSuspended triggers the component's async
 * setup.
 *
 * Combined with renderSuspended + Testing Library's screen, this demonstrates
 * a full integration test: mock the API → render the page → assert the
 * fetched data appears in the DOM.
 */
import { registerEndpoint, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import IndexPage from "~/pages/index.vue";

const mockTodos = [
  { id: 1, label: "Buy groceries", date: "2026-02-11", checked: false },
  { id: 2, label: "Walk the dog", date: "2026-02-10", checked: true },
  { id: 3, label: "Write tests", date: "2026-02-09", checked: false },
];

// registerEndpoint hooks into Nitro's route resolution — not the browser's
// fetch. When index.vue calls useFetch('/api/todos') during setup, Nitro
// resolves it internally and returns our mock array. No real server, database,
// or HTTP request is involved.
registerEndpoint("/api/todos", () => mockTodos);

describe("Index Page", () => {
  // renderSuspended handles the async useFetch call in the page's setup,
  // waits for Suspense to resolve, then renders the result. We then use
  // Testing Library's screen.getByText() to verify each todo label from
  // the mocked endpoint appears in the rendered DOM.
  it("renders todos from the mocked /api/todos endpoint", async () => {
    await renderSuspended(IndexPage);

    expect(screen.getByText("Buy groceries")).toBeDefined();
    expect(screen.getByText("Walk the dog")).toBeDefined();
    expect(screen.getByText("Write tests")).toBeDefined();
  });
});
