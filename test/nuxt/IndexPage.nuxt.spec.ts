import { registerEndpoint, renderSuspended } from "@nuxt/test-utils/runtime";
import { screen } from "@testing-library/vue";
import { describe, expect, it } from "vitest";
import IndexPage from "~/pages/index.vue";

const mockTodos = [
  { id: 1, label: "Buy groceries", date: "2026-02-11", checked: false },
  { id: 2, label: "Walk the dog", date: "2026-02-10", checked: true },
  { id: 3, label: "Write tests", date: "2026-02-09", checked: false },
];

registerEndpoint("/api/todos", () => mockTodos);

describe("Index Page", () => {
  it("renders todos from the mocked /api/todos endpoint", async () => {
    await renderSuspended(IndexPage);

    expect(screen.getByText("Buy groceries")).toBeDefined();
    expect(screen.getByText("Walk the dog")).toBeDefined();
    expect(screen.getByText("Write tests")).toBeDefined();
  });
});
