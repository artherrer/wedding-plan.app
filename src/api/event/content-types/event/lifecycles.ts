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
              await strapi
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
                  },
                  status: "published",
                });

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

  async afterUpdate(event) {
    const { result, params } = event;

    console.warn("afterUpdate event triggered for event content type");

    console.warn(
      "params.data?.template?.connect",
      params.data?.template?.connect,
    );

    console.warn(
      "params.data?.template?.disconnect",
      params.data?.template?.disconnect,
    );

    const connectIds =
      params.data?.template?.connect?.map((item) => item.id) || [];

    const disconnectIds =
      params.data?.template?.disconnect?.map((item) => item.id) || [];

    // Comparación exacta
    const sameIds =
      connectIds.length === disconnectIds.length &&
      connectIds.every((id) => disconnectIds.includes(id));

    console.warn("Same IDs:", sameIds);

    const hasTemplateChanged = !sameIds;

    console.warn("Template changed:", hasTemplateChanged);

    // Si no tiene template o no cambió, no hacemos nada
    if (!result.template || !hasTemplateChanged) {
      console.warn("No template change detected. Skipping checklist update.");
      return;
    }

    // Obtener el evento con el template poblado
    const eventPopulated = await strapi.documents("api::event.event").findOne({
      documentId: result.documentId,
      populate: ["template"],
    });

    if (!eventPopulated.template) {
      console.warn(`Event ${result.documentId} has no template assigned.`);
      return;
    }

    // Obtener el nuevo template con todas sus secciones e items
    const template = await strapi
      .documents("api::checklist-template.checklist-template")
      .findOne({
        documentId: eventPopulated.template.documentId,
        populate: ["sections", "sections.items"],
      });

    if (!template) {
      console.warn(
        `Checklist template with ID ${eventPopulated.template.documentId} not found. Skipping checklist item update.`,
      );
      return;
    }

    console.log(
      `Found checklist template: ${template.title} with ${template.sections?.length || 0} sections.`,
    );

    try {
      // Opción 1: Reemplazar completamente los items (si quieres sincronización total)
      console.log("Deleting old checklist items...");

      // Buscar y eliminar todos los items antiguos del evento
      const existingItems = await strapi
        .documents("api::event-checklist-item.event-checklist-item")
        .findMany({
          filters: {
            event: {
              documentId: {
                $eq: result.documentId,
              },
            },
          },
          limit: 9999, // Ajusta según necesidad
        });

      // Eliminar cada item individualmente (Strapi v5 no tiene deleteMany con filtros complejos)
      for (const item of existingItems || []) {
        await strapi
          .documents("api::event-checklist-item.event-checklist-item")
          .delete({
            documentId: item.documentId,
          });
        console.log(`  Deleted item: ${item.title}`);
      }

      console.log(`Deleted ${existingItems.length || 0} old items`);

      // Crear nuevos checklist items basados en el nuevo template
      let counter = 0;

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

                checked: false, // Resetear el estado checked

                // Relaciones
                event: result.documentId,
                templateItem: item.documentId,
              },
              status: "published",
            });

          await strapi
            .documents("api::event-checklist-item.event-checklist-item")
            .publish(newItem);

          counter++;
          console.log(`  Created item: ${item.title}`);
        }
      }

      console.log(
        `✅ Updated ${counter} checklist items for event: ${result.documentId}`,
      );
    } catch (error) {
      console.error(
        "Error in afterUpdate lifecycle for event content type:",
        error,
      );
      throw error; // Re-lanzar el error para que Strapi lo maneje
    }
  },
};
