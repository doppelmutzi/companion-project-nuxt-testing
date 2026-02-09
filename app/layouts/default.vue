<template>
  <div>
    <div class="layout-header">
      <NuxtLink to="/" class="layout-headline-link">
        <Headline :text="appTitle" />
      </NuxtLink>
      <button class="dark-mode-toggle" @click="toggleDarkMode">
        {{ isDark ? "☀️" : "🌙" }}
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import Headline from "@/components/Headline.vue";

const { appTitle } = useRuntimeConfig().public;
const { isDark, toggleDarkMode } = useDarkMode();
</script>

<style lang="scss">
.layout-header {
  text-align: center;
}

.layout-headline-link {
  text-decoration: none;
}

.dark-mode-toggle {
  background: none;
  border: 1px solid #e6e6e6;
  border-radius: 4px;
  font-size: 18px;
  padding: 4px 10px;
  cursor: pointer;
  margin-bottom: 16px;

  &:hover {
    border-color: #999;
  }
}
</style>
