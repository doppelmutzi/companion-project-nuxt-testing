import { createTodo } from "../utils/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.label || typeof body.label !== "string") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid 'label'",
    });
  }

  const todo = createTodo({
    id: body.id ?? Date.now(),
    label: body.label,
    date: body.date ?? new Date().toDateString(),
    checked: body.checked ?? false,
  });

  setResponseStatus(event, 201);
  return todo;
});
