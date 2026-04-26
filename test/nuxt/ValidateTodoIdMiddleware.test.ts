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
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { RouteLocationNormalized } from "vue-router";

import validateTodoId from "~/middleware/validate-todo-id";

const { abortNavigationMock, createErrorMock } = vi.hoisted(() => {
  return {
    abortNavigationMock: vi.fn(),
    createErrorMock: vi.fn((err) => err),
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
const homeRoute = {
  name: "index",
  path: "/",
  fullPath: "/",
} as RouteLocationNormalized;

describe("validate-todo-id middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  
  test("aborts navigation for a non-numeric id", () => {
    validateTodoId(fakeRoute("abc"), homeRoute);
    
    expect(createErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        statusMessage: 'Invalid todo id: "abc"',
      }),
    );
    expect(abortNavigationMock).toHaveBeenCalled();
    
  });
  
  test("aborts navigation for an empty id", () => {
    validateTodoId(fakeRoute(""), homeRoute);
    
    expect(createErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        statusMessage: 'Invalid todo id: ""',
      }),
    );
    expect(abortNavigationMock).toHaveBeenCalled();
  });

  test("allows navigation for a valid numeric id", () => {
    validateTodoId(fakeRoute("42"), homeRoute);

    expect(abortNavigationMock).not.toHaveBeenCalled();
  });
});
