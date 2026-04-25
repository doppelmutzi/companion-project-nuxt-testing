// T11: Detail page happy path
/**
 * Showcases: renderSuspended with a dynamic route, registerEndpoint for a
 * parameterized API path, asserting rendered content, and verifying the
 * <title> set via useHead by capturing the call with mockNuxtImport.
 *
 * The nuxt test environment does not flush useHead side-effects to
 * document.title (flushPromises does not help either), so we mock the
 * composable to assert the arguments it receives instead.
 */
import { mockNuxtImport, registerEndpoint, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Todo } from "~/stores/todos";
import DetailPage from "~/pages/todos/[id].vue";

const mockTodo: Todo = {
  id: 42,
  label: "Buy groceries",
  date: "2026-03-26",
  checked: false,
};

registerEndpoint("/api/todos/42", () => mockTodo);

// vi.hoisted runs before imports are processed, so useHeadMock is available
// when mockNuxtImport's factory executes (which is also hoisted).
const { useHeadMock } = vi.hoisted(() => ({ useHeadMock: vi.fn() }));
mockNuxtImport("useHead", () => useHeadMock);

describe("Detail Page - happy path", () => {
  beforeEach(() => {
    useHeadMock.mockClear();
  });

  test("renders the todo title and date", async () => {
    await renderSuspended(DetailPage, { route: "/todos/42" });

    expect(screen.getByText("Buy groceries")).toBeDefined();
    expect(screen.getByText(/2026-03-26/)).toBeDefined();
  });

  test("sets the page title via useHead", async () => {
    await renderSuspended(DetailPage, { route: "/todos/42" });

    expect(useHeadMock).toHaveBeenCalledWith({ title: "Todo: Buy groceries" });
  });
});
