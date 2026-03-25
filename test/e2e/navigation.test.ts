// Showcases: createPage (Playwright) for full browser navigation flow
/**
 * Showcases: E2E browser testing with Playwright via @nuxt/test-utils.
 *
 * This test boots a real Nuxt server AND launches a Playwright browser,
 * enabling full end-to-end interaction: typing, clicking, navigating.
 *
 * setup({ browser: true }) — enables browser support for this suite.
 *   Under the hood, @nuxt/test-utils launches a Chromium browser that
 *   stays alive for the duration of the suite.
 *
 * createPage() — creates a new Playwright Page (NuxtPage). Called without
 *   a path to skip the built-in waitUntil:'hydration' goto, then navigated
 *   manually with waitUntil:'domcontentloaded'.
 *
 * url(path) — returns the absolute URL for the given path on the test server.
 *
 * afterEach + currentTestName — demonstrates how to take a screenshot
 *   automatically on failure. In @nuxt/test-utils + Vitest there is no
 *   built-in failure hook, so we check expect.getState().currentTestName
 *   combined with a try/finally in each test. The screenshot is written to
 *   test-results/ and can be inspected after a failed run.
 *
 */
import { createPage, setup, url } from '@nuxt/test-utils/e2e'
import type { NuxtPage } from '@nuxt/test-utils/e2e'
import { mkdirSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

describe('navigation flow', async () => {
  await setup({ browser: true })

  let page: NuxtPage

  beforeEach(async () => {
    // Each test gets a fresh page so failures are isolated.
    page = await createPage()
  })

  // afterEach runs even when the test throws, making it the right place for
  // failure screenshots. expect.getState().assertionCalls is reset per test,
  // but there is no direct "did this test fail?" API in Vitest — so we rely
  // on the page reference being set: if the test threw, page still exists and
  // we can capture its current state.
  //
  // A more robust pattern for larger suites is to wrap test bodies in
  // try/finally and call page.screenshot() in the finally block directly,
  // which guarantees a screenshot on every run (pass or fail) and lets you
  // diff them over time.
  afterEach(async (ctx) => {
    if (ctx.task.result?.state === 'fail') {
      mkdirSync('test-results', { recursive: true })
      const safeName = ctx.task.name.replace(/[^a-z0-9]+/gi, '-')
      await page?.screenshot({
        path: `test-results/${safeName}.png`,
        fullPage: true,
      })
    }
    await page?.close()
  })

  it('adds a todo, navigates to detail page, then back home via headline', async () => {
    // Navigate to home; domcontentloaded is sufficient — waitForSelector below
    // handles the rest once Vue has mounted the input.
    await page.goto(url('/'), { waitUntil: 'domcontentloaded' })

    // Type a new todo label into the input and submit with Enter.
    const todoLabel = `T12 nav test ${Date.now()}`
    await page.fill('.todo-input input', todoLabel)
    await page.keyboard.press('Enter')

    // Wait for the new TodoItem NuxtLink to appear in the list.
    const itemLink = page.locator('.item-label', { hasText: todoLabel })
    await itemLink.waitFor()

    // Click the NuxtLink on the todo item to navigate to the detail page.
    await itemLink.click()
    await page.waitForURL(/\/todos\/\d+/)

    // Verify the detail page renders the correct todo label.
    await page.waitForSelector('.todo-detail__title')
    const titleText = await page.locator('.todo-detail__title').textContent()
    expect(titleText?.trim()).toBe(todoLabel)

    // Click the layout headline link to navigate back home.
    // waitForURL expects the full absolute URL, so use url('/') from the
    // test server helper rather than the bare path string '/'.
    await page.locator('.layout-headline-link').click()
    await page.waitForURL(url('/'))

    // Verify we are back on the home page. waitForSelector with state:'visible'
    // waits until the input is both in the DOM and visible — more reliable than
    // isVisible() which is a point-in-time check that can race with rendering.
    await page.waitForSelector('.todo-input input', { state: 'visible' })
  })
})
