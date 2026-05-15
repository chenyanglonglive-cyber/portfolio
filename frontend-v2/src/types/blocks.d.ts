declare module '@strapi/blocks-react-renderer' {
  import type { FC, ReactNode } from 'react';

  interface BlocksContent {
    type: string;
    children: BlocksContent[];
    [key: string]: unknown;
  }

  interface BlocksRendererProps {
    content: BlocksContent[];
    [key: string]: unknown;
  }

  export const BlocksRenderer: FC<BlocksRendererProps>;
}
