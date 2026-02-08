import type { Todo } from "~/stores/todos";

const todos: Todo[] = [
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

export default defineEventHandler((): Todo[] => {
  return todos;
});
