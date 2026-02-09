import { render, screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import Headline from "../../app/components/Headline.vue";

describe("Headline", () => {
  it("renders the provided text", () => {
    render(Headline, {
      props: { text: "todos" },
    });

    expect(screen.getByText("todos")).toBeDefined();
  });
});
