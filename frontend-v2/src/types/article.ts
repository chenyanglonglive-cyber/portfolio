export interface Article {
  id: number;
  documentId: string;
  Title: string;
  Content: any;
  Slug: string;
  Category?: string;
  IsFeatured?: boolean;
  CoverImage?: {
    url: string;
    alternativeText?: string;
  };
  publishedAt: string;
}
