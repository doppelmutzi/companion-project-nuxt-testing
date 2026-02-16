// Showcases: mockNuxtImport (useState) + vi.hoisted
/**
 * Showcases: Testing a Nuxt composable with mockNuxtImport.
 *
 * useDarkMode relies on useState — a Nuxt auto-import that provides SSR-safe
 * reactive state. This makes it a natural fit for the Nuxt test environment,
 * where auto-imports are resolved by the framework just like in the real app.
 *
 * Why not a unit test? In a unit test (happy-dom), Nuxt auto-imports like
 * useState and computed are simply undefined — they don't exist without the
 * Nuxt build transform. You'd need ugly workarounds like assigning mocks to
 * globalThis. The Nuxt test environment eliminates this: auto-imports work
 * out of the box, and mockNuxtImport lets you replace specific ones cleanly.
 *
 * mockNuxtImport vs globalThis mocking:
 * - mockNuxtImport is a macro that transforms into vi.mock under the hood.
 *   It intercepts the auto-import at the module level, so the composable
 *   receives your mock when it calls useState(). This is the idiomatic way
 *   to test code that depends on Nuxt auto-imports.
 * - globalThis hacks (assigning to globalThis.useState) bypass the module
 *   system entirely. They work but are fragile and don't reflect how the
 *   code actually runs in Nuxt.
 *
 * Dynamic mocks with vi.hoisted: mockNuxtImport can only be called once per
 * import per file (it's hoisted like vi.mock). To control the mock's behavior
 * per test, we use vi.hoisted() to create a ref that's accessible in both the
 * mock factory and individual tests. This pattern is documented in the Nuxt
 * testing guide.
 */
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import themeConfig from "~/utils/theme";

// vi.hoisted creates the mock ref before mockNuxtImport's factory runs.
// This ref replaces what useState would normally return, giving us control
// over the dark mode state in each test.
const { darkModeRef } = vi.hoisted(() => {
  const { ref } = require("vue");
  return { darkModeRef: ref(true) };
});

// mockNuxtImport replaces the auto-imported useState with our mock.
// The factory returns a function that ignores the key/init arguments and
// always returns our controllable ref — simulating useState('darkMode', ...).
// This is called once at module load time (it's hoisted), so it must be
// at the top level, not inside describe/it.
mockNuxtImport("useState", () => {
  return () => darkModeRef;
});

import { useDarkMode } from "~/composables/useDarkMode";

describe("useDarkMode", () => {
  // Reset the mock ref before each test to ensure clean state.
  beforeEach(() => {
    darkModeRef.value = true;
  });

  // isDark should reflect the value from useState. Since our mock returns
  // a ref initialized to true, this matches the composable's default of
  // useState('darkMode', () => true).
  it("has isDark set to true by default", () => {
    const { isDark } = useDarkMode();

    expect(isDark.value).toBe(true);
  });

  // toggleDarkMode flips isDark.value. Because useState returns a shared ref,
  // the toggle mutates the same ref — we verify the reactive update.
  it("toggles isDark when toggleDarkMode is called", () => {
    const { isDark, toggleDarkMode } = useDarkMode();

    toggleDarkMode();
    expect(isDark.value).toBe(false);

    toggleDarkMode();
    expect(isDark.value).toBe(true);
  });

  // theme is a computed derived from isDark. When isDark is true, it should
  // return the DARK theme config object.
  it("returns DARK theme config when isDark is true", () => {
    const { theme } = useDarkMode();

    expect(theme.value).toEqual(themeConfig.DARK);
  });

  // After toggling to false, the computed reactively switches to LIGHT.
  it("returns LIGHT theme config when isDark is false", () => {
    const { theme, toggleDarkMode } = useDarkMode();

    toggleDarkMode();

    expect(theme.value).toEqual(themeConfig.LIGHT);
  });
});
