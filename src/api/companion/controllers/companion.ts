/**
 * companion controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::companion.companion",
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

      const entity = await strapi
        .documents("api::companion.companion")
        .findOne({
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

      const entity = await strapi
        .documents("api::companion.companion")
        .findOne({
          populate: ["event"],
          documentId: ctx.params.id,
        });

      if (!entity || entity.event.id !== eventId) {
        return ctx.forbidden("Access denied");
      }

      const guest = await strapi.documents("api::guest.guest").findOne({
        populate: ["event"],
        documentId: ctx.params.id,
      });

      if (guest.event.id !== eventId) {
        return ctx.forbidden("Invalid relation");
      }

      delete ctx.request.body.data?.event;

      return await super.update(ctx);
    },

    async delete(ctx) {
      const eventId = ctx.state.event.id;

      const entity = await strapi
        .documents("api::companion.companion")
        .findOne({
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
