import type { Todo } from "~~/app/stores/todos";
import { todos } from "../data/todos";

export default defineEventHandler((): Todo[] => {
  return todos;
});
