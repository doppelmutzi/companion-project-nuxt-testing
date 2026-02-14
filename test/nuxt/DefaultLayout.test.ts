/**
 * Showcases: mockNuxtImport and renderSuspended with Testing Library.
 *
 * mockNuxtImport (from @nuxt/test-utils/runtime) replaces a Nuxt auto-import
 * with a custom implementation for the duration of the test file. This is
 * essential for testing components that depend on Nuxt composables like
 * useRuntimeConfig — you control the return value without needing a real
 * Nuxt server config. The mock must be called at the top level of the file
 * (not inside describe/it), because it hooks into the module system.
 *
 * renderSuspended is the Nuxt equivalent of @testing-library/vue's render().
 * Unlike mountSuspended (which returns a VTU wrapper), renderSuspended works
 * with Testing Library's screen API — encouraging queries like getByText()
 * that mirror how users perceive the page. It handles async setup and provides
 * full Nuxt context (auto-imports, plugins, layouts).
 */
import { mockNuxtImport, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import DefaultLayout from "~/layouts/default.vue";

// mockNuxtImport replaces the auto-imported useRuntimeConfig composable.
// The factory function returns our mock implementation that provides a
// custom appTitle. This runs before any component code executes.
mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    app: { baseURL: "/", buildId: "test" },
    public: {
      appTitle: "My Custom Title",
    },
  });
});

describe("Default Layout", () => {
  // renderSuspended mounts the layout into a DOM and integrates with
  // Testing Library's screen object. screen.getByText() queries the rendered
  // output for visible text — asserting that the mocked appTitle propagates
  // through useRuntimeConfig → layout → Headline component.
  it("renders the appTitle from useRuntimeConfig in the headline", async () => {
    await renderSuspended(DefaultLayout);

    expect(screen.getByText("My Custom Title")).toBeDefined();
  });
});
