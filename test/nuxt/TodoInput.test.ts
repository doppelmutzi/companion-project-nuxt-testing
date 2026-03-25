// Showcases: user interaction (VTU setValue/trigger) + registerEndpoint + mountSuspended
/**
 * Showcases: Testing user input and store mutation in the Nuxt test environment.
 *
 * This test exercises the full interaction chain:
 *   DOM event (keyup.enter) → Vue handler (onEnter) → store.addTodo()
 *   → $fetch POST /api/todos → Pinia state update → re-render
 *
 * Why mountSuspended instead of renderSuspended for interaction tests?
 * renderSuspended wraps @testing-library/vue's render() and returns a Testing
 * Library RenderResult — great for assertion via screen queries, but it does
 * not expose VTU's wrapper API (setValue, trigger). mountSuspended returns a
 * full VTU VueWrapper, giving access to both wrapper methods for triggering
 * events and screen queries for asserting the outcome.
 *
 * Why setValue + trigger instead of fireEvent?
 * onEnter() reads from evt.target.value directly (not from the v-model ref).
 * VTU's setValue() sets the underlying DOM element's value AND dispatches
 * the input/change events that Vue uses to sync v-model. Calling
 * trigger('keyup', { key: 'Enter' }) then fires a keyup event whose
 * evt.target.value reflects the value already written by setValue — exactly
 * what onEnter() needs.
 *
 * Why flushPromises?
 * store.addTodo() is async — it calls $fetch POST /api/todos and awaits the
 * response before pushing the returned todo into state. Without flushPromises(),
 * the assertion would run before the store update and re-render complete.
 * flushPromises() drains the microtask queue so all pending promises resolve
 * before we assert.
 */
import { registerEndpoint, mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import IndexPage from "~/pages/index.vue";

const newTodo = {
  id: 99,
  label: "Learn Nuxt testing",
  date: "2026-03-25",
  checked: false,
};

// GET /api/todos — return an empty list so the initial render has no todos.
// This makes the assertion unambiguous: any todo in the list after interaction
// was added by the test, not seeded from the initial fetch.
registerEndpoint("/api/todos", () => []);

// POST /api/todos — simulate the server creating the todo and returning it
// with a server-assigned id. The store pushes this response into state, so
// the label that appears in the DOM is exactly what the server returned.
registerEndpoint("/api/todos", {
  method: "POST",
  handler: () => newTodo,
});

describe("TodoInput — user interaction", () => {
  it("adds a new todo when the user types a label and presses Enter", async () => {
    const wrapper = await mountSuspended(IndexPage);

    // setValue sets the DOM element's value AND fires input/change events so
    // Vue's v-model stays in sync. onEnter() reads evt.target.value, which
    // will be "Learn Nuxt testing" when the keyup fires immediately after.
    await wrapper.find("input").setValue("Learn Nuxt testing");

    // trigger('keyup', { key: 'Enter' }) dispatches a keyup event with
    // event.key = "Enter", activating Vue's @keyup.enter handler (onEnter).
    await wrapper.find("input").trigger("keyup", { key: "Enter" });

    // Drain the microtask queue: store.addTodo() awaits $fetch POST /api/todos,
    // which resolves via the registered mock above. After this, Pinia state
    // holds the returned todo and Vue has re-rendered the todo list.
    await flushPromises();

    // Assert via the VTU wrapper — the todo label from the POST response is
    // now in the DOM rendered by TodoList → TodoItem → NuxtLink.
    expect(wrapper.text()).toContain("Learn Nuxt testing");
  });
});
