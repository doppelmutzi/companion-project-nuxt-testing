// Showcases: mockComponent (template string) + vi.hoisted for per-test stub variation
/**
 * Showcases: the template-string mockComponent syntax, and using vi.hoisted to
 * vary stub behaviour across tests within the same file.
 *
 * The template-string syntax (plain options object with a `template` key) is more
 * concise than the defineComponent + h() form in TodoList.test.ts. It requires
 * Vue's runtime template compiler, which is available in the Nuxt test environment.
 * The Nuxt docs do not show this pattern explicitly, but it works in practice.
 *
 * Why vi.hoisted?
 *
 * mockComponent is a macro — like vi.mock, it is hoisted to the top of the file
 * before any test code runs. The stub definition is therefore fixed and shared
 * across all tests in the file. Without vi.hoisted, you cannot reference a let
 * variable declared later in the module from inside the mock factory, because the
 * factory executes before those declarations are evaluated.
 *
 * vi.hoisted() runs its callback during the same hoisting pass as mockComponent,
 * making its return values available when the factory executes. Exposing a mutable
 * object from vi.hoisted() and updating it before each render gives each test its
 * own effective stub configuration — without needing a separate mockComponent call.
 */
import { mockComponent, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, test, vi } from "vitest";
import TodoList from "~/components/TodoList.vue";
import { useTodosStore } from "~/stores/todos";

const mockTodos = [
  { id: 1, label: "Buy groceries", date: "2026-02-11", checked: false },
  { id: 2, label: "Walk the dog", date: "2026-02-10", checked: true },
  { id: 3, label: "Write tests", date: "2026-02-09", checked: false },
];

// vi.hoisted creates stubConfig before mockComponent's factory runs.
// Each test sets stubConfig.testId before rendering to control the stub's
// data-testid — demonstrating per-test stub variation from a single mockComponent.
const { stubConfig } = vi.hoisted(() => ({
  stubConfig: { testId: "todo-item-stub" },
}));

// Template-string syntax: setup exposes stubConfig so the template can reference
// it — module-level variables are not in scope in a template string without being
// returned from setup.
mockComponent("~/components/TodoItem.vue", {
  props: ["todo"],
  setup: () => ({ stubConfig }),
  template: '<div :data-testid="stubConfig.testId" :todo-label="todo?.label" />',
});

describe("TodoList (vi.hoisted stub variation)", () => {
  test("renders one stub per todo using the first testid", async () => {
    stubConfig.testId = "todo-item-stub-a";

    const store = useTodosStore();
    store.setTodos(mockTodos);

    await renderSuspended(TodoList);

    expect(screen.getAllByTestId("todo-item-stub-a")).toHaveLength(3);
  });

  test("renders one stub per todo using the second testid", async () => {
    stubConfig.testId = "todo-item-stub-b";

    const store = useTodosStore();
    store.setTodos(mockTodos);

    await renderSuspended(TodoList);

    expect(screen.getAllByTestId("todo-item-stub-b")).toHaveLength(3);
  });
});
