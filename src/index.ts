import type { Core } from '@strapi/strapi';
import { generateUniqueCode } from './utils/unique-code';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Acompañantes creados antes de que existiera unique_code
    const companions = strapi.documents('api::companion.companion');
    const sinCodigo = await companions.findMany({
      filters: { unique_code: { $null: true } },
      fields: ['documentId', 'full_name'],
      limit: -1,
    });
    for (const c of sinCodigo) {
      const unique_code = await generateUniqueCode(c.full_name ?? '', async (code) =>
        (await companions.count({ filters: { unique_code: { $eq: code } } })) > 0,
      );
      await companions.update({ documentId: c.documentId, data: { unique_code } });
    }
  },
};
