import type { Schema, Struct } from '@strapi/strapi';

export interface MediaImageItem extends Struct.ComponentSchema {
  collectionName: 'components_media_image_items';
  info: {
    description: '';
    displayName: 'ImageItem';
    icon: 'picture';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
  };
}

export interface MediaVideoItem extends Struct.ComponentSchema {
  collectionName: 'components_media_video_items';
  info: {
    description: '';
    displayName: 'VideoItem';
    icon: 'play';
  };
  attributes: {
    cover: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    video: Schema.Attribute.Media<'videos'> & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'media.image-item': MediaImageItem;
      'media.video-item': MediaVideoItem;
    }
  }
}
