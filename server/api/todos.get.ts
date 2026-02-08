import { getAllTodos } from "../utils/db";

export default defineEventHandler(() => {
  return getAllTodos();
});
