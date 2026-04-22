/**
 * table controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::table.table",
  ({ strapi }) => ({
    async find(ctx) {
      const eventId = ctx.state.event.id;

      const originalFilters = ctx.request.query.filters || {};

      ctx.request.query = {
        ...ctx.request.query,
        filters: {
          originalFilters,
          event: eventId,
        },
      };

      return await super.find(ctx);
    },

    async findOne(ctx) {
      const eventId = ctx.state.event.id;

      const entity = await strapi.documents("api::table.table").findOne({
        populate: ["event"],
        documentId: ctx.params.id,
      });

      if (!entity || entity.event.id !== eventId) {
        return ctx.forbidden("Access denied");
      }

      return entity;
    },

    async create(ctx) {
      const eventId = ctx.state.event.id;

      ctx.request.body.data.event = eventId;

      return await super.create(ctx);
    },

    async update(ctx) {
      const eventId = ctx.state.event.id;

      const entity = await strapi.documents("api::table.table").findOne({
        populate: ["event"],
        documentId: ctx.params.id,
      });

      if (!entity || entity.event.id !== eventId) {
        return ctx.forbidden("Access denied");
      }

      delete ctx.request.body.data?.event;

      return await super.update(ctx);
    },

    async delete(ctx) {
      const eventId = ctx.state.event.id;

      const entity = await strapi.documents("api::table.table").findOne({
        populate: ["event"],
        documentId: ctx.params.id,
      });

      if (!entity || entity.event.id !== eventId) {
        return ctx.forbidden("Access denied");
      }

      return await super.delete(ctx);
    },
  }),
);
