"use strict";

const { createStrapi } = require("@strapi/strapi");
const { join } = require("path");

const TEMPLATE_UID = "api::checklist-template.checklist-template";
const SECTION_UID = "api::checklist-section.checklist-section";
const ITEM_UID = "api::checklist-template-item.checklist-template-item";

const TEMPLATE_SLUG = "wedding-template";

async function bootstrap() {
  console.warn(
    "⚠️ WARNING: This script will seed the database with a default wedding checklist template. It is idempotent and will not create duplicates, but it is recommended to run it only once.",
  );

  // Inicializar Strapi sin servidor HTTP
  const strapi = createStrapi({
    distDir: join(process.cwd(), "dist"),
    serveAdminPanel: false,
    autoReload: false,
  });

  await strapi.load();

  console.log("🌱 Starting checklist seed...");

  // =====================================================
  // Evitar duplicados
  // =====================================================

  try {
    const existingTemplates = await strapi.documents(TEMPLATE_UID).findMany({
      filters: { slug: { $eq: TEMPLATE_SLUG } },
    });

    if (existingTemplates && existingTemplates.length > 0) {
      console.log("✅ Template already exists");
      await strapi.destroy();
      process.exit(0);
    }
  } catch (error) {
    console.log("No existing template found, continuing...");
  }

  // =====================================================
  // Crear template
  // =====================================================

  const template = await strapi.documents(TEMPLATE_UID).create({
    data: {
      title: "Wedding Master Template",
      slug: TEMPLATE_SLUG,
      description: "Checklist completo para organización de bodas",
      type: "wedding",
      isDefault: true,
    },
    status: "published",
  });

  console.log("✅ Template created:", template.id);

  // =====================================================
  // Datos
  // =====================================================

  const sections = [
    {
      title: "12–18 Meses Antes",
      order: 1,
      items: [
        "Definir presupuesto total",
        "Decidir quién pagará qué",
        "Hacer lista preliminar de invitados",
        "Definir tipo de boda",
        "Elegir fecha tentativa",
        "Definir ciudad y temporada",
        "Crear carpeta compartida / Drive / Notion / Excel",
        "Definir estilo de boda",
        "Definir paleta de colores",
      ],
    },
    {
      title: "Reservas Principales",
      order: 2,
      items: [
        "Visitar salones/jardines/haciendas",
        "Comparar costos y horarios",
        "Revisar qué incluye el lugar",
        "Firmar contrato",
        "Pagar anticipo",
        "Apartar fecha en la iglesia",
        "Confirmar horarios disponibles",
        "Preguntar requisitos religiosos",
        "Preguntar restricciones de iglesia",
        "Agendar pláticas prematrimoniales",
        "Buscar padrinos requeridos",
        "Revisar requisitos legales",
        "Definir ceremonia civil",
        "Solicitar documentos oficiales",
        "Agendar ceremonia civil",
        "Confirmar costo y pagos del civil",
      ],
    },
    {
      title: "Proveedores Principales",
      order: 3,
      items: [
        "Cotizar menú",
        "Hacer degustación",
        "Definir entradas",
        "Definir plato fuerte",
        "Definir postre",
        "Definir menú vegetariano",
        "Definir menú infantil",
        "Confirmar número mínimo de invitados",
        "Revisar tiempos de servicio",
        "Revisar portafolios de fotografía",
        "Confirmar cobertura de foto y video",
        "Definir número de fotógrafos",
        "Definir entrega de fotografías",
        "Contratar DJ o grupo",
        "Revisar audio e iluminación",
        "Definir música de la boda",
        "Crear playlist must play",
        "Crear playlist do not play",
        "Definir estilo floral",
        "Elegir centros de mesa",
        "Elegir arco/altar",
        "Definir iluminación",
        "Revisar decoración de ceremonia y recepción",
        "Degustación de pastel",
        "Elegir diseño del pastel",
        "Elegir sabores del pastel",
        "Confirmar tamaño del pastel",
        "Definir alcohol y mixología",
        "Calcular consumo aproximado",
        "Confirmar hielos",
        "Confirmar refrescos y agua",
        "Comprar vino para brindis",
      ],
    },
    {
      title: "Invitados",
      order: 4,
      items: [
        "Crear lista definitiva",
        "Separar invitados por grupos",
        "Pedir direcciones y teléfonos",
        "Definir adultos y niños",
        "Diseñar invitaciones",
        "Revisar ortografía de invitaciones",
        "Mandar imprimir invitaciones",
        "Enviar save the date",
        "Enviar invitaciones formales",
        "Confirmar asistencia RSVP",
        "Dar seguimiento a invitados pendientes",
        "Definir número de mesas",
        "Asignar lugares",
        "Preparar seating chart",
        "Imprimir números de mesa",
      ],
    },
    {
      title: "Novia",
      order: 5,
      items: [
        "Buscar vestido",
        "Hacer pruebas y ajustes de vestido",
        "Comprar velo",
        "Comprar zapatos",
        "Comprar joyería",
        "Comprar lencería",
        "Comprar bata getting ready",
        "Elegir ramo",
        "Elegir ramo para aventar",
        "Elegir maquillaje",
        "Elegir peinado",
        "Hacer prueba de maquillaje",
        "Hacer prueba de peinado",
        "Agendar facial y tratamientos",
        "Manicure y pedicure",
        "Depilación",
        "Preparar kit de emergencia",
      ],
    },
    {
      title: "Novio",
      order: 6,
      items: [
        "Elegir traje o smoking",
        "Hacer ajustes y pruebas del traje",
        "Comprar zapatos",
        "Comprar corbata o moño",
        "Comprar mancuernillas",
        "Comprar cinturón",
        "Comprar calcetines",
        "Confirmar boutonniere",
        "Corte de cabello",
        "Agendar barbería",
        "Rasurado o arreglo de barba",
        "Preparar kit personal del día",
      ],
    },
    {
      title: "Cortejo y Familia",
      order: 7,
      items: [
        "Elegir damas",
        "Elegir padrinos",
        "Definir roles",
        "Coordinar outfits",
        "Organizar regalos para cortejo",
        "Confirmar participación especial de familia",
        "Revisar protocolo de entradas",
        "Organizar fotos familiares",
      ],
    },
    {
      title: "Detalles de la Ceremonia",
      order: 8,
      items: [
        "Elegir lecturas religiosas",
        "Elegir música religiosa",
        "Confirmar orden de entrada",
        "Confirmar padrinos de ceremonia",
        "Comprar arras",
        "Comprar lazo",
        "Comprar cojines",
        "Preparar kit de ceremonia",
        "Revisar testigos",
        "Confirmar documentos originales",
        "Preparar plumas y documentos",
        "Definir mesa de ceremonia",
      ],
    },
    {
      title: "Recepción",
      order: 9,
      items: [
        "Definir timeline completo",
        "Confirmar duración del evento",
        "Organizar cocktail hour",
        "Organizar cena",
        "Organizar brindis",
        "Organizar vals",
        "Organizar baile",
        "Confirmar maestro de ceremonias",
        "Contratar photobooth",
        "Contratar letras gigantes",
        "Contratar fuegos artificiales fríos",
        "Audio para ceremonia",
        "Pantallas o proyector",
        "Comprar recuerdos",
        "Comprar sandalias o pashminas",
      ],
    },
    {
      title: "Papelería",
      order: 10,
      items: [
        "Diseñar menús",
        "Diseñar seating chart",
        "Diseñar números de mesa",
        "Diseñar programa de ceremonia",
        "Diseñar etiquetas de recuerdos",
        "Diseñar letreros de bienvenida",
        "Diseñar señalización",
      ],
    },
    {
      title: "Hospedaje y Transporte",
      order: 11,
      items: [
        "Reservar hotel para novios",
        "Negociar tarifas para invitados",
        "Organizar transporte de novios",
        "Organizar transporte de familia",
        "Organizar transporte de invitados",
        "Definir estacionamiento o valet parking",
      ],
    },
    {
      title: "Luna de Miel",
      order: 12,
      items: [
        "Elegir destino",
        "Revisar pasaportes y visas",
        "Comprar vuelos",
        "Reservar hospedaje",
        "Comprar seguro de viaje",
        "Planear actividades",
        "Preparar presupuesto",
      ],
    },
    {
      title: "1 Mes Antes",
      order: 13,
      items: [
        "Confirmar proveedores",
        "Confirmar horarios",
        "Confirmar pagos pendientes",
        "Confirmar número final de invitados",
        "Confirmar timeline final",
        "Hacer ensayo de ceremonia",
        "Preparar sobres de propinas y pagos",
        "Preparar kit de emergencia",
      ],
    },
    {
      title: "Semana de la Boda",
      order: 14,
      items: [
        "Dormir bien",
        "Entregar itinerarios",
        "Confirmar clima",
        "Recoger vestido y traje",
        "Preparar maletas",
        "Confirmar transporte",
        "Preparar documentos",
        "Tener efectivo disponible",
        "Delegar responsabilidades",
        "Comer e hidratarse",
      ],
    },
    {
      title: "Día de la Boda",
      order: 15,
      items: [
        "Desayunar",
        "Tener agua y snacks",
        "Llegar temprano",
        "Entregar propinas y pagos",
        "Tener anillos",
        "Tener votos",
        "Disfrutar el evento",
        "Tomarse tiempo juntos",
        "Tomar fotos importantes",
        "Saludar invitados principales",
        "Guardar regalos y sobres",
        "Revisar pertenencias",
        "Confirmar transporte final",
      ],
    },
    {
      title: "Después de la Boda",
      order: 16,
      items: [
        "Mandar fotos teaser",
        "Enviar agradecimientos",
        "Liquidar pendientes",
        "Revisar fotos y video final",
        "Cambiar documentos oficiales",
        "Guardar vestido y traje",
        "Hacer álbum",
      ],
    },
    {
      title: "Extras MUY recomendables",
      order: 17,
      items: [
        "Tener coordinador el día del evento",
        "Tener plan B para lluvia",
        "Hacer cronograma minuto a minuto",
        "Designar responsable para dudas de invitados",
        "Crear grupo WhatsApp de proveedores",
        "Llevar tenis para bailar",
        "Comer durante el evento",
        "Separar tiempo para fotos privadas",
      ],
    },
  ];

  // =====================================================
  // Crear secciones + items
  // =====================================================

  for (const sectionData of sections) {
    const section = await strapi.documents(SECTION_UID).create({
      data: {
        title: sectionData.title,
        order: sectionData.order,
        template: template.documentId,
      },
      status: "published",
    });

    console.log(`📂 Section created: ${section.title}`);

    let itemOrder = 1;

    for (const title of sectionData.items) {
      await strapi.documents(ITEM_UID).create({
        data: {
          title,
          order: itemOrder++,
          required: false,
          section: section.documentId,
          publishedAt: new Date(),
        },
        status: "published",
      });

      console.log(`   ✅ ${title}`);
    }
  }

  console.log("🎉 Checklist seed completed");

  await strapi.destroy();
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error("❌ Error during bootstrap:", error);
  process.exit(1);
});
