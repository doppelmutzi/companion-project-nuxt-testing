/**
 * Showcases: Testing Pinia store async actions in the Nuxt test environment.
 *
 * Unlike the unit tests in test/unit/TodosStore.test.ts (which test pure
 * synchronous logic), this file tests the store's async actions — all of
 * which call $fetch to persist mutations to the server API.
 *
 * Why the Nuxt environment? The store code uses $fetch — a Nuxt auto-import
 * that Nuxt makes globally available at runtime. In a unit test (happy-dom),
 * $fetch is simply undefined, and you'd need the workaround of assigning
 * globalThis.$fetch = vi.fn(). In the Nuxt test environment, $fetch is
 * auto-imported just like in the real app — no manual polyfill needed.
 *
 * registerEndpoint vs mocking $fetch directly:
 * - registerEndpoint hooks into Nitro's internal route resolution. When the
 *   store calls $fetch('/api/todos', { method: 'POST', ... }), Nitro resolves
 *   the route internally (no HTTP request) and hits our mock handler. This is
 *   the idiomatic way to mock server routes in Nuxt tests.
 * - vi.fn() on globalThis.$fetch would also work, but it bypasses Nuxt's
 *   actual request pipeline. registerEndpoint lets you test closer to reality:
 *   the $fetch call goes through Nuxt's internals, just with a mock handler
 *   at the end instead of the real DB-backed one.
 *
 * Pinia setup: In the Nuxt test environment, Pinia is automatically created
 * and injected — no need for createPinia() + setActivePinia(). You just call
 * useTodosStore() and it works. State is reset between tests by the framework.
 *
 * registerEndpoint with method matching: registerEndpoint accepts an options
 * object with a `method` field, allowing you to register different handlers
 * for GET, POST, PATCH, DELETE on the same route path — mirroring how Nuxt's
 * file-based routing works (todos.get.ts, todos.post.ts, etc.).
 */
import { registerEndpoint } from "@nuxt/test-utils/runtime";
import { describe, expect, it, beforeEach } from "vitest";
import { useTodosStore, type Todo } from "~/stores/todos";

// Sample data used across tests.
const todo1: Todo = { id: 1, label: "Buy groceries", date: "2026-02-14", checked: false };
const todo2: Todo = { id: 2, label: "Walk the dog", date: "2026-02-13", checked: true };
const todo3: Todo = { id: 3, label: "Write tests", date: "2026-02-12", checked: false };

// --- Register mock endpoints ---
// These replace the real Nitro server handlers (which would hit SQLite).
// Each endpoint mimics the behavior of the real server/api/ handlers,
// returning the data the store expects to receive.

// POST /api/todos — returns the created todo (simulates DB insert).
registerEndpoint("/api/todos", {
  method: "POST",
  handler: () => ({ ...todo1, id: 99 }),
});

// PATCH /api/todos — bulk toggle: returns all todos with checked flipped.
// To keep the mock simple, we always return all-checked.
registerEndpoint("/api/todos", {
  method: "PATCH",
  handler: () => [todo1, todo2, todo3].map((t) => ({ ...t, checked: true })),
});

// DELETE /api/todos — bulk clear checked: returns a success response.
registerEndpoint("/api/todos", {
  method: "DELETE",
  handler: () => ({ deleted: 1 }),
});

// PATCH /api/todos/:id — toggle single: returns the todo with checked flipped.
registerEndpoint("/api/todos/1", {
  method: "PATCH",
  handler: () => ({ ...todo1, checked: true }),
});

// DELETE /api/todos/:id — delete single: returns null (204 in real handler).
registerEndpoint("/api/todos/2", {
  method: "DELETE",
  handler: () => null,
});

describe("useTodosStore — async actions", () => {
  // Seed the store before each test. In the Nuxt environment, the store is
  // available via auto-import and Pinia is pre-configured — no manual setup.
  beforeEach(() => {
    const store = useTodosStore();
    store.setTodos([todo1, todo2, todo3]);
  });

  describe("addTodo", () => {
    // addTodo calls $fetch with POST /api/todos. The registerEndpoint mock
    // returns a todo with id: 99. The store pushes this server response into
    // its local array — we verify the new todo appears with the server-assigned id.
    it("adds the todo returned by the server to the store", async () => {
      const store = useTodosStore();

      await store.addTodo(todo1);

      // 3 seeded + 1 added = 4
      expect(store.todos).toHaveLength(4);
      expect(store.todos[3]!.id).toBe(99);
    });
  });

  describe("toggleCheckTodo", () => {
    // toggleCheckTodo calls $fetch with PATCH /api/todos/:id. The mock for
    // /api/todos/1 returns todo1 with checked: true. The store immutably
    // replaces the todo at the matching index.
    it("toggles the checked state of a todo", async () => {
      const store = useTodosStore();
      expect(store.todos[0]!.checked).toBe(false);

      await store.toggleCheckTodo(todo1);

      expect(store.todos[0]!.checked).toBe(true);
    });
  });

  describe("removeTodo", () => {
    // removeTodo calls $fetch with DELETE /api/todos/:id. The mock for
    // /api/todos/2 returns null. The store filters the todo out of the array.
    it("removes the todo from the store", async () => {
      const store = useTodosStore();

      await store.removeTodo(todo2);

      expect(store.todos).toHaveLength(2);
      expect(store.todos.find((t) => t.id === 2)).toBeUndefined();
    });
  });

  describe("clearCheckedTodos", () => {
    // clearCheckedTodos calls $fetch with DELETE /api/todos (bulk).
    // The store filters out all checked todos from its local array.
    it("removes all checked todos from the store", async () => {
      const store = useTodosStore();

      await store.clearCheckedTodos();

      expect(store.todos).toHaveLength(2);
      expect(store.todos.every((t) => !t.checked)).toBe(true);
    });
  });

  describe("toggleTodos", () => {
    // toggleTodos calls $fetch with PATCH /api/todos (bulk toggle).
    // The mock returns all todos as checked. The store replaces its
    // entire array with the server response.
    it("checks all todos when some are unchecked", async () => {
      const store = useTodosStore();

      await store.toggleTodos();

      expect(store.todos.every((t) => t.checked)).toBe(true);
    });
  });
});
