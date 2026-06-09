const ANALYTICS_ENDPOINT = "/api/visit";

/**
 * 获取或生成唯一的访客 ID（存入 localStorage 以追踪 UV）
 */
export function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return 'ssr';
  try {
    let id = localStorage.getItem('visitor_uuid');
    if (!id) {
      // 简单且轻量级的伪 UUID 生成算法
      id = 'v_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      localStorage.setItem('visitor_uuid', id);
    }
    return id;
  } catch (err) {
    console.warn('[Analytics] Failed to read/write localStorage:', err);
    return 'unknown_visitor';
  }
}

interface VideoDetails {
  id: string;
  title: string;
}

/**
 * 上报访问日志
 * @param path 访问路径
 * @param video 可选的视频信息
 */
export async function trackVisit(path: string, video?: VideoDetails): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const visitorId = getOrCreateVisitorId();
    const payload = {
      data: {
        visitorId,
        path,
        videoId: video?.id || null,
        videoTitle: video?.title || null
      }
    };

    // 采用异步上报，静默失败，绝不阻塞用户主线程
    fetch(ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      // Keepalive allows the request to outlive the page unload in case of navigating away
      keepalive: true
    }).catch(err => {
      // 静默吞掉，不输出红色报错打扰用户
      console.debug('[Analytics] Failed to send log asynchronously:', err);
    });
  } catch (err) {
    console.debug('[Analytics] Error preparing payload:', err);
  }
}
