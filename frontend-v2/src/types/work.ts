export interface Work {
  id: number;
  documentId: string;
  Title: string;
  Media: Array<
    | { __component: 'media.video-item'; cover: { url: string }; video: { url: string } }
    | { __component: 'media.image-item'; image: { url: string } }
  >;
  Spend: number;
  ROI_7D: number;
  CTR: number;
  IsFeatured: boolean;
  Rank: number; // 用于权重干预排序
  LaunchDate?: string; // 投放日期 (YYYY-MM-DD)
  Story?: string; // 创意来源/故事 (Markdown 或富文本)
}
