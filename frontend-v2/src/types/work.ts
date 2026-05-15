export interface Work {
  id: number;
  documentId: string;
  Title: string;
  Type?: 'video' | 'image';
  Video?: { url: string };
  Image?: { url: string };
  Media: Array<
    | { __component: 'media.video-item'; cover: { url: string }; video: { url: string } }
    | { __component: 'media.image-item'; image: { url: string } }
  >;
  Spend: number;
  ROI_7D: number;
  CTR: number;
  IsFeatured: boolean;
  Rank: number;
  LaunchDate?: string;
  Story?: string;
}
