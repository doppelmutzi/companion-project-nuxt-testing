# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for full architecture, data flow, conventions, and testing details.

## Commands

```bash
npm run dev        # Nuxt dev server at http://localhost:3000
npm run build      # Production build
npm run preview    # Preview production build
npm test           # Run all Vitest projects (watch mode)
npx vitest run     # Single run of all tests
npx vitest run --project=unit   # Run only unit tests
npx vitest run --project=nuxt   # Run only nuxt tests
npx vitest run --project=e2e    # Run only e2e tests
npm run typecheck  # vue-tsc --noEmit
```

To run a single test file: `npx vitest run path/to/test.test.ts`

## Test Conventions 

- use only `test` instead of `it`