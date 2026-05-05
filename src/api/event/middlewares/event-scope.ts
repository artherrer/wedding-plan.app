import type { Core } from "@strapi/strapi";

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized("You must be logged in");
    }

    // 1. Obtener eventos del usuario
    const events = await strapi.documents("api::event.event").findMany({
      filters: {
        admins: {
          id: {
            $eq: user.id,
          },
        },
      },
      populate: "admins",
    });

    if (!events || events.length === 0) {
      return ctx.notFound("No events found for user");
    }

    ctx.state.events = events;

    // 2. Leer documentId desde query (si viene)
    const filters = ctx.query.filters as {
      event?: {
        documentId?: {
          $eq?: string;
        };
      };
    };

    let eventDocumentId = filters?.event?.documentId?.$eq;

    // 3. Si no viene, usar el primero (o decide tu regla)
    if (!eventDocumentId) {
      return await next();
    }

    // 4. Validar acceso
    const hasAccess = events.some((e) => e.documentId === eventDocumentId);

    if (!hasAccess) {
      return ctx.forbidden("No access to this event");
    }

    // 5. 🔥 Forzar SIEMPRE el filtro (clave de seguridad)
    ctx.query = {
      ...(ctx.query as any),
      filters: {
        ...(ctx.query.filters || {}),
        event: {
          documentId: {
            $eq: eventDocumentId,
          },
        },
      },
    };

    // 6. Guardarlo para uso en controllers
    ctx.state.event = events.find((e) => e.documentId === eventDocumentId);

    ctx.state.eventDocumentId = eventDocumentId;

    await next();
  };
};
