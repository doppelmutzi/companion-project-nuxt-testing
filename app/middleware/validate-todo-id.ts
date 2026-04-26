export default defineNuxtRouteMiddleware((to) => {
  const id = to.params.id as string;

  if (!/^\d+$/.test(id)) {
    abortNavigation(
      createError({
        statusCode: 400,
        statusMessage: `Invalid todo id: "${id}"`,
      }),
    );
  }
});
