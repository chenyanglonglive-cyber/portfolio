import type { StrapiApp } from '@strapi/strapi/admin';
import { injectAutoCover } from './extensions/auto-cover';
import { injectCompressUpload } from './extensions/compress-upload';

export default {
  config: {
    locales: ['zh-Hans', 'zh'],
  },
  bootstrap(app: StrapiApp) {
    // 注入自动抽帧脚本：选择视频后自动填充 cover 字段
    injectAutoCover();
    // 注入上传拦截脚本：媒体库上传时自动压缩图片/视频
    injectCompressUpload();
  },
};
