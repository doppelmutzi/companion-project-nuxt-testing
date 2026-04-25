// Showcases: renderSuspended rejects on createError, error.vue rendering with props
/**
 * Showcases: testing error handling in Nuxt pages and the custom error.vue.
 *
 * Two complementary scenarios:
 *
 * 1. Detail page 404: render the dynamic [id].vue page with a registerEndpoint
 *    that returns null for a non-existent todo. The page's async setup calls
 *    useFetch, gets null back, and throws createError({ statusCode: 404 }).
 *    renderSuspended propagates the thrown error, so we can assert the promise
 *    rejects — verifying that the page correctly triggers a 404.
 *
 * 2. Error page rendering: render error.vue directly via renderSuspended,
 *    passing an error object as a prop. This verifies the custom error page
 *    displays the status code, message, and a "Back to home" button. Because
 *    error.vue wraps its content in <NuxtLayout>, the full default layout
 *    (headline, dark mode toggle) renders as well — all resolved automatically
 *    by the nuxt test environment.
 */
import { registerEndpoint, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import type { NuxtError } from "#app";
import { describe, expect, test } from "vitest";
import DetailPage from "~/pages/todos/[id].vue";
import ErrorPage from "~/error.vue";

// Return null for a non-existent todo. The detail page checks !todo.value
// after useFetch and throws createError({ statusCode: 404 }).
registerEndpoint("/api/todos/999", () => null);

describe("Detail Page - Todo not found", () => {
  test("throws a 404 when the todo does not exist", async () => {
    await expect(
      renderSuspended(DetailPage, {
        route: "/todos/999",
      }),
    ).rejects.toThrow();
  });
});

describe("Error Page", () => {
  test("renders status code, message, and back to home button", async () => {
    await renderSuspended(ErrorPage, {
      props: {
        error: { status: 404, message: "Todo with id 999 not found" } as NuxtError,
      },
    });

    expect(screen.getByText("404")).toBeDefined();
    expect(screen.getByText("Todo with id 999 not found")).toBeDefined();
    expect(screen.getByText("← Back to home")).toBeDefined();
  });
});
