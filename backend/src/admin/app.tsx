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

    // 注入全局 CSS 样式，使内容管理器列表中（td 内）的封面和缩略图显示为原比例
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.id = 'strapi-table-media-original-ratio';
      style.innerHTML = `
        /* 针对 Content Manager 的表格列表中的缩略图 (Avatar) */
        table tbody td img[src*="uploads"],
        table tbody td [class*="Avatar"] img,
        table tbody td img {
          border-radius: 4px !important;
          object-fit: contain !important;
          background-color: rgba(255, 255, 255, 0.05) !important;
        }

        /* 强制覆盖所有包裹它的父级 div/span 的 border-radius 属性 */
        table tbody td [class*="Avatar"],
        table tbody td [class*="Avatar"] > div,
        table tbody td [class*="Avatar"] > span {
          border-radius: 4px !important;
          overflow: hidden !important;
        }
      `;
      document.head.appendChild(style);
      console.log('[Theme] Injected original-ratio styles for table media thumbnails.');
    }
  },
};

