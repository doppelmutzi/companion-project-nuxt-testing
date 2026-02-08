import { toggleTodo, getTodoById } from "../../utils/db";

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, "id"));
  const body = await readBody(event);

  const existing = getTodoById(id);
  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: `Todo with id ${id} not found`,
    });
  }

  if (typeof body.checked !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid 'checked' field",
    });
  }

  const updated = toggleTodo(id, body.checked);
  return updated;
});
