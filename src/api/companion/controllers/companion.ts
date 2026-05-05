/**
 * companion controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::companion.companion",
  ({ strapi }) => ({
    // ─────────────────────────────────────────────
    async find(ctx) {
      // Middleware ya valida + fuerza filtro
      return await super.find(ctx);
    },

    // ─────────────────────────────────────────────
    async findOne(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi
        .documents("api::companion.companion")
        .findOne({
          documentId: ctx.params.id,
          populate: ["event"],
        });

      if (!entity) {
        return ctx.notFound("Companion not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId,
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

      const entity = await strapi
        .documents("api::companion.companion")
        .findOne({
          documentId: ctx.params.id,
          populate: ["guest.event"],
        });

      if (!entity) {
        return ctx.notFound("Companion not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.guest.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      // 🔥 Validar que el guest (si viene) pertenece al mismo evento
      if (ctx.request.body.data?.guest) {
        const guest = await strapi.documents("api::guest.guest").findOne({
          documentId: ctx.request.body.data.guest,
          populate: ["event"],
        });

        if (!guest || guest.event?.documentId !== entity.guest.event?.documentId) {
          return ctx.forbidden("Invalid guest relation");
        }
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

      const entity = await strapi
        .documents("api::companion.companion")
        .findOne({
          documentId: ctx.params.id,
          populate: ["guest.event"],
        });

      if (!entity) {
        return ctx.notFound("Companion not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.guest?.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      return await super.delete(ctx);
    },
  }),
);
