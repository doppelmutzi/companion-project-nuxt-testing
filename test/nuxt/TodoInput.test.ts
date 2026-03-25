// Showcases: user interaction — VTU (setValue/trigger) vs userEvent API
/**
 * Showcases: Two approaches to simulating user input in the Nuxt test environment.
 *
 * Both tests exercise the same interaction chain:
 *   DOM event (keyup.enter) → Vue handler (onEnter) → store.addTodo()
 *   → $fetch POST /api/todos → Pinia state update → re-render
 *
 * Approach 1 — VTU (mountSuspended):
 * mountSuspended returns a VTU VueWrapper. setValue() sets the element's value
 * AND fires input/change events (keeping v-model in sync). trigger('keyup',
 * { key: 'Enter' }) dispatches a keyup event whose evt.target.value already
 * reflects the value written by setValue — exactly what onEnter() reads.
 * Assertions use wrapper.text() because mountSuspended renders into a detached
 * container outside document.body, so Testing Library's screen cannot see it.
 *
 * Approach 2 — userEvent (renderSuspended):
 * renderSuspended wraps @testing-library/vue's render(), which attaches its
 * output to document.body. This makes screen queries and userEvent (which also
 * operates on document.body elements) work correctly together.
 * userEvent.setup() creates a session that simulates real browser input:
 *   - user.type() fires keydown/keypress/input/keyup for every character,
 *     updating the element's value and Vue's v-model incrementally.
 *   - user.keyboard('{Enter}') fires a full keydown/keypress/keyup sequence for
 *     Enter on the currently focused element, triggering @keyup.enter.
 * This is more realistic than VTU's trigger() because it simulates the full
 * browser event pipeline rather than dispatching a single synthetic event.
 *
 * Why flushPromises (both tests)?
 * store.addTodo() awaits $fetch POST /api/todos before updating state.
 * flushPromises() drains the microtask queue so the store and re-render
 * complete before assertions run.
 *
 * Why clearNuxtData in beforeEach?
 * Nuxt's useFetch deduplicates requests by key across the Nuxt instance lifetime.
 * Without clearNuxtData(), the second test's renderSuspended(IndexPage) would
 * replay the cached async data from the first mount — potentially returning stale
 * data and overwriting the Pinia store reset. clearNuxtData() forces useFetch to
 * re-fetch from the registered GET endpoint, which returns [].
 */
import { registerEndpoint, mountSuspended, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import userEvent from "@testing-library/user-event";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, beforeEach } from "vitest";
import IndexPage from "~/pages/index.vue";
import { useTodosStore } from "~/stores/todos";

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

beforeEach(() => {
  // Clear ALL Nuxt async data so that each renderSuspended call re-fetches
  // from the registered GET endpoint instead of replaying a cached response.
  // clearNuxtData(key) requires the exact key Nuxt generated internally for
  // the useFetch call — which differs from the raw URL — so we clear all.
  clearNuxtData();
  // Reset Pinia state independently — clearNuxtData only affects useFetch's
  // cache; the store itself (mutated by addTodo in the previous test) must
  // be reset manually.
  useTodosStore().setTodos([]);
});

describe("TodoInput — VTU approach (mountSuspended)", () => {
  it("adds a new todo when the user types a label and presses Enter", async () => {
    const wrapper = await mountSuspended(IndexPage);

    // setValue sets the DOM element's value AND fires input/change events so
    // Vue's v-model stays in sync. onEnter() reads evt.target.value, which
    // will be "Learn Nuxt testing" when the keyup fires immediately after.
    await wrapper.find("input").setValue("Learn Nuxt testing");

    // trigger('keyup', { key: 'Enter' }) dispatches a keyup event with
    // event.key = "Enter", activating Vue's @keyup.enter handler (onEnter).
    await wrapper.find("input").trigger("keyup", { key: "Enter" });

    await flushPromises();

    // mountSuspended renders into a detached container — use wrapper.text()
    // rather than screen queries.
    expect(wrapper.text()).toContain("Learn Nuxt testing");
  });
});

describe("TodoInput — userEvent approach (renderSuspended)", () => {
  it("adds a new todo when the user types a label and presses Enter", async () => {
    // renderSuspended attaches to document.body, so both screen queries and
    // userEvent (which also targets document.body) work correctly together.
    await renderSuspended(IndexPage);

    const user = userEvent.setup();

    // screen.getByRole("textbox") locates the <input> by its implicit ARIA
    // role — the same query a screen reader would use. This is the Testing
    // Library idiomatic approach: query by what users and assistive technology
    // perceive, not by CSS selectors or tag names.
    //
    // user.type() fires the full event sequence for each character
    // (keydown → keypress → input → keyup), updating input.value and
    // Vue's v-model incrementally — just like a real user typing.
    await user.type(screen.getByRole("textbox"), "Learn Nuxt testing");

    // user.keyboard('{Enter}') fires keydown + keypress + keyup for Enter on
    // the currently focused element, triggering Vue's @keyup.enter handler.
    await user.keyboard("{Enter}");

    await flushPromises();

    // screen.getByText() locates the rendered todo label in the DOM — the
    // text that a sighted user would see after adding the todo.
    expect(screen.getByText("Learn Nuxt testing")).toBeDefined();
  });
});
