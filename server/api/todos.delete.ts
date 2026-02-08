import { clearCheckedTodos } from "../utils/db";

export default defineEventHandler(() => {
  const count = clearCheckedTodos();
  return { deleted: count };
});
