import { deleteTodo } from "../../utils/db";

export default defineEventHandler((event) => {
  const id = Number(getRouterParam(event, "id"));
  const deleted = deleteTodo(id);

  if (!deleted) {
    throw createError({
      statusCode: 404,
      statusMessage: `Todo with id ${id} not found`,
    });
  }

  setResponseStatus(event, 204);
  return null;
});
