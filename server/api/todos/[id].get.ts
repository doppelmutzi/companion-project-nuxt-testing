import { todos } from "../../data/todos";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    throw createError({
      statusCode: 404,
      statusMessage: `Todo with id ${id} not found`,
    });
  }

  return todo;
});
