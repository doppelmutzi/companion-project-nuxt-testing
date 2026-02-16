// Showcases: setup + $fetch (SSR smoke test)
/**
 * Showcases: E2E testing with @nuxt/test-utils — real Nuxt server + $fetch.
 *
 * E2E tests boot a full Nuxt server via setup() and interact with it over HTTP.
 * Unlike nuxt-environment tests (which mock the runtime), these run the complete
 * stack: Nitro server routes, SSR rendering, and the real database.
 *
 * $fetch makes HTTP requests against the running server and returns the response.
 * For SSR smoke tests, it returns the rendered HTML string — ideal for verifying
 * that server-side rendering produces the expected output without needing a browser.
 *
 * createPage (not used here yet) launches a real Playwright browser for full
 * interaction testing (clicking, typing, navigating). url() returns the base URL
 * of the test server.
 */
import { $fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('app', async () => {
  // setup() boots a real Nuxt server for this test suite. It must be awaited
  // at the top of describe() before any tests run. The server stays up for
  // the duration of the suite and is torn down automatically after.
  await setup()

  // $fetch('/') makes a real HTTP GET request to the Nuxt server and returns
  // the SSR-rendered HTML. This verifies that the server boots correctly and
  // the index page renders the expected placeholder text in the todo input.
  it('checks availability of input', async () => {
    const html = await $fetch('/')
    expect(html).toContain('What needs to be done?')
  })

})
