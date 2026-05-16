export interface About {
  id: number;
  documentId: string;
  title: string;
  content: any; // Strapi blocks (rich text)
  publishedAt: string;
}
