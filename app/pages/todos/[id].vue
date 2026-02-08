<template>
  <div class="todo-detail">
    <div class="todo-detail__card">
      <h2 class="todo-detail__title">{{ todo?.label }}</h2>
      <p class="todo-detail__date">Created: {{ todo?.date }}</p>
      <p class="todo-detail__status">
        Status:
        <span :class="todo?.checked ? 'is-checked' : 'is-unchecked'">
          {{ todo?.checked ? "Completed" : "Active" }}
        </span>
      </p>
      <NuxtLink to="/" class="todo-detail__back">← Back to list</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Todo } from "@/stores/todos";

const route = useRoute();
const todoId = Number(route.params.id);

const { data: todo } = await useFetch<Todo>(`/api/todos/${todoId}`);

if (!todo.value) {
  throw createError({
    statusCode: 404,
    statusMessage: `Todo with id ${todoId} not found`,
  });
}

useHead({
  title: `Todo: ${todo.value.label}`,
});
</script>

<style lang="scss">
.todo-detail {
  max-width: 550px;
  margin: 40px auto;

  &__card {
    background: white;
    padding: 24px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2), 0 25px 50px 0 rgba(0, 0, 0, 0.1);
  }

  &__title {
    font-size: 28px;
    font-weight: 300;
    color: #4d4d4d;
    margin-bottom: 12px;
  }

  &__date {
    font-size: 14px;
    color: #999;
    margin-bottom: 8px;
  }

  &__status {
    font-size: 16px;
    color: #4d4d4d;
    margin-bottom: 20px;
  }

  &__back {
    display: inline-block;
    color: rgba(175, 47, 47, 0.6);
    text-decoration: none;
    font-size: 14px;

    &:hover {
      color: rgba(175, 47, 47, 1);
    }
  }
}

.is-checked {
  color: #0dbe9b;
}

.is-unchecked {
  color: #e2a83e;
}
</style>
