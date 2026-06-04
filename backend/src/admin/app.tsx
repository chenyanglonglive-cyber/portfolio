import type { StrapiApp } from '@strapi/strapi/admin';
import { injectAutoCover } from './extensions/auto-cover';
import { injectImportFolderUI } from './extensions/import-folder';

export default {
  config: {
    locales: ['zh-Hans', 'zh'],
  },
  bootstrap(app: StrapiApp) {
    // 注入自动抽帧脚本：选择视频后自动填充 cover 字段
    injectAutoCover();
    // 注入媒体文件夹批量导入关联脚本：选择文件夹一键关联该分类
    injectImportFolderUI();

    // 注入全局 CSS 样式，使内容管理器列表中的封面和缩略图自适应为原本比例
    if (typeof document !== 'undefined') {
      // 1. 注入防圆形裁剪与原比例自适应样式
      const style = document.createElement('style');
      style.id = 'strapi-table-media-original-ratio';
      style.innerHTML = `
        /* 针对表格单元格（或模拟的 gridcell）中的媒体缩略图 */
        table tbody td img,
        [role="gridcell"] img,
        td img[src*="uploads"],
        [class*="Avatar"] img {
          width: auto !important;
          height: 80px !important;
          max-width: 150px !important;
          object-fit: contain !important;
          border-radius: 4px !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        /* 强制覆盖所有包裹该 img 的父级容器（div/span 等）的宽高和圆角属性，实现原比例包裹 */
        table tbody td div:has(img),
        table tbody td span:has(img),
        [role="gridcell"] div:has(img),
        [role="gridcell"] span:has(img),
        td [class*="Avatar"],
        td [class*="Avatar"] > div,
        td [class*="Avatar"] > span {
          width: auto !important;
          height: 80px !important;
          max-width: 150px !important;
          border-radius: 4px !important;
          overflow: hidden !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* 清减表格单元格的上下 padding，以支持缩略图拉大贴合分割线 */
        table tbody tr td {
          padding-top: 2px !important;
          padding-bottom: 2px !important;
        }
      `;
      document.head.appendChild(style);
      console.log('[Theme] Injected advanced original-ratio styles.');

      // 2. 注入绿点验证指示器，用于提示缓存是否更新（位于后台右上角，呼吸效果）
      const indicator = document.createElement('div');
      indicator.id = 'admin-code-v2-indicator';
      indicator.style.cssText = 'position: fixed; top: 12px; right: 280px; width: 10px; height: 10px; background: #10b981; border-radius: 50%; z-index: 999999; box-shadow: 0 0 8px #10b981; pointer-events: none; animation: admin-pulse 1.5s infinite;';
      
      const keyframes = document.createElement('style');
      keyframes.innerHTML = `
        @keyframes admin-pulse {
          0% { opacity: 0.4; box-shadow: 0 0 4px #10b981; }
          50% { opacity: 1; box-shadow: 0 0 10px #10b981; }
          100% { opacity: 0.4; box-shadow: 0 0 4px #10b981; }
        }
      `;
      document.head.appendChild(keyframes);
      document.body.appendChild(indicator);
    }
  },
};

