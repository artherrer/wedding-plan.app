/**
 * companion controller
 */

import { factories } from "@strapi/strapi";
import { generateUniqueCode, isAlphanumeric } from "../../../utils/unique-code";

const companionCodeTaken = async (code: string) =>
  (
    await strapi.documents("api::companion.companion").findMany({
      filters: { unique_code: { $eq: code } },
      fields: ["documentId"],
    })
  ).length > 0;

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
      const data = ctx.request.body.data ?? {};
      const providedCode =
        typeof data.unique_code === "string" ? data.unique_code.trim() : "";

      if (providedCode) {
        if (!isAlphanumeric(providedCode)) {
          return ctx.badRequest("unique_code must be alphanumeric");
        }
        if (await companionCodeTaken(providedCode)) {
          return ctx.badRequest(`unique_code "${providedCode}" already exists`);
        }
        data.unique_code = providedCode;
      } else {
        data.unique_code = await generateUniqueCode(
          data.full_name ?? "",
          companionCodeTaken,
        );
      }

      ctx.request.body.data = data;
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

      // 🔒 evitar cambiar de evento o de código
      if (ctx.request.body.data?.event) {
        delete ctx.request.body.data.event;
      }
      if (ctx.request.body.data?.unique_code !== undefined) {
        delete ctx.request.body.data.unique_code;
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
