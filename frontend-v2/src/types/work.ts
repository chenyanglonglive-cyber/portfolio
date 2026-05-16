/**
 * 新模型：Video 和 Image 独立集合
 * 旧的 Dynamic Zone (WorkMediaVideo / WorkMediaImage) 已废弃
 */

export interface VideoWork {
  id: number;
  documentId: string;
  Title: string;
  video?: { url: string };
  cover?: { url: string };
  Story?: string;
  IsFeatured: boolean;
  Spend: number;
  ROI_7D: number;
  CTR: number;
  Rank: number;
  LaunchDate?: string;
}

export interface ImageWork {
  id: number;
  documentId: string;
  Title: string;
  image?: { url: string };
  Story?: string;
  IsFeatured: boolean;
  Spend: number;
  ROI_7D: number;
  CTR: number;
  Rank: number;
  LaunchDate?: string;
}

/** 统一类型，前端组件可以用这个来处理所有作品 */
export type Work = VideoWork | ImageWork;

export function getWorkType(work: Work): 'video' | 'image' | null {
  if ('video' in work && work.video) return 'video';
  if ('image' in work && work.image) return 'image';
  return null;
}

export function getWorkVideoUrl(work: Work): string | undefined {
  if ('video' in work) return work.video?.url;
  return undefined;
}

export function getWorkCoverUrl(work: Work): string | undefined {
  if ('video' in work) return work.cover?.url;
  if ('image' in work) return work.image?.url;
  return undefined;
}

/** 将 Strapi API 返回的原始数据标准化 */
export function normalizeWork(work: any): Work {
  return {
    ...work,
    Spend: Number(work.Spend) || 0,
    ROI_7D: Number(work.ROI_7D) || 0,
    CTR: Number(work.CTR) || 0,
    Rank: Number(work.Rank) || 0,
  };
}
