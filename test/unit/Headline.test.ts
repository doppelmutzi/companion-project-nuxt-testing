// Showcases: render (Vue Testing Library)
/**
 * Showcases: Pure unit test with Vue Testing Library (no Nuxt context).
 *
 * This test runs in a happy-dom environment without any Nuxt runtime.
 * Nuxt auto-imports (useRuntimeConfig, NuxtLink, etc.) are NOT available.
 * We use @testing-library/vue's render() — the standard way to mount Vue
 * components outside of Nuxt. This is the fastest test category and ideal
 * for simple, self-contained components that only depend on props.
 */
import { render, screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import Headline from "../../app/components/Headline.vue";

describe("Headline", () => {
  // render() mounts the component into a happy-dom document.
  // screen.getByText() queries the rendered DOM — a Testing Library pattern
  // that encourages testing what the user sees rather than implementation details.
  it("renders the provided text", () => {
    render(Headline, {
      props: { text: "todos" },
    });

    expect(screen.getByText("todos")).toBeDefined();
  });
});
