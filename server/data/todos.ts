import type { Todo } from "~~/app/stores/todos";

export const todos: Todo[] = [
  {
    id: 1,
    label: "checked todo",
    date: "today",
    checked: false,
  },
  {
    id: 2,
    label: "unchecked todo",
    date: "today",
    checked: true,
  },
];
