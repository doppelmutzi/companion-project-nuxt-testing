// Showcases: createPage with headless:false — runs in a visible browser window
/**
 * Showcases: Same navigation flow as navigation.test.ts but with a real,
 * visible browser window so you can watch the test execute in real time.
 *
 * setup({ browser: true, browserOptions: { launch: { headless: false } } })
 *   — launches a full Chromium window instead of the default headless shell.
 *     Every click, navigation, and input is visible on screen.
 *
 * slowMo: 600 — adds a 600 ms delay between each Playwright action, making
 *   the interactions easy to follow without the window flashing by too fast.
 *
 * This file is intentionally separate from navigation.test.ts so that
 * headed mode (which opens a GUI window) is opt-in and clearly labelled.
 *
 * Primary purpose: debugging during test authoring — watch the browser
 * execute each step in real time while writing or troubleshooting a test.
 * It is NOT needed for CI or failure analysis; Playwright's trace viewer,
 * video recording, and screenshots cover those use cases in headless mode.
 * See navigation.test.ts for the canonical headless version.
 */
import { createPage, setup, url } from '@nuxt/test-utils/e2e'
import { describe, expect, test } from 'vitest'

describe('navigation flow (headed browser)', async () => {
  await setup({
    browser: true,
    browserOptions: {
      type: 'chromium',
      launch: { headless: false, slowMo: 600 },
    },
  })

  test('adds a todo, navigates to detail page, then back home via headline', async () => {
    const page = await createPage()
    await page.goto(url('/'), { waitUntil: 'domcontentloaded' })

    const todoLabel = `T12 headed test ${Date.now()}`
    await page.fill('.todo-input input', todoLabel)
    await page.keyboard.press('Enter')

    const itemLink = page.locator('.item-label', { hasText: todoLabel })
    await itemLink.waitFor()
    await itemLink.click()
    await page.waitForURL(/\/todos\/\d+/)

    await page.waitForSelector('.todo-detail__title')
    const titleText = await page.locator('.todo-detail__title').textContent()
    expect(titleText?.trim()).toBe(todoLabel)

    await page.locator('.layout-headline-link').click()
    await page.waitForURL(url('/'))
    await page.waitForSelector('.todo-input input', { state: 'visible' })
    expect(await page.locator('.todo-input input').isVisible()).toBe(true)
  })
})
