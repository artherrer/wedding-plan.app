/**
 * event-checklist-item controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::event-checklist-item.event-checklist-item",
  ({ strapi }) => ({
    async update(ctx) {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Fetch the existing checklist item
      const existingItem = await strapi
        .documents("api::event-checklist-item.event-checklist-item")
        .findOne({
          documentId: id,
          populate: ["event"],
        });

      if (!existingItem) {
        return ctx.notFound("Checklist item not found");
      }

      // Check if the user has access to the event
      const userEvents = ctx.state.events || [];
      const hasAccess = userEvents.some(
        (e) => e.documentId === existingItem.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      // Proceed with the update
      return await super.update(ctx);
    },

    async delete(ctx) {
      const { id } = ctx.params;

      // Fetch the existing checklist item
      const existingItem = await strapi
        .documents("api::event-checklist-item.event-checklist-item")
        .findOne({
          documentId: id,
          populate: ["event"],
        });

      if (!existingItem) {
        return ctx.notFound("Checklist item not found");
      }

      // Check if the user has access to the event
      const userEvents = ctx.state.events || [];
      const hasAccess = userEvents.some(
        (e) => e.documentId === existingItem.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      // Proceed with the deletion
      return await super.delete(ctx);
    },
  }),
);
