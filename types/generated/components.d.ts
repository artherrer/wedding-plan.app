import type { Schema, Struct } from '@strapi/strapi';

export interface EventGiftRegistry extends Struct.ComponentSchema {
  collectionName: 'components_event_gift_registries';
  info: {
    displayName: 'Gift Registry';
  };
  attributes: {
    name: Schema.Attribute.String;
    reference_number: Schema.Attribute.String;
    url: Schema.Attribute.String;
  };
}

export interface EventLocation extends Struct.ComponentSchema {
  collectionName: 'components_event_locations';
  info: {
    displayName: 'Location';
  };
  attributes: {
    city: Schema.Attribute.String;
    map_url: Schema.Attribute.String;
    name: Schema.Attribute.String;
    time: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface EventScheduleItem extends Struct.ComponentSchema {
  collectionName: 'components_event_schedule_items';
  info: {
    displayName: 'Schedule Item';
  };
  attributes: {
    description: Schema.Attribute.String;
    time: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'event.gift-registry': EventGiftRegistry;
      'event.location': EventLocation;
      'event.schedule-item': EventScheduleItem;
    }
  }
}
