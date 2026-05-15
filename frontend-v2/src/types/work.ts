export interface WorkMediaVideo {
  __component: 'media.video-item';
  id: number;
  cover?: { url: string };
  video?: { url: string };
}

export interface WorkMediaImage {
  __component: 'media.image-item';
  id: number;
  image?: { url: string };
}

export type WorkMediaItem = WorkMediaVideo | WorkMediaImage;

export function getWorkType(work: Work): 'video' | 'image' | null {
  const comp = work.Media?.[0]?.__component;
  if (comp === 'media.video-item') return 'video';
  if (comp === 'media.image-item') return 'image';
  return null;
}

export function getWorkVideoUrl(work: Work): string | undefined {
  const item = work.Media?.[0];
  if (item?.__component === 'media.video-item') return item.video?.url;
  return undefined;
}

export function getWorkCoverUrl(work: Work): string | undefined {
  const item = work.Media?.[0];
  if (item?.__component === 'media.video-item') return item.cover?.url;
  if (item?.__component === 'media.image-item') return item.image?.url;
  return undefined;
}

export interface Work {
  id: number;
  documentId: string;
  Title: string;
  Media: WorkMediaItem[];
  Spend: number; // API returns string, normalized at fetch layer
  ROI_7D: number;
  CTR: number;
  IsFeatured: boolean;
  Rank: number;
  LaunchDate?: string;
  Story?: string;
}

/** 将 Strapi API 返回的原始数据标准化（Spend 可能是 string） */
export function normalizeWork(work: Work): Work {
  return {
    ...work,
    Spend: Number(work.Spend) || 0,
    ROI_7D: Number(work.ROI_7D) || 0,
    CTR: Number(work.CTR) || 0,
    Rank: Number(work.Rank) || 0,
  };
}
