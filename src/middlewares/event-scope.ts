/**
 * `event-scope` middleware
 */

import type { Core } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  // Add your own logic here.
  return async (ctx, next) => {
    const path = ctx.request.path;    

    // 👇 Ignorar completamente admin panel y auth interno
    if (
      path.startsWith("/admin") ||
      path.startsWith("/content-manager") ||
      path.startsWith("/upload") ||
      path.startsWith("/users-permissions")
    ) {
      return await next();
    }

    // const user = ctx.state.user;
    const eventId = ctx.request.headers["x-event-id"];

    if (!eventId) {
      return ctx.unauthorized("Missing user or event");
    }
    // if (!user || !eventId) {
    //   return ctx.unauthorized("Missing user or event");
    // }

    // verificar que el usuario pertenece al evento
    
    const event = await strapi.documents("api::event.event").findOne({
      populate: ["admins"],
      documentId: eventId,
    });    

    // const isAllowed = event.admins.some((a) => a.id === user.id);

    // if (!isAllowed) {
    //   return ctx.forbidden("You don't have access to this event");
    // }

    ctx.state.event = event;

    await next();
  };
};
