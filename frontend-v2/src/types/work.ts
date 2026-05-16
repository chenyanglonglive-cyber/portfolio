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

export interface VideoWork extends Omit<Work, 'Media'> {
  video?: { url: string };
  cover?: { url: string };
}

export interface ImageWork extends Omit<Work, 'Media'> {
  image?: { url: string };
}

export function getWorkType(work: Work | VideoWork | ImageWork): 'video' | 'image' | null {
  if ('Media' in work) {
    const comp = work.Media?.[0]?.__component;
    if (comp === 'media.video-item') return 'video';
    if (comp === 'media.image-item') return 'image';
  } else if ('video' in work) {
    return 'video';
  } else if ('image' in work) {
    return 'image';
  }
  return null;
}

export function getWorkVideoUrl(work: Work | VideoWork | ImageWork): string | undefined {
  if ('Media' in work) {
    const item = work.Media?.[0];
    if (item?.__component === 'media.video-item') return item.video?.url;
  } else if ('video' in work) {
    return (work as VideoWork).video?.url;
  }
  return undefined;
}

export function getWorkCoverUrl(work: Work | VideoWork | ImageWork): string | undefined {
  if ('Media' in work) {
    const item = work.Media?.[0];
    if (item?.__component === 'media.video-item') return item.cover?.url;
    if (item?.__component === 'media.image-item') return item.image?.url;
  } else if ('video' in work) {
    return (work as VideoWork).cover?.url;
  } else if ('image' in work) {
    return (work as ImageWork).image?.url;
  }
  return undefined;
}

export interface Work {
  id: number;
  documentId: string;
  Title: string;
  Media?: WorkMediaItem[]; // Optional for backward compatibility
  Spend: number;
  ROI_7D: number;
  CTR: number;
  IsFeatured: boolean;
  Rank: number;
  LaunchDate?: string;
  Story?: string;
}

/** 将 Strapi API 返回的原始数据标准化 */
export function normalizeWork<T extends { Spend?: any; ROI_7D?: any; CTR?: any; Rank?: any }>(work: T): T & Work {
  const normalized = {
    ...work,
    Spend: Number(work.Spend) || 0,
    ROI_7D: Number(work.ROI_7D) || 0,
    CTR: Number(work.CTR) || 0,
    Rank: Number(work.Rank) || 0,
  } as any;

  // 如果是新模型，构造一个兼容的 Media 数组以便旧组件使用（如果需要）
  if (!('Media' in normalized)) {
    if ('video' in normalized) {
      normalized.Media = [{
        __component: 'media.video-item',
        video: (normalized as any).video,
        cover: (normalized as any).cover,
      }];
    } else if ('image' in normalized) {
      normalized.Media = [{
        __component: 'media.image-item',
        image: (normalized as any).image,
      }];
    }
  }

  return normalized;
}

