// Showcases: Direct middleware function testing + mockNuxtImport (abortNavigation, createError)
/**
 * Showcases: Testing a named route middleware by importing and calling it directly.
 *
 * Route middleware in Nuxt are plain functions exported via defineNuxtRouteMiddleware.
 * The default export is the middleware function itself — it receives `to` and `from`
 * route objects and optionally returns a navigation guard result.
 *
 * Testing strategy: Rather than rendering an entire page and navigating to trigger
 * the middleware, we import the middleware function directly and invoke it with
 * minimal fake route objects. This isolates the middleware logic and makes tests
 * fast and focused.
 *
 * We use mockNuxtImport to mock `abortNavigation` and `createError` — both are
 * Nuxt auto-imports that the middleware calls. The mocks let us verify what
 * arguments the middleware passes (status code, message) without triggering real
 * Nuxt error handling.
 */
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import type { RouteLocationNormalized } from "vue-router";

import validateTodoId from "~/middleware/validate-todo-id";

const { abortNavigationMock, createErrorMock } = vi.hoisted(() => {
  return {
    abortNavigationMock: vi.fn(),
    createErrorMock: vi.fn((err: unknown) => err),
  };
});

mockNuxtImport("abortNavigation", () => abortNavigationMock);
mockNuxtImport("createError", () => createErrorMock);

/**
 * Helper to build a minimal fake route with the given id param.
 * Only `params.id` is needed — the middleware doesn't inspect other fields.
 */
function fakeRoute(id: string): RouteLocationNormalized {
  return { params: { id } } as unknown as RouteLocationNormalized;
}

/** The middleware only inspects `to` — this satisfies the required `from` parameter. */
const FROM = fakeRoute("");

describe("validate-todo-id middleware", () => {
  it("allows navigation for a valid numeric id", () => {
    const result = validateTodoId(fakeRoute("42"), FROM);

    expect(abortNavigationMock).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("aborts navigation for a non-numeric id", () => {
    validateTodoId(fakeRoute("abc"), FROM);

    expect(createErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        statusMessage: 'Invalid todo id: "abc"',
      }),
    );
    expect(abortNavigationMock).toHaveBeenCalled();
  });

  it("aborts navigation for a decimal id", () => {
    validateTodoId(fakeRoute("1.5"), FROM);

    expect(createErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 400 }),
    );
    expect(abortNavigationMock).toHaveBeenCalled();
  });

  it("aborts navigation for an empty id", () => {
    validateTodoId(fakeRoute(""), FROM);

    expect(abortNavigationMock).toHaveBeenCalled();
  });
});
