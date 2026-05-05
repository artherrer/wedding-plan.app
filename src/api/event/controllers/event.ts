/**
 * event controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::event.event",
  ({ strapi }) => ({
    async find(ctx) {
      const events = ctx.state.events;

      return {
        data: events,
        meta: {
          pagination: {
            page: 1,
            pageSize: events.length,
            pageCount: 1,
            total: events.length,
          },
        },
      };
    },
  }),
);
