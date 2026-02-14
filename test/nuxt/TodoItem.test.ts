/**
 * Showcases: mountSuspended, findComponent, class assertions, and snapshot testing.
 *
 * mountSuspended (from @nuxt/test-utils/runtime) is the Nuxt equivalent of
 * @vue/test-utils' mount(). It returns a VTU wrapper for programmatic assertions
 * (find, props, classes, text, html). Unlike plain mount(), it provides the full
 * Nuxt context — auto-imports like <NuxtLink>, Pinia stores, and route context
 * are all available. It also handles components with async setup (Suspense
 * boundaries), which is why it's async and must be awaited.
 *
 * Techniques demonstrated:
 * 1. Text content assertions — wrapper.text().toContain()
 * 2. findComponent + props/classes — VTU API for locating child components
 *    like <NuxtLink> and asserting their props and CSS classes
 * 3. Snapshot testing — toMatchSnapshot() captures the full rendered HTML
 *    to detect unintended changes across both checked and unchecked states
 */
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import TodoItem from "~/components/TodoItem.vue";

const mockTodo = {
  id: 42,
  label: "Buy groceries",
  date: "2026-02-13",
  checked: false,
};

describe("TodoItem", () => {
  // Basic content assertion: mount the component with props and verify that
  // the rendered text includes the todo's label and date strings.
  it("renders the todo label and date", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    expect(wrapper.text()).toContain("Buy groceries");
    expect(wrapper.text()).toContain("2026-02-13");
  });

  // findComponent() locates a child component by name within the wrapper.
  // Here we verify that TodoItem renders a <NuxtLink> (a Nuxt auto-import)
  // and that its "to" prop points to the correct detail page URL.
  // This would not work in a plain unit test since NuxtLink requires Nuxt context.
  it("renders a NuxtLink pointing to /todos/:id", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.exists()).toBe(true);
    expect(link.props("to")).toBe("/todos/42");
  });

  // classes() returns the CSS class list of the wrapper element.
  // This tests that the component applies a conditional class based on prop state —
  // a common Vue pattern using :class bindings.
  it("applies is-crossed-out class when todo is checked", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: { ...mockTodo, checked: true } },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.classes()).toContain("is-crossed-out");
  });

  // Inverse of the above: verifies the class is absent for unchecked todos.
  it("does not apply is-crossed-out class when todo is unchecked", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.classes()).not.toContain("is-crossed-out");
  });

  // Snapshot testing: wrapper.html() returns the full rendered HTML string.
  // toMatchSnapshot() saves it to a __snapshots__ file on first run and compares
  // against it on subsequent runs. This catches any unintended markup changes.
  it("matches snapshot for an unchecked todo", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  // A second snapshot for the checked state ensures both visual variants
  // are captured. If the crossed-out styling or markup changes, this will flag it.
  it("matches snapshot for a checked todo", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: { ...mockTodo, checked: true } },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});
