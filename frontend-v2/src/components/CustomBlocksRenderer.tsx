"use client";

import { BlocksRenderer } from '@strapi/blocks-react-renderer';

export default function CustomBlocksRenderer({ content }: { content: any }) {
  return (
    <BlocksRenderer 
      content={content} 
      blocks={{
        heading: ({ children, level }: any) => {
          const text = children[0]?.props?.text || "";
          const id = text ? `heading-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}` : undefined;
          const Tag = `h${level}` as any;
          return <Tag id={id}>{children}</Tag>;
        }
      }}
    />
  );
}
