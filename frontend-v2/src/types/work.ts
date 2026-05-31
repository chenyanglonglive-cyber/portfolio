/**
 * 新模型：Video 和 Image 独立集合
 * 旧的 Dynamic Zone (WorkMediaVideo / WorkMediaImage) 已废弃
 */

export interface Project {
  id: number;
  documentId: string;
  Name: string;
  Rank: number;
}

export interface Tag {
  id: number;
  documentId: string;
  Name: string;
}

export interface StrapiMedia {
  url: string;
  alternativeText?: string | null;
  name?: string;
  size?: number;
}

export interface VideoWork {
  id: number;
  documentId: string;
  Title: string;
  video?: StrapiMedia;
  cover?: StrapiMedia;
  Story?: string;
  IsFeatured: boolean;
  Spend: number | null;
  ROI_7D: number | null;
  CTR: number | null;
  Rank: number;
  LaunchDate?: string;
  tags?: Tag[];
  project?: Project | null;
}

export interface ImageWork {
  id: number;
  documentId: string;
  Title: string;
  image?: StrapiMedia;
  Story?: string;
  IsFeatured: boolean;
  Spend: number | null;
  ROI_7D: number | null;
  CTR: number | null;
  Rank: number;
  LaunchDate?: string;
  tags?: Tag[];
  project?: Project | null;
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
    Spend: work.Spend !== null && work.Spend !== undefined && work.Spend !== "" ? Number(work.Spend) : null,
    ROI_7D: work.ROI_7D !== null && work.ROI_7D !== undefined && work.ROI_7D !== "" ? Number(work.ROI_7D) : null,
    CTR: work.CTR !== null && work.CTR !== undefined && work.CTR !== "" ? Number(work.CTR) : null,
    Rank: Number(work.Rank) || 0,
    project: work.project ? {
      id: work.project.id,
      documentId: work.project.documentId,
      Name: work.project.Name,
      Rank: Number(work.project.Rank) || 0
    } : null
  };
}

