export interface Article {
  id: number;
  documentId: string;
  Title: string;
  Content: string;
  Slug: string;
  Category?: string;
  publishedAt: string;
}
