<template>
  <NuxtLayout>
    <div class="error-page">
      <p class="error-code">{{ error?.status }}</p>
      <p class="error-message">{{ error?.message || "Something went wrong" }}</p>
      <button class="error-home-link" @click="handleError">← Back to home</button>
    </div>
  </NuxtLayout>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps({
  error: Object as () => NuxtError,
});

const handleError = () => clearError({ redirect: "/" });
</script>

<style lang="scss">
.error-page {
  text-align: center;
  padding: 40px 20px;
}

.error-code {
  font-size: 80px;
  font-weight: 100;
  color: rgba(175, 47, 47);
  margin: 0;
}

.error-message {
  font-size: 20px;
  color: #6d7582;
  margin: 10px 0 30px;
}

.error-home-link {
  color: rgba(175, 47, 47);
  text-decoration: none;
  font-size: 18px;

  &:hover {
    text-decoration: underline;
  }
}
</style>
