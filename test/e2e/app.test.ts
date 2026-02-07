import { $fetch, createPage, setup, url } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

describe('app', async () => {
  await setup()

  it('checks availability of input', async () => {
    // boots the Nuxt app without browser
    const html = await $fetch('/')
    expect(html).toContain('What needs to be done?')
  })

})
