/**
 * Showcases: Testing Pinia store synchronous logic in a pure unit test.
 *
 * This test runs in happy-dom — there is NO Nuxt runtime. That means Nuxt
 * auto-imports like $fetch are NOT available. This is intentional: we only
 * test synchronous state, getters, and actions here — the parts of the store
 * that don't depend on any Nuxt API.
 *
 * Why not test async actions here? The store's async actions (addTodo,
 * removeTodo, etc.) call $fetch — a Nuxt auto-import. In a unit test, $fetch
 * is undefined, so you'd need to polyfill it via globalThis.$fetch = vi.fn().
 * That works but is a workaround for a missing runtime. The Nuxt test
 * environment (test/nuxt/) provides $fetch automatically — and you can use
 * registerEndpoint to mock server routes naturally. See TodosStoreActions.test.ts
 * in test/nuxt/ for the async action tests.
 *
 * Rule of thumb: Use unit tests for pure logic (getters, filters, synchronous
 * state mutations). Escalate to the Nuxt environment when your code depends
 * on Nuxt runtime APIs ($fetch, useFetch, useState, etc.).
 *
 * Pinia setup: Outside of Nuxt, Pinia must be manually created and activated
 * with createPinia() + setActivePinia() in beforeEach. In Nuxt tests, this
 * is handled automatically by the framework.
 */
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import {
  FilterIndex,
  useTodosStore,
  type Todo,
} from "../../app/stores/todos";

// Sample data used across tests.
const todo1: Todo = { id: 1, label: "Buy groceries", date: "2026-02-14", checked: false };
const todo2: Todo = { id: 2, label: "Walk the dog", date: "2026-02-13", checked: true };
const todo3: Todo = { id: 3, label: "Write tests", date: "2026-02-12", checked: false };

describe("useTodosStore", () => {
  beforeEach(() => {
    // Create a fresh Pinia instance for each test to avoid state leaking
    // between tests. In the Nuxt test environment, the framework handles
    // this automatically — in unit tests we must do it manually.
    setActivePinia(createPinia());
  });

  describe("setTodos", () => {
    // setTodos is a synchronous action that directly sets the todos array.
    // No $fetch, no Nuxt API — a perfect candidate for a unit test.
    it("sets the todos array", () => {
      const store = useTodosStore();

      store.setTodos([todo1, todo2]);

      expect(store.todos).toHaveLength(2);
      expect(store.todos[0].label).toBe("Buy groceries");
    });
  });

  describe("todosLeft", () => {
    // todosLeft is a computed getter that counts unchecked todos.
    // Pure derived state — tests verify the reactive computation.
    it("counts unchecked todos", () => {
      const store = useTodosStore();
      store.setTodos([todo1, todo2, todo3]);

      // todo1 and todo3 are unchecked, todo2 is checked
      expect(store.todosLeft).toBe(2);
    });

    it("returns 0 when all todos are checked", () => {
      const store = useTodosStore();
      store.setTodos([{ ...todo1, checked: true }, todo2]);

      expect(store.todosLeft).toBe(0);
    });
  });

  describe("todosChecked", () => {
    // todosChecked is true when at least one todo is checked.
    // It's derived from todosLeft — tests verify the boolean logic.
    it("returns true when at least one todo is checked", () => {
      const store = useTodosStore();
      store.setTodos([todo1, todo2]);

      expect(store.todosChecked).toBe(true);
    });

    it("returns false when no todos are checked", () => {
      const store = useTodosStore();
      store.setTodos([todo1, todo3]);

      expect(store.todosChecked).toBe(false);
    });
  });

  describe("filteredTodos", () => {
    // filteredTodos is a computed getter that filters based on filterIndex.
    // Tests cover all three filter states (ALL, CHECKED, UNCHECKED).
    it("returns all todos when filter is ALL", () => {
      const store = useTodosStore();
      store.setTodos([todo1, todo2, todo3]);
      store.setFilterIndex(FilterIndex.ALL);

      expect(store.filteredTodos).toHaveLength(3);
    });

    it("returns only checked todos when filter is CHECKED", () => {
      const store = useTodosStore();
      store.setTodos([todo1, todo2, todo3]);
      store.setFilterIndex(FilterIndex.CHECKED);

      expect(store.filteredTodos).toHaveLength(1);
      expect(store.filteredTodos[0].label).toBe("Walk the dog");
    });

    it("returns only unchecked todos when filter is UNCHECKED", () => {
      const store = useTodosStore();
      store.setTodos([todo1, todo2, todo3]);
      store.setFilterIndex(FilterIndex.UNCHECKED);

      expect(store.filteredTodos).toHaveLength(2);
      expect(store.filteredTodos.every((t) => !t.checked)).toBe(true);
    });
  });
});
