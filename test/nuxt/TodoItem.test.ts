/* Showcases: mountSuspended + snapshot testing */
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
import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { createMemoryHistory, createRouter } from "vue-router";
import TodoItem from "~/components/TodoItem.vue";

const mockTodo = {
  id: 42,
  label: "Buy groceries",
  date: "2026-02-13",
  checked: false,
};

describe("TodoItem", () => {
  /* Basic content assertion: mount the component with props and verify that
   * the rendered text includes the todo's label and date strings. */
  it("renders the todo label and date", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    expect(wrapper.text()).toContain("Buy groceries");
    expect(wrapper.text()).toContain("2026-02-13");
  });

  /* findComponent() locates a child component by name within the wrapper.
   * props("to") verifies the correct value is being passed into NuxtLink.
   * attributes("href") verifies NuxtLink resolved that prop into a real href —
   * this requires the router context that mountSuspended provides. With plain
   * mount(), the "to" prop arrives correctly but no href is rendered because
   * Vue Router is not registered, leaving the link non-functional. */
  it("renders a NuxtLink pointing to /todos/:id", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.exists()).toBe(true);
    expect(link.props("to")).toBe("/todos/42");
    expect(link.attributes("href")).toBe("/todos/42");
  });

  /* classes() returns the CSS class list of the wrapper element.
   * This tests that the component applies a conditional class based on prop state —
   * a common Vue pattern using :class bindings. */
  it("applies is-crossed-out class when todo is checked", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: { ...mockTodo, checked: true } },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.classes()).toContain("is-crossed-out");
  });

  /* Inverse of the above: verifies the class is absent for unchecked todos. */
  it("does not apply is-crossed-out class when todo is unchecked", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.classes()).not.toContain("is-crossed-out");
  });

  /* Snapshot testing: wrapper.html() returns the full rendered HTML string.
   * toMatchSnapshot() saves it to a __snapshots__ file on first run and compares
   * against it on subsequent runs. This catches any unintended markup changes. */
  it("matches snapshot for an unchecked todo", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: mockTodo },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });

  /* A second snapshot for the checked state ensures both visual variants
   * are captured. If the crossed-out styling or markup changes, this will flag it. */
  it("matches snapshot for a checked todo", async () => {
    const wrapper = await mountSuspended(TodoItem, {
      props: { todo: { ...mockTodo, checked: true } },
    });

    expect(wrapper.html()).toMatchSnapshot();
  });
});

/* This test intentionally uses plain mount() to demonstrate what breaks without
 * mountSuspended. Because this file runs inside the nuxt Vitest project,
 * Pinia is available so the component mounts without throwing — but NuxtLink
 * internally depends on RouterLink (from Vue Router), which is not registered
 * in a bare mount() app. Vue emits a warning and renders NuxtLink as an
 * unresolvable stub, so findComponent({ name: "NuxtLink" }) returns an empty
 * wrapper and the link assertion fails. */
describe("mount() without Nuxt runtime (intentionally broken — shows the error)", () => {
  it("emits a RouterLink warning and cannot locate NuxtLink as a real component", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const wrapper = mount(TodoItem, { props: { todo: mockTodo } });

    /* Vue warns that RouterLink (NuxtLink's internal dependency) could not be resolved */
    const warned = warnSpy.mock.calls.some((args) =>
      String(args[0]).includes("Failed to resolve component: RouterLink")
    );
    expect(warned).toBe(true);

    /* Without the router plugin, NuxtLink cannot resolve RouterLink and renders
     * a bare <a> with no href — the link is visually present but non-functional */
    expect(wrapper.html()).not.toContain('href="/todos/42"');

    warnSpy.mockRestore();
  });

  /* The same assertion IS achievable with plain mount() — but it requires manually
   * constructing and injecting a Vue Router instance via global.plugins. This is
   * the boilerplate mountSuspended replaces: in a real Nuxt app the router is
   * already configured with all routes, guards, and history mode. Recreating even
   * a minimal stand-in here means diverging from production config and maintaining
   * parallel setup code just to make the test environment resemble what Nuxt
   * already provides for free via mountSuspended. */
  it("resolves the href correctly when a router is provided manually", () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/todos/:id", component: { template: "<div />" } },
        { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
      ],
    });

    const wrapper = mount(TodoItem, {
      props: { todo: mockTodo },
      global: { plugins: [router] },
    });

    const link = wrapper.findComponent({ name: "NuxtLink" });
    expect(link.exists()).toBe(true);
    expect(link.props("to")).toBe("/todos/42");
    expect(link.attributes("href")).toBe("/todos/42");
  });
});