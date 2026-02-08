import themeConfig from "../utils/theme";
import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface Todo {
  id: number;
  label: string;
  date: string;
  checked: boolean;
}

export enum FilterIndex {
  ALL = 0,
  CHECKED = 1,
  UNCHECKED = 2,
}

export const useTodosStore = defineStore("todos", () => {
  // state
  const theme = ref(themeConfig.DARK);
  const todos = ref<Todo[]>([]);
  const filterIndex = ref(FilterIndex.ALL);

  // getters
  const todosLeft = computed(() =>
    todos.value.reduce((count, todo) => {
      if (!todo.checked) return count + 1;
      return count;
    }, 0),
  );

  const filteredTodos = computed(() => {
    if (filterIndex.value === FilterIndex.ALL) {
      return todos.value;
    } else if (filterIndex.value === FilterIndex.UNCHECKED) {
      return todos.value.filter((todo) => !todo.checked);
    } else {
      return todos.value.filter((todo) => todo.checked);
    }
  });

  const todosChecked = computed(() => todosLeft.value !== todos.value.length);

  // actions
  function setTodos(newTodos: Todo[]) {
    todos.value = newTodos;
  }

  function toggleDarkMode() {
    if (theme.value === themeConfig.DARK) {
      theme.value = themeConfig.LIGHT;
    } else {
      theme.value = themeConfig.DARK;
    }
  }

  async function addTodo(todo: Todo) {
    const created = await $fetch<Todo>("/api/todos", {
      method: "POST",
      body: todo,
    });
    todos.value.push(created);
  }

  async function toggleTodos() {
    const shouldCheck = todosLeft.value > 0;
    const updated = await $fetch<Todo[]>("/api/todos", {
      method: "PATCH",
      body: { checked: shouldCheck },
    });
    todos.value = updated;
  }

  async function toggleCheckTodo(todo: Todo) {
    const updated = await $fetch<Todo>(`/api/todos/${todo.id}`, {
      method: "PATCH",
      body: { checked: !todo.checked },
    });
    const index = todos.value.findIndex((item) => item.id === todo.id);
    const updatedTodos = [...todos.value];
    updatedTodos[index] = updated!;
    todos.value = updatedTodos;
  }

  async function removeTodo(todo: Todo) {
    await $fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
    todos.value = [...todos.value.filter((item) => item.id != todo.id)];
  }

  async function clearCheckedTodos() {
    await $fetch("/api/todos", { method: "DELETE" });
    todos.value = [...todos.value.filter((todo) => !todo.checked)];
  }

  function setFilterIndex(index: FilterIndex) {
    filterIndex.value = index;
  }

  return {
    // state
    theme,
    todos,
    filterIndex,
    // getters
    todosLeft,
    filteredTodos,
    todosChecked,
    // actions
    setTodos,
    toggleDarkMode,
    addTodo,
    toggleTodos,
    toggleCheckTodo,
    removeTodo,
    clearCheckedTodos,
    setFilterIndex,
  };
});
