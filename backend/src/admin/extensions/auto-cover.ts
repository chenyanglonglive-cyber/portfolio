/**
 * Strapi Admin 注入脚本：选择视频后自动抽帧并回填 cover 字段
 *
 * 原理：轮询监测 content-manager 编辑表单中 video 字段变化，
 * 一旦视频已选中、cover 为空，就用客户端 Canvas 抽帧，
 * 上传到 Strapi 媒体库，再通过 Content API 将 cover 关联到当前条目。
 */
export function injectAutoCover() {
  const SCRIPT_ID = 'auto-cover-extractor';

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.textContent = `
(function() {
  'use strict';

  const POLL_MS = 500;
  const JWT_KEY = 'jwtToken';
  let processingId = null; // 正在处理的 media 标识，避免重复触发

  // ---------- helpers ----------

  function getToken() {
    return sessionStorage.getItem(JWT_KEY) || localStorage.getItem(JWT_KEY) || '';
  }

  function getStrapiOrigin() {
    return window.location.origin;
  }

  /** label 文本精确匹配的字段容器 */
  function fieldContainer(labelText) {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      if ((label.textContent || '').trim() === labelText) {
        return label.closest('[class*="Field"]') || label.closest('[class*="field"]') || label.parentElement;
      }
    }
    return null;
  }

  /** 字段区域内是否有已选媒体（预览卡片 / 删除按钮） */
  function hasSelectedMedia(container) {
    if (!container) return false;
    const card = container.querySelector('[class*="Card"], [class*="card"]');
    const removeBtn = container.querySelector('button[aria-label*="remove" i], button[aria-label*="删除" i]');
    return !!(card || removeBtn);
  }

  /** 从 URL 路径解析当前编辑条目的类型和 documentId */
  function parseEntryFromUrl() {
    const m = window.location.pathname.match(
      /\\/content-manager\\/collection-types\\/([^/]+)\\/([^/?]+)/
    );
    if (!m) return null;
    const [, rawType, docId] = m;
    // rawType 如 api::video.video → 提取最后一段作为 collection name
    const parts = rawType.split('.');
    const collection = parts[parts.length - 1] || 'videos';
    return { collection, documentId: docId };
  }

  // ---------- 抽帧 ----------

  function extractFrame(videoUrl) {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.muted = true;
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        video.currentTime = Math.min(video.duration, 1.0);
      };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width > 0) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(videoUrl);
              blob ? resolve(blob) : reject(new Error('Canvas toBlob 返回空'));
            },
            'image/jpeg',
            0.85,
          );
        } else {
          URL.revokeObjectURL(videoUrl);
          reject(new Error('Canvas 尺寸为 0'));
        }
      };
      video.onerror = () => {
        URL.revokeObjectURL(videoUrl);
        reject(new Error('视频加载失败'));
      };
    });
  }

  // ---------- 上传 ----------

  async function uploadToStrapi(blob) {
    const fd = new FormData();
    fd.append('files', new File([blob], 'auto-cover.jpg', { type: 'image/jpeg' }));
    const resp = await fetch(getStrapiOrigin() + '/api/upload', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + getToken() },
      body: fd,
    });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || '上传失败 ' + resp.status);
    }
    const data = await resp.json();
    return data[0];
  }

  // 通过 Content API 把 cover 写回到当前条目
  async function patchEntry(collection, documentId, coverId) {
    const resp = await fetch(
      getStrapiOrigin() + '/api/' + collection + '/' + encodeURIComponent(documentId),
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + getToken(),
        },
        body: JSON.stringify({ data: { cover: { id: coverId } } }),
      },
    );
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error?.message || '关联封面失败 ' + resp.status);
    }
    return resp.json();
  }

  // ---------- 状态提示 ----------

  function showStatus(labelText, text, isError) {
    // 清除旧的状态
    document.querySelectorAll('.auto-cover-status').forEach((el) => el.remove());

    if (!text) return;

    const container = fieldContainer(labelText);
    if (!container) return;

    const label = container.querySelector('label');
    if (!label) return;

    const span = document.createElement('span');
    span.className = 'auto-cover-status';
    span.style.cssText =
      'display:inline-block;margin-left:10px;font-size:12px;font-weight:500;' +
      (isError ? 'color:#f87171;' : 'color:#34d399;');
    span.textContent = text;
    label.appendChild(span);
  }

  // ---------- 获取视频 URL ----------

  async function getVideoUrlFromField() {
    const container = fieldContainer('video');
    if (!container) return null;

    // 1) 尝试从预览图 img 的 src 获取
    const img = container.querySelector('img');
    if (img) {
      const src = img.getAttribute('src') || img.src || '';
      // Strapi 返回的媒体 URL 可能是完整的 https://... 或相对路径
      if (src && (src.startsWith('http') || src.startsWith('/'))) {
        return src.startsWith('http') ? src : getStrapiOrigin() + src;
      }
    }

    // 2) 从容器内文字提取文件名，走 upload API 反查
    const nameEls = container.querySelectorAll('p, span, div');
    let fileName = '';
    for (const el of nameEls) {
      const t = (el.textContent || '').trim();
      if (/\\.(mp4|mov|webm|avi)/i.test(t)) {
        fileName = t;
        break;
      }
    }

    if (fileName) {
      const baseName = fileName.replace(/\\.[^.]+$/, '');
      const resp = await fetch(
        getStrapiOrigin() +
          '/api/upload/files?filters[$or][0][name][$contains]=' +
          encodeURIComponent(baseName) +
          '&sort=createdAt:desc&pageSize=1',
        { headers: { Authorization: 'Bearer ' + getToken() } },
      );
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.length > 0 && data[0].url) {
          return data[0].url;
        }
      }
    }

    return null;
  }

  // ---------- 主流程 ----------

  async function tryExtract() {
    const entry = parseEntryFromUrl();
    if (!entry) return;

    const videoContainer = fieldContainer('video');
    const coverContainer = fieldContainer('cover');
    if (!videoContainer) return;

    const videoHasMedia = hasSelectedMedia(videoContainer);
    const coverHasMedia = hasSelectedMedia(coverContainer);

    // 条件：video 已选且 cover 为空，且未在处理中
    if (!videoHasMedia || coverHasMedia || processingId) return;

    // 生成 processingId 避免同一轮反复触发
    processingId = 'processing-' + Date.now();

    try {
      showStatus('cover', '⏳ 正在抽帧…', false);

      const videoUrl = await getVideoUrlFromField();
      if (!videoUrl) throw new Error('无法获取视频文件地址，请确认视频已上传完毕');

      showStatus('cover', '⏳ 提取画面…', false);

      const blob = await extractFrame(videoUrl);

      showStatus('cover', '⏳ 上传封面…', false);

      const uploaded = await uploadToStrapi(blob);

      showStatus('cover', '⏳ 关联封面…', false);

      await patchEntry(entry.collection, entry.documentId, uploaded.id);

      showStatus('cover', '✅ 封面已自动填充（请手动保存）', false);

      // 5 秒后清除成功提示
      setTimeout(() => showStatus('cover', '', false), 5000);
    } catch (err) {
      console.error('[auto-cover]', err);
      showStatus('cover', '❌ ' + (err.message || '抽帧失败'), true);
      setTimeout(() => showStatus('cover', '', false), 8000);
    } finally {
      processingId = null;
    }
  }

  // ---------- 启动 ----------

  function tick() {
    if (window.location.pathname.includes('/content-manager/')) {
      tryExtract();
    }
    setTimeout(tick, POLL_MS);
  }

  setTimeout(tick, 1200);
})();
`;

  document.head.appendChild(script);
}
