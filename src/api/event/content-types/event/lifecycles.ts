export default {
  async afterCreate(event) {
    const { result, params } = event;

    // Si no tiene template, no hacemos nada
    if (!result.template) {
      return;
    }

    console.warn("afterCreate event triggered for event content type");
    console.warn("Result:", result);
    console.warn("Params:", params.data?.template);

    const eventPopulated = await strapi.documents("api::event.event").findOne({
      documentId: result.documentId,
      populate: ["template"],
    });

    const template = await strapi
      .documents("api::checklist-template.checklist-template")
      .findOne({
        documentId: eventPopulated.template.documentId,
        populate: ["sections.items"],
      });

    if (!template) {
      console.warn(
        `Checklist template with ID ${eventPopulated.template.documentId} not found. Skipping checklist item creation.`,
      );
      return;
    }

    console.log(
      `Found checklist template: ${template.title} with ${template.sections.length} sections.`,
    );
    let counter = 0;
    await strapi.db.transaction(
      async ({ trx, rollback, commit, onCommit, onRollback }) => {
        try {
          // Crear checklist items del evento
          for (const section of template.sections || []) {
            for (const item of section.items || []) {
              const newItem = await strapi
                .documents("api::event-checklist-item.event-checklist-item")
                .create({
                  data: {
                    title: item.title,
                    description: item.description,

                    // Snapshot
                    category: section.title,
                    order: item.order,

                    checked: false,

                    // Relaciones
                    event: result.documentId,
                    templateItem: item.documentId,

                    publishedAt: new Date().toISOString(),
                  },
                });

              await strapi
                .documents("api::event-checklist-item.event-checklist-item")
                .publish(newItem);

              counter++;
            }
          }

          console.log(
            `Created ${counter} checklist items for event: ${result.documentId}`,
          );
          await commit();
        } catch (error) {
          console.error(
            "Error in afterCreate lifecycle for event content type:",
            error,
          );
          await rollback();
          return;
        }
      },
    );
  },

  // async afterUpdate(event) {
  //   const { result, params } = event;

  //   console.warn("afterUpdate event triggered for event content type");
  //   console.warn("Result:", result);
  //   console.warn("Params:", params.data?.template);

  //   const eventPopulated = await strapi.documents("api::event.event").findOne({
  //     documentId: result.documentId,
  //     populate: ["template"],
  //   });

  //   const template = await strapi
  //     .documents("api::checklist-template.checklist-template")
  //     .findOne({
  //       documentId: eventPopulated.template.documentId,
  //       populate: ["sections.items"],
  //     });

  //   if (!template) {
  //     console.warn(
  //       `Checklist template with ID ${eventPopulated.template.documentId} not found. Skipping checklist item update.`,
  //     );
  //     return;
  //   }

  //   console.log(
  //     `Found checklist template: ${template.title} with ${template.sections.length} sections.`,
  //   );

  //   await strapi.db.transaction(
  //     async ({ trx, rollback, commit, onCommit, onRollback }) => {
  //       try {
  //         // Eliminar checklist items antiguos
  //         await strapi
  //           .documents("api::event-checklist-item.event-checklist-item")
  //           .deleteMany({
  //             where: { event: result.documentId },
  //           });

  //         // Crear nuevos checklist items del evento
  //         for (const section of template.sections || []) {
  //           for (const item of section.items || []) {
  //             await strapi
  //               .documents("api::event-checklist-item.event-checklist-item")
  //               .create({
  //                 data: {
  //                   title: item.title,
  //                   description: item.description,

  //                   // Snapshot
  //                   category: section.title,
  //                   order: item.order,

  //                   checked: false,

  //                   // Relaciones
  //                   event: result.documentId,
  //                   templateItem: item.documentId,

  //                   publishedAt: new Date().toISOString(),
  //                 },
  //               });
  //           }
  //         }

  //         await commit();
  //       } catch (error) {
  //         console.error(
  //           "Error in afterUpdate lifecycle for event content type:",
  //           error,
  //         );
  //         await rollback();
  //         return;
  //       }
  //     },
  //   );
  // },
};
