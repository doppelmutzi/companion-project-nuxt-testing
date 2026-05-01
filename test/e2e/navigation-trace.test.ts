// Showcases: createPage with Playwright video recording and trace viewer
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
 * createPage(undefined, contextOptions) — creates a new Playwright Page
 *   (NuxtPage) with a fresh browser context per test. The second argument
 *   accepts any Playwright BrowserContextOptions, e.g. recordVideo.
 *   Called without a path to skip the built-in waitUntil:'hydration' goto,
 *   then navigated manually with waitUntil:'domcontentloaded'.
 *
 * url(path) — returns the absolute URL for the given path on the test server.
 *
 * Video recording — enabled via recordVideo on the browser context. Each test
 *   gets its own .webm file in test-results/videos/ (auto-named by Playwright).
 *   The file is finalized when the context closes at the end of afterEach.
 *
 * Tracing — page.context().tracing captures screenshots and DOM snapshots at
 *   every Playwright action. The trace is always saved to
 *   test-results/traces/<test-name>.zip so you can inspect any run, not just
 *   failures. Open with: npx playwright show-trace test-results/traces/<name>.zip
 *
 * Screenshot on failure — taken just before the page closes so you get a
 *   pixel-perfect snapshot of the exact failing state in test-results/.
 *
 */
import { createPage, setup, url } from '@nuxt/test-utils/e2e'
import type { NuxtPage } from '@nuxt/test-utils/e2e'
import { mkdirSync } from 'node:fs'
import { afterEach, beforeEach, describe, expect, test } from 'vitest'

describe('navigation flow', async () => {
  await setup({ browser: true })

  let page: NuxtPage

  beforeEach(async () => {
    mkdirSync('test-results/videos', { recursive: true })
    mkdirSync('test-results/traces', { recursive: true })
    page = await createPage(undefined, {
      recordVideo: { dir: 'test-results/videos/' },
    })
    await page.context().tracing.start({ screenshots: true, snapshots: true })
  })

  afterEach(async (ctx) => {
    const safeName = ctx.task.name.replace(/[^a-z0-9]+/gi, '-')
    await page?.context().tracing.stop({
      path: `test-results/traces/${safeName}.zip`,
    })
    if (ctx.task.result?.state === 'fail') {
      mkdirSync('test-results', { recursive: true })
      await page?.screenshot({
        path: `test-results/${safeName}.png`,
        fullPage: true,
      })
    }
    const context = page?.context()
    await page?.close()
    await context?.close()
  })

  test('adds a todo, navigates to detail page, then back home via headline', async () => {
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
