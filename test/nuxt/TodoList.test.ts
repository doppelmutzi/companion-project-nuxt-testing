// Showcases: mockComponent (defineComponent + h()) + renderSuspended — see TodoList.hoisted.test.ts for the template-string syntax and vi.hoisted pattern
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
 * call useFetch itself. Tests seed the store directly via store.setTodos(),
 * mirroring what the index page does on load. No server endpoint or $fetch
 * call is involved.
 */
import {
  mockComponent,
  renderSuspended,
} from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { defineComponent, h } from "vue";
import { describe, expect, test } from "vitest";
import TodoList from "~/components/TodoList.vue";
import { useTodosStore } from "~/stores/todos";

const mockTodos = [
  { id: 1, label: "Buy groceries", date: "2026-02-11", checked: false },
  { id: 2, label: "Walk the dog", date: "2026-02-10", checked: true },
  { id: 3, label: "Write tests", date: "2026-02-09", checked: false },
];

// mockComponent replaces every <TodoItem> in the rendered tree with this stub.
// The data-testid makes each stub easily queryable by the test assertions
// without coupling them to TodoItem's internal markup.
//
// The factory function returns a defineComponent with an explicit props
// declaration and a setup function that returns a render function via h().
// This avoids relying on Vue's runtime template compiler.
mockComponent("~/components/TodoItem.vue", () =>
  defineComponent({
    props: { todo: Object },
    setup(props) {
      return () =>
        h("div", {
          "data-testid": "todo-item-stub",
          "todo-label": props.todo?.label,
        });
    },
  })
);

describe("TodoList", () => {
  // The test seeds the store directly via setTodos, then mounts TodoList in the
  // full Nuxt context. Because TodoItem is stubbed, we can count the rendered
  // stubs directly to verify TodoList iterates filteredTodos correctly.
  test("renders one stub per todo seeded into the store", async () => {
    const store = useTodosStore();
    store.setTodos(mockTodos);

    await renderSuspended(TodoList);

    const stubs = screen.getAllByTestId("todo-item-stub");
    expect(stubs).toMatchSnapshot();
  });
});
