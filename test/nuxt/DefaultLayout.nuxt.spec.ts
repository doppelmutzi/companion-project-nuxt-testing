import { mockNuxtImport, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import DefaultLayout from "~/layouts/default.vue";

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    app: { baseURL: "/", buildId: "test" },
    public: {
      appTitle: "My Custom Title",
    },
  });
});

describe("Default Layout", () => {
  it("renders the appTitle from useRuntimeConfig in the headline", async () => {
    await renderSuspended(DefaultLayout);

    expect(screen.getByText("My Custom Title")).toBeDefined();
  });
});
