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
  },
};
