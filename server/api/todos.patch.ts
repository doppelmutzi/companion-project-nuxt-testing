import { setAllChecked } from "../utils/db";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  if (typeof body.checked !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing or invalid 'checked' field",
    });
  }

  const todos = setAllChecked(body.checked);
  return todos;
});
