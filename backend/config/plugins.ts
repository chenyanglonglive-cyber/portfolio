import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  upload: {
    config: {
      provider: 'aws-s3',
      sizeLimit: 500 * 1024 * 1024, // 500MB 上限
      breakpoints: {}, // 禁用响应式图片裁剪，减少处理耗时
      providerOptions: {
        baseUrl: env('CF_PUBLIC_DOMAIN'),
        s3Options: {
          credentials: {
            accessKeyId: env('CF_ACCESS_KEY_ID'),
            secretAccessKey: env('CF_ACCESS_SECRET'),
          },
          endpoint: env('CF_ENDPOINT'), // https://<account_id>.r2.cloudflarestorage.com
          region: env('CF_REGION', 'auto'),
          forcePathStyle: true,
          params: {
            Bucket: env('CF_BUCKET'),
          },
        },
      },
      actionOptions: {
        upload: {},
        uploadStream: {},
        delete: {},
      },
    },
  },
});

export default config;
