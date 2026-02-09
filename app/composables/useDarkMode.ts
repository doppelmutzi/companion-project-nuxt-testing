import themeConfig from "@/utils/theme";

export const useDarkMode = () => {
  const isDark = useState("darkMode", () => true);

  const theme = computed(() =>
    isDark.value ? themeConfig.DARK : themeConfig.LIGHT,
  );

  function toggleDarkMode() {
    isDark.value = !isDark.value;
  }

  return { isDark, theme, toggleDarkMode };
};
