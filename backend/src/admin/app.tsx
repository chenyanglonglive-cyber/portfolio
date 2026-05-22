import type { StrapiApp } from '@strapi/strapi/admin';
import { injectAutoCover } from './extensions/auto-cover';

export default {
  config: {
    locales: ['zh-Hans', 'zh'],
  },
  bootstrap(app: StrapiApp) {
    // 注入自动抽帧脚本：选择视频后自动填充 cover 字段
    injectAutoCover();
  },
};
