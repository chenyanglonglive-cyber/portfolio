export interface Article {
  id: number;
  documentId: string;
  Title: string;
  Content: any;
  Slug: string;
  Category?: string;
  publishedAt: string;
}
