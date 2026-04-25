/**
 * Showcases: global.stubs (Vue Test Utils API) as an alternative to mockComponent.
 *
 * The key difference to TodoList.test.ts:
 *
 * mockComponent (used in TodoList.test.ts) is called at module scope and
 * replaces the component globally for the entire test file. This means all
 * tests in that file share the same stub — you cannot use a different stub
 * in a second test without reaching for vi.hoisted or similar workarounds.
 *
 * global.stubs is passed directly into renderSuspended per test call. The stub
 * is defined inline, right where it is used, with no file-level side effects.
 * Different tests in the same file can pass different stubs independently.
 */
import { renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, test } from "vitest";
import TodoList from "~/components/TodoList.vue";
import { useTodosStore } from "~/stores/todos";

const mockTodos = [
  { id: 1, label: "Buy groceries", date: "2026-02-11", checked: false },
  { id: 2, label: "Walk the dog", date: "2026-02-10", checked: true },
  { id: 3, label: "Write tests", date: "2026-02-09", checked: false },
];

describe("TodoList (global.stubs)", () => {
  test("renders one stub per todo seeded into the store", async () => {
    const store = useTodosStore();
    store.setTodos(mockTodos);

    await renderSuspended(TodoList, {
      global: {
        stubs: {
          TodoItem: {
            props: ["todo"],
            template:
              '<div data-testid="todo-item-stub" :todo-label="todo?.label" />',
          },
        },
      },
    });

    const stubs = screen.getAllByTestId("todo-item-stub");
    expect(stubs).toMatchSnapshot();
  });
});
