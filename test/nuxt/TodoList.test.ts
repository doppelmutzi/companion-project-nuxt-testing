// Showcases: mockComponent + registerEndpoint + renderSuspended
/**
 * Showcases: mockComponent to replace a child component with a controllable stub.
 *
 * Why mock a child component at all?
 *
 * TodoList renders a TodoItem for every todo in filteredTodos. TodoItem is a
 * non-trivial component — it uses NuxtLink, store actions, and has its own
 * rendering logic. If we let the real TodoItem render here, a failure in
 * TodoItem will also fail this test, making it harder to isolate what broke.
 *
 * mockComponent (from @nuxt/test-utils/runtime) replaces a component
 * registration globally for the duration of the test file. Every occurrence
 * of <TodoItem> in the rendered tree is replaced with the stub. This lets
 * TodoList tests focus purely on list-level behavior: does it render one
 * item per todo? Does it use the right key? Does filtering work?
 *
 * The stub uses a data-testid attribute so the test can query exactly the
 * elements inserted by the list — without relying on TodoItem internals.
 *
 * How data gets into TodoList:
 *
 * TodoList reads filteredTodos directly from the Pinia store — it does not
 * call useFetch itself. To give it data, we:
 *   1. Register a mock /api/todos endpoint with registerEndpoint.
 *   2. Fetch from it via $fetch (a Nuxt auto-import) inside the test.
 *   3. Seed the store with store.setTodos(), mirroring what the index page
 *      does in production.
 *
 * This keeps the test realistic (data flows from a mocked server endpoint
 * through the store to the component) while staying fully isolated from the
 * real database and server handler.
 */
import {
  mockComponent,
  registerEndpoint,
  renderSuspended,
} from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import TodoList from "~/components/TodoList.vue";
import { useTodosStore, type Todo } from "~/stores/todos";

const mockTodos = [
  { id: 1, label: "Buy groceries", date: "2026-02-11", checked: false },
  { id: 2, label: "Walk the dog", date: "2026-02-10", checked: true },
  { id: 3, label: "Write tests", date: "2026-02-09", checked: false },
];

// registerEndpoint makes /api/todos available via $fetch within the test
// environment. It intercepts Nitro's internal route resolution, so $fetch
// returns our mock array without hitting a real server or database.
registerEndpoint("/api/todos", () => mockTodos);

// mockComponent replaces every <TodoItem> in the rendered tree with this stub.
// The data-testid makes each stub easily queryable by the test assertions
// without coupling them to TodoItem's internal markup.
mockComponent("~/components/TodoItem.vue", {
  props: ["todo"],
  template: '<div data-testid="todo-item-stub" :todo-label="todo?.label" />',
});

describe("TodoList", () => {
  // The test seeds the store by fetching from the mocked endpoint — the same
  // data flow the real index page uses. renderSuspended then mounts TodoList
  // in the full Nuxt context. Because TodoItem is stubbed, we can count the
  // rendered stubs directly to verify TodoList iterates filteredTodos correctly.
  it("renders one stub per todo returned by the API", async () => {
    const store = useTodosStore();
    const todos = await $fetch<Todo[]>("/api/todos");
    store.setTodos(todos);

    await renderSuspended(TodoList);

    const stubs = screen.getAllByTestId("todo-item-stub");
    expect(stubs).toHaveLength(mockTodos.length);
    expect(stubs).toMatchSnapshot();
  });
});
