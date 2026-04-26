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
import { describe, expect, test, vi } from "vitest";
import themeConfig from "~/utils/theme";
import { useDarkMode } from "~/composables/useDarkMode";

// vi.hoisted creates useStateMock before the mockNuxtImport factory runs.
// The factory () => useStateMock evaluates useStateMock directly during
// hoisting — without vi.hoisted it would be in the temporal dead zone.
const { useStateMock } = vi.hoisted(() => ({ useStateMock: vi.fn() }));

// () => useStateMock evaluates useStateMock directly when the factory runs
// during hoisting — this is why vi.hoisted is required here. Wrapping it in
// a second closure (() => () => darkModeRef) would be lazy and not require it.
mockNuxtImport("useState", () => useStateMock);


describe("useDarkMode", () => {
  test("starts in dark mode and toggles to light and back", () => {
    useStateMock.mockReturnValue(ref(true));
    const { isDark, theme, toggleDarkMode } = useDarkMode();

    expect(isDark.value).toBe(true);
    expect(theme.value).toEqual(themeConfig.DARK);

    toggleDarkMode();
    expect(isDark.value).toBe(false);
    expect(theme.value).toEqual(themeConfig.LIGHT);

    toggleDarkMode();
    expect(isDark.value).toBe(true);
    expect(theme.value).toEqual(themeConfig.DARK);
  });

  test("starts in light mode and toggles to dark and back", () => {
    useStateMock.mockReturnValue(ref(false));
    const { isDark, theme, toggleDarkMode } = useDarkMode();

    expect(isDark.value).toBe(false);
    expect(theme.value).toEqual(themeConfig.LIGHT);

    toggleDarkMode();
    expect(isDark.value).toBe(true);
    expect(theme.value).toEqual(themeConfig.DARK);

    toggleDarkMode();
    expect(isDark.value).toBe(false);
    expect(theme.value).toEqual(themeConfig.LIGHT);
  });
});
