/**
 * guest controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::guest.guest",
  ({ strapi }) => ({
    async find(ctx) {
      return await super.find(ctx);
    },

    async findOne(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi.documents("api::guest.guest").findOne({
        populate: ["event"],
        documentId: ctx.params.id,
      });

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      return entity;
    },

    async create(ctx) {
      if (ctx.request.body.data) {
        delete ctx.request.body.data.unique_code;
      }

      const fullName: string = ctx.request.body.data?.full_name ?? "";
      const eventDocumentId: string = ctx.request.body.data?.event;
      const initials = fullName
        .split(" ")
        .map((n) => n.charAt(0).toUpperCase())
        .join("")
        .slice(0, 3);

      let unique_code: string;
      let attempts = 0;
      do {
        const randomPart = Array.from({ length: 3 }, () =>
          Math.floor(Math.random() * 10),
        ).join("");
        unique_code = `${initials}${randomPart}`;
        const existing = await strapi.documents("api::guest.guest").findMany({
          filters: {
            unique_code: { $eq: unique_code },
            event: { documentId: { $eq: eventDocumentId } },
          },
        });
        if (existing.length === 0) break;
        attempts++;
      } while (attempts < 10);

      ctx.request.body.data = { ...ctx.request.body.data, unique_code };

      return await super.create(ctx);
    },

    async update(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi.documents("api::guest.guest").findOne({
        populate: ["event", "table"],
        documentId: ctx.params.id,
      });

      if (!entity) {
        return ctx.notFound("Guest not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      if (entity.table) {
        await strapi.documents("api::table.table").update({
          documentId: entity.table.documentId,
          data: {
            captain_guest: null,
            captain_companion: null,
          },
        });
      }

      // 🔥 Evitar cambiar de evento
      if (ctx.request.body.data?.event) {
        delete ctx.request.body.data.event;
      }

      return await super.update(ctx);
    },

    async delete(ctx) {
      const userEvents = ctx.state.events;

      const entity = await strapi.documents("api::guest.guest").findOne({
        populate: ["event"],
        documentId: ctx.params.id,
      });

      if (!entity) {
        return ctx.notFound("Guest not found");
      }

      const hasAccess = userEvents.some(
        (e) => e.documentId === entity.event?.documentId,
      );

      if (!hasAccess) {
        return ctx.forbidden("Access denied");
      }

      return await super.delete(ctx);
    },

    async confirm(ctx) {
      const { unique_code, status, confirmed_passes } = ctx.request.body as {
        unique_code?: string;
        status?: string;
        confirmed_passes?: number;
      };

      if (!unique_code) {
        return ctx.badRequest("unique_code is required");
      }

      if (!status || !["yes", "no"].includes(status)) {
        return ctx.badRequest("status must be 'yes' or 'no'");
      }

      const guests = await strapi.documents("api::guest.guest").findMany({
        filters: { unique_code: { $eq: unique_code } },
        populate: ["event"],
      });

      const guest = guests[0];

      if (!guest) {
        return ctx.notFound("Guest not found");
      }

      const updateData: Record<string, unknown> = { status };

      if (status === "yes") {
        const passes = confirmed_passes ?? guest.max_passes;

        if (passes < 1 || passes > guest.max_passes) {
          return ctx.badRequest(
            `confirmed_passes must be between 1 and ${guest.max_passes}`,
          );
        }

        updateData.confirmed_passes = passes;
      } else {
        updateData.confirmed_passes = 0;
      }

      const updated = await strapi.documents("api::guest.guest").update({
        documentId: guest.documentId,
        data: updateData,
      });

      return {
        full_name: updated.full_name,
        status: updated.status,
        confirmed_passes: updated.confirmed_passes,
        max_passes: updated.max_passes,
      };
    },

    async getInvitation(ctx) {
      const { eventDocumentId, code } = ctx.params as {
        eventDocumentId: string;
        code: string;
      };

      const guests = await strapi.documents("api::guest.guest").findMany({
        filters: {
          unique_code: { $eq: code },
          event: { documentId: { $eq: eventDocumentId } },
        },
        populate: {
          event: {
            populate: ["gift_registry", "schedule", "locations"],
          },
          companions: true,
        },
      });

      const guest = guests[0];

      if (!guest) {
        return ctx.notFound("Invitation not found");
      }

      return {
        data: guest,
      };
    },
  }),
);
