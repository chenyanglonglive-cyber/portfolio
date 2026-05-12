export interface Work {
  id: number;
  documentId: string;
  Title: string;
  Type: 'video' | 'image';
  Cover: {
    url: string;
  };
  VideoURL?: string;
  Spend: number;
  ROI_7D: number;
  CTR: number;
  Description?: string;
  IsFeatured: boolean;
  Rank: number; // 用于权重干预排序
  LaunchDate?: string; // 投放时间，如 "2024.10"
  Story?: string; // 创意来源/故事 (Markdown 或富文本)
}
