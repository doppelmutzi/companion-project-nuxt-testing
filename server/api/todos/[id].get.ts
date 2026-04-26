import { getTodoById } from "../../utils/db";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));
  const todo = getTodoById(id);

  if (!todo) {
    const error = createError({
      statusCode: 404,
      statusMessage: `Todo with id ${id} not found`,
    });
    throw error;
  }

  return todo;
});
