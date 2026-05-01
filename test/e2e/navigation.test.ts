// Showcases: createPage (Playwright) for full browser navigation flow
import { createPage, fetch, setup, url } from "@nuxt/test-utils/e2e";
import { beforeEach, describe, expect, test } from "vitest";

describe("navigation flow", async () => {
  await setup({ browser: true });

  beforeEach(async () => {
    await fetch("/api/todos", { method: "PATCH", body: JSON.stringify({ checked: true }), headers: { "Content-Type": "application/json" } });
    await fetch("/api/todos", { method: "DELETE" });
  });

  test("adds a todo, navigates to detail page, then back home via headline", async () => {
    const page = await createPage();
    await page.goto(url("/"), { waitUntil: "domcontentloaded" });

    const todoLabel = "nav test";
    await page.fill(".todo-input input", todoLabel);
    await page.keyboard.press("Enter");

    const itemLink = page.locator(".item-label", { hasText: todoLabel });
    await itemLink.click();

    await page.waitForSelector(".todo-detail__title");
    const titleText = await page.locator(".todo-detail__title").textContent();
    expect(titleText?.trim()).toBe(todoLabel);

    await page.locator(".layout-headline-link").click();
    await page.waitForSelector(".todo-input input", { state: "visible" });
  });
});
