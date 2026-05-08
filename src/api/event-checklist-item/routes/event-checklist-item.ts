/**
 * event-checklist-item router
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreRouter(
  "api::event-checklist-item.event-checklist-item",
  {
    config: {
      update: {
        middlewares: ["api::event.event-scope"],
      },
      delete: {
        middlewares: ["api::event.event-scope"],
      },
    },
  },
);
