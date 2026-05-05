/**
 * companion router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::companion.companion', {
  config: {
    find: {
      middlewares: ["api::event.event-scope"],
    },
    findOne: {
      middlewares: ["api::event.event-scope"],
    },
    create: {
      middlewares: ["api::event.event-scope"],
    },
    update: {
      middlewares: ["api::event.event-scope"],
    },
    delete: {
      middlewares: ["api::event.event-scope"],
    },
  },
});

