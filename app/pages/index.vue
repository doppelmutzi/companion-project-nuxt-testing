<template>
  <div>
    <Headline :text="appTitle" />
    <div class="todos">
      <TodoInput />
      <TodoList />
      <ActionBar v-if="showActionBar" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTodosStore } from "@/stores/todos";
import { computed } from "vue";
import type { Todo } from "@/stores/todos";
import ActionBar from "@/components/ActionBar.vue";
import Headline from "@/components/Headline.vue";
import TodoInput from "@/components/TodoInput.vue";
import TodoList from "@/components/TodoList.vue";

const { appTitle } = useRuntimeConfig().public;

const store = useTodosStore();
const { data } = await useFetch<Todo[]>("/api/todos");

if (data.value && store.todos.length === 0) {
  store.setTodos(data.value);
}

const showActionBar = computed(() => store.todos.length > 0);
</script>

<style lang="scss">
.todos {
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
}
</style>
