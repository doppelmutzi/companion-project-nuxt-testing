<template>
  <button
    class="filter-button"
    :style="{
      borderColor: active ? theme.color : 'transparent',
      backgroundColor,
      color,
    }"
    @click="onClick()"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
interface ButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

defineProps<ButtonProps>();

const { theme } = useDarkMode();
const { backgroundColor, color } = theme.value;
</script>
<style lang="scss">
.filter-button {
  border-style: solid;
  border-width: 1px;
  padding: 7px;
  border-radius: 3px;
  background: none;
  cursor: pointer;
  display: block;
}
</style>
