/**
 * table controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::table.table",
  ({ strapi }) => ({
    // ─────────────────────────────────────────────
    async find(ctx) {
      // El middleware ya filtra por event
      return await super.find(ctx);
    },

    // ─────────────────────────────────────────────
    async findOne(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi.documents("api::table.table").findOne({
        documentId: ctx.params.id,
        populate: ["event"],
      });

      if (!entity) {
        return ctx.notFound("Table not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      return entity;
    },

    // ─────────────────────────────────────────────
    async create(ctx) {
      return await super.create(ctx);
    },

    // ─────────────────────────────────────────────
    async update(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi.documents("api::table.table").findOne({
        documentId: ctx.params.id,
        populate: ["event"],
      });

      if (!entity) {
        return ctx.notFound("Table not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      // 🔒 evitar cambiar de evento
      if (ctx.request.body.data?.event) {
        delete ctx.request.body.data.event;
      }

      return await super.update(ctx);
    },

    // ─────────────────────────────────────────────
    async delete(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi.documents("api::table.table").findOne({
        documentId: ctx.params.id,
        populate: ["event"],
      });

      if (!entity) {
        return ctx.notFound("Table not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      return await super.delete(ctx);
    },
  })
);