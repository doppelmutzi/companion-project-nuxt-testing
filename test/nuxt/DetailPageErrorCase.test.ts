// Showcases: renderSuspended rejects on createError, error.vue rendering with props
/**
 * Showcases: testing error handling in Nuxt pages and the custom error.vue.
 *
 * Two complementary scenarios:
 *
 * 1. Detail page 404: render the dynamic [id].vue page with a registerEndpoint
 *    that throws a 404 — mirroring what the real server handler does. useFetch
 *    sets fetchError.value on non-2xx responses; the page re-throws it.
 *    renderSuspended propagates the thrown error, so we can assert the promise
 *    rejects — verifying that the page correctly surfaces a 404.
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

// Throw a 404 from the endpoint, mirroring what the real [id].get.ts does.
// useFetch sets fetchError.value on non-2xx responses, and the page re-throws it.
registerEndpoint("/api/todos/999", () => {
  throw createError({ statusCode: 404, statusMessage: "Todo with id 999 not found" });
});

describe("Detail Page - Todo not found", () => {
  test("throws a 404 when the todo does not exist", async () => {
    await expect(
      renderSuspended(DetailPage, {
        route: "/todos/999",
      }),
    ).rejects.toMatchObject({ statusCode: 404, statusMessage: `Todo with id 999 not found` });
  });
});

// This also confirms that renderSuspended runs route middleware: the
// validate-todo-id middleware fires for /todos/abc and aborts with a 400
// before the page setup ever executes.
describe("Detail Page - invalid id", () => {
  test("throws a 400 when the todo id is not a valid integer", async () => {
    await expect(
      renderSuspended(DetailPage, { route: "/todos/abc" }),
    ).rejects.toMatchObject({ statusCode: 400, statusMessage: 'Invalid todo id: "abc"' });
  });
});

describe("Error Page", () => {
  test("renders status code, message, and back to home button", async () => {
    await renderSuspended(ErrorPage, {
      props: {
        error: { status: 500, message: "Something went wrong" } as NuxtError,
      },
    });

    expect(screen.getByText("500")).toBeDefined();
    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("← Back to home")).toBeDefined();
  });
});
