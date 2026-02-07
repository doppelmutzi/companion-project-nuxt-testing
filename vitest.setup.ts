import { config } from '@vue/test-utils'

config.global.stubs = {
  // AtomsSvgIcon: true,
  AtomsSvgIcon: {
    template: '<span data-testid="svg-icon"><slot/></span>',
  },
}
