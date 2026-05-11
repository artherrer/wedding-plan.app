"use strict";

const { createStrapi } = require("@strapi/strapi");
const { join } = require("path");

const TEMPLATE_UID = "api::checklist-template.checklist-template";
const SECTION_UID = "api::checklist-section.checklist-section";
const ITEM_UID = "api::checklist-template-item.checklist-template-item";

async function bootstrap() {
  console.warn(
    "⚠️ WARNING: This script will seed the database with a default baptism checklist template for Mexico. It is idempotent and will not create duplicates, but it is recommended to run it only once."
  );

  // Inicializar Strapi sin servidor HTTP
  const strapi = createStrapi({
    distDir: join(process.cwd(), "dist"),
    serveAdminPanel: false,
    autoReload: false,
  });

  await strapi.load();

  console.log("🌱 Starting baptism checklist seed...");

  // =====================================================
  // Evitar duplicados
  // =====================================================

  try {
    const existingTemplates = await strapi.db.query(TEMPLATE_UID).findMany({
      where: {
        slug: "baptism-mexico-template",
      },
      limit: 1,
    });

    if (existingTemplates && existingTemplates.length > 0) {
      console.log("✅ Baptism template already exists");
      await strapi.destroy();
      process.exit(0);
    }
  } catch (error) {
    console.log("No existing template found, continuing...");
  }

  // =====================================================
  // Crear template
  // =====================================================

  const template = await strapi.db.query(TEMPLATE_UID).create({
    data: {
      title: "Baptism Checklist Mexico",
      slug: "baptism-mexico-template",
      description: "Checklist completo para organización de bautizos en México",
      type: "baptism",
      isDefault: false,
      publishedAt: new Date(),
    },
  });

  console.log("✅ Template created:", template.id);

  // =====================================================
  // Datos para Bautizo en México
  // =====================================================

  const sections = [
    {
      title: "Requisitos Previos (3-4 Meses Antes)",
      order: 1,
      items: [
        "Elegir la parroquia donde se realizará el bautizo",
        "Solicitar información sobre requisitos en la parroquia",
        "Presentar acta de nacimiento del bebé/niño",
        "Presentar acta de matrimonio de los padres (si aplica)",
        "Presentar comprobante de domicilio",
        "Presentar identificaciones oficiales de los padres",
        "Presentar identificaciones oficiales de los padrinos",
        "Solicitar carta de bautismo de los padrinos",
        "Solicitar carta de bautismo de los padres (si aplica)",
        "Solicinar carta de confirmación de padrinos",
        "Presentar constancia de pláticas prebautismales",
        "Pagar cuota del bautizo (generalmente $500-$2000 MXN)",
        "Confirmar fecha disponible con la parroquia",
        "Elegir horario para la ceremonia",
      ],
    },
    {
      title: "Padrinos",
      order: 2,
      items: [
        "Seleccionar padrino de bautizo (mínimo 1, máximo 2)",
        "Confirmar disponibilidad de padrinos en la fecha",
        "Verificar que padrinos cumplan requisitos religiosos",
        "Asegurar que padrinos no vivan en unión libre",
        "Confirmar que padrinos hayan tomado sus sacramentos",
        "Conversar con padrinos sobre su responsabilidad espiritual",
        "Coordinar fecha para comprar vestimenta con padrinos",
        "Definir quién pagará la veladora bautismal",
        "Definir quién pagará la medalla o escapulario",
        "Definir quién pagará el cirio pascual",
        "Definir quién pagará el vestido o traje de bautizo",
        "Definir quién pagará la comida o recepción",
      ],
    },
    {
      title: "Vestimenta del Bautizado",
      order: 3,
      items: [
        "Elegir vestido de bautizo (niña) o traje (niño)",
        "Probar vestimenta al niño/niña",
        "Comprar zapatos/zapatillas blancas",
        "Comprar calcetines o medias blancas",
        "Comprar gorro o tocado blanco",
        "Comprar capa o saco (tradicional mexicano)",
        "Comprar calzón o pañal especial de bautizo",
        "Comprar calcetines para el frío (invierno)",
        "Planchar y almidonar la vestimenta",
        "Preparar muda de repuesto",
        "Comprar cobija o manta para después del agua",
      ],
    },
    {
      title: "Accesorios Religiosos",
      order: 4,
      items: [
        "Comprar veladora bautismal",
        "Comprar cirio pascual",
        "Comprar medalla de la Virgen de Guadalupe",
        "Comprar escapulario",
        "Comprar rosario para el/la ahijado/a",
        "Comprar biblioteca o libro de oraciones",
        "Comprar imagen religiosa (ángel de la guarda)",
        "Comprar certificado o diploma conmemorativo",
        "Comprar recordatorios para invitados",
      ],
    },
    {
      title: "Ceremonia Religiosa",
      order: 5,
      items: [
        "Confirmar horario de llegada a la parroquia (30 min antes)",
        "Coordinar ensayo breve con el sacerdote",
        "Preparar lecturas bíblicas (1 del Antiguo Testamento, 1 del Nuevo)",
        "Preparar oración de los fieles",
        "Elegir cantos para la ceremonia",
        "Confirmar quién llevará la vela",
        "Confirmar quién llevará el cirio pascual",
        "Confirmar quién llevará la medalla/escapulario",
        "Confirmar quién llevará la toalla",
        "Coordinar con el sacristán para el agua bendita",
        "Preparar ofrenda para la iglesia (pan, vino, velas)",
        "Coordinar las fotos durante la ceremonia",
        "Preparar sobre para la limosna del sacerdote",
      ],
    },
    {
      title: "Invitados",
      order: 6,
      items: [
        "Definir lista de invitados (generalmente 30-80 personas)",
        "Crear lista de familiares cercanos",
        "Incluir abuelos, tíos y primos",
        "Incluir bisabuelos (si aplica)",
        "Incluir hermanos del bautizado",
        "Incluir tíos abuelos cercanos",
        "Diseñar invitaciones formales",
        "Enviar invitaciones con 3-4 semanas de anticipación",
        "Confirmar asistencias vía WhatsApp o teléfono",
        "Definir número final de invitados (1 semana antes)",
        "Preparar recordatorios o estampitas religiosas",
      ],
    },
    {
      title: "Recepción o Comida",
      order: 7,
      items: [
        "Elegir lugar para la recepción (casa, salón, jardín)",
        "Definir tipo de evento (comida formal, buffet o convivio)",
        "Contratar servicio de alimentos",
        "Definir menú para adultos",
        "Definir menú para niños",
        "Considerar personas con alergias",
        "Cotizar pastel de bautizo",
        "Elegir diseño del pastel",
        "Hacer degustación del pastel",
        "Comprar botanas y aperitivos",
        "Comprar refrescos y aguas frescas",
        "Comprar café y té",
        "Comprar hielo y hieleras",
        "Comprar platos, vasos y cubiertos desechables",
        "Comprar manteles y servilletas",
        "Comprar bolsitas de dulces para niños",
        "Preparar memorias o centros de mesa sencillos",
        "Coordinar música (amplificador o bocina)",
        "Preparar lista de canciones",
        "Contratar animador o payaso (opcional)",
        "Comprar piñata (tradición mexicana)",
        "Comprar dulces para piñata",
      ],
    },
    {
      title: "Detalles Especiales Mexicanos",
      order: 8,
      items: [
        "Comprar arroz, confeti o pétalos para tirar al salir",
        "Comprar pulseritas o manitas de recuerdo",
        "Comprar abanicos personalizados (clima caluroso)",
        "Comprar toquillas o rebozos para las niñas",
        "Comprar botines vaqueros (tradición norteña)",
        "Comprar sarapes para foto familiar",
        "Preparar botellas de tequila o mezcal para brindis",
        "Hacer bolsitas de dulces típicos (glorias, mazapán)",
        "Preparar café de olla para la recepción",
        "Comprar aguas frescas de sabor tradicional",
        "Comprar pan dulce para la tarde",
        "Contratar mariachi para la recepción (3-5 canciones)",
        "Preparar tequila para los adultos",
      ],
    },
    {
      title: "Fotografía y Video",
      order: 9,
      items: [
        "Contratar fotógrafo profesional (opcional)",
        "Definir paquete de fotos (horas, impresiones)",
        "Crear lista de fotos importantes",
        "Fotos con padrinos",
        "Fotos con abuelos",
        "Fotos con bisabuelos",
        "Fotos familia completa",
        "Fotos individuales del bautizado con vestimenta",
        "Fotos en la pila bautismal",
        "Fotos con el sacerdote",
        "Fotos en la recepción",
        "Fotos cortando pastel",
        "Contratar videógrafo (opcional)",
        "Preparar disco o USB con fotos digitales",
      ],
    },
    {
      title: "Regalos y Sobres",
      order: 10,
      items: [
        "Comprar regalo para padrinos",
        "Comprar regalo para el sacerdote",
        "Comprar regalo para los abuelos",
        "Comprar recordatorios o estampitas",
        "Preparar sobres para músicos y personal",
        "Definir quien recibe los regalos en efectivo",
        "Preparar libreta para registrar regalos",
        "Comprar bolsas para guardar sobres",
      ],
    },
    {
      title: "Logística 1 Semana Antes",
      order: 11,
      items: [
        "Confirmar asistencia final con todos los invitados",
        "Confirmar con el sacerdote la ceremonia",
        "Confirmar horarios con la parroquia",
        "Confirmar servicio de comida",
        "Confirmar pastel",
        "Confirmar fotógrafo",
        "Confirmar músicos (si aplica)",
        "Hacer última prueba de vestimenta al niño/niña",
        "Lavar y planchar vestimenta",
        "Confirmar padrinos tienen todos los documentos",
        "Preparar documentos en una carpeta",
        "Comprar todos los accesorios pendientes",
        "Ensayo de lecturas con familiares",
        "Preparar kit de emergencia (pañales, toallas húmedas)",
        "Tener efectivo para pagos de última hora",
      ],
    },
    {
      title: "Día del Bautizo",
      order: 12,
      items: [
        "Despertar temprano (si es misa de 10-11 AM)",
        "Bañar al niño/niña con anticipación",
        "Vestir al bautizado",
        "Desayunar ligero todos",
        "Revisar que todos tengan documentos",
        "Revisar que todos tengan accesorios religiosos",
        "Salir con tiempo a la parroquia (llegar 30 min antes)",
        "Tener pañales extras en el auto",
        "Tener muda de repuesto",
        "Tener cobija para después del agua",
        "Dar biberón antes de la ceremonia (si es bebé)",
        "Confirmar asientos reservados para familia",
        "Designar quién grabará el bautizo",
        "Entregar lecturas a los lectores asignados",
        "Participar activamente en la ceremonia",
        "Evitar que el niño/niña se duerma durante el ritual",
        "Secar y abrigar bien después del agua",
        "Tomar fotos familiares después de la misa",
        "Entregar regalos a padrinos, sacerdote y abuelos",
        "Entregar recordatorios a invitados",
        "Pagar pendientes en la parroquia",
        "Trasladarse a la recepción",
        "Disfrutar la comida con familiares",
        "Cortar el pastel ceremonialmente",
        "Agradecer a todos los asistentes",
        "Revisar que no se olviden regalos",
        "Hacer entrega de sobres y regalos a los padrinos",
        "Despedir a invitados",
      ],
    },
    {
      title: "Después del Bautizo",
      order: 13,
      items: [
        "Recoger acta o certificado de bautizo (2-3 días después)",
        "Revisar que todos los datos estén correctos",
        "Enmarcar el certificado",
        "Guardar veladora y cirio como recuerdo",
        "Hacer copias digitales del certificado",
        "Registrar el bautizo en la agenda familiar",
        "Enviar fotos a familiares que no pudieron asistir",
        "Escribir agradecimientos a padrinos",
        "Escribir agradecimiento al sacerdote",
        "Publicar fotos en redes sociales (si gustan)",
        "Archivar documentos importantes",
        "Celebrar el primer mes del bautizo (opcional)",
        "Preparar álbum de fotos físico o digital",
      ],
    },
    {
      title: "Presupuesto Estimado (MXN)",
      order: 14,
      items: [
        "✅ Cuota iglesia: $500 - $2,000",
        "✅ Donación sacerdote $500 - $1,000",
        "✅ Vestimenta bautizo: $500 - $2,500",
        "✅ Accesorios religiosos: $300 - $800",
        "✅ Recordatorios e invitaciones: $200 - $600",
        "✅ Recepción/comida (por persona): $200 - $500",
        "✅ Pastel: $500 - $1,500",
        "✅ Botanas y bebidas: $800 - $2,000",
        "✅ Fotógrafo (opcional): $1,500 - $5,000",
        "✅ Mariachi (opcional): $2,000 - $5,000 (3-5 canciones)",
        "✅ Piñata y dulces: $300 - $800",
        "✅ Regalos para padrinos: $500 - $1,500",
        "✅ Regalos para sacerdote: $300 - $600",
        "✅ Recuerdos para invitados: $200 - $500",
        "💡 TOTAL ESTIMADO: $8,000 - $25,000 MXN",
      ],
    },
  ];

  // =====================================================
  // Crear secciones + items
  // =====================================================

  for (const sectionData of sections) {
    const section = await strapi.db.query(SECTION_UID).create({
      data: {
        title: sectionData.title,
        order: sectionData.order,
        template: template.id,
        publishedAt: new Date(),
      },
    });

    console.log(`📂 Section created: ${section.title}`);

    let itemOrder = 1;

    for (const title of sectionData.items) {
      await strapi.db.query(ITEM_UID).create({
        data: {
          title,
          order: itemOrder++,
          required: false,
          section: section.id,
          publishedAt: new Date(),
        },
      });

      console.log(`   ✅ ${title.substring(0, 60)}${title.length > 60 ? "..." : ""}`);
    }
  }

  console.log("🎉 Baptism checklist seed completed");
  console.log("📌 Template created for: Bautizos en México");

  await strapi.destroy();
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error("❌ Error during bootstrap:", error);
  process.exit(1);
});