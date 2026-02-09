<template>
  <div>
    <NuxtLink to="/" class="layout-headline-link">
      <Headline :text="appTitle" />
    </NuxtLink>
    <slot />
  </div>
</template>

<script setup lang="ts">
import Headline from "@/components/Headline.vue";

const { appTitle } = useRuntimeConfig().public;
</script>

<style lang="scss">
.layout-headline-link {
  text-decoration: none;
}
</style>
