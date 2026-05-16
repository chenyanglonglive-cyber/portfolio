import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';

export default {
  async afterCreate(event: any) {
    const { result } = event;
    if (result.video && !result.cover) {
      await generateCover(result.documentId, result.video.url);
    }
  },

  async afterUpdate(event: any) {
    const { result } = event;
    // Note: in Strapi 5, result might be the updated document
    if (result.video && !result.cover) {
      await generateCover(result.documentId, result.video.url);
    }
  },
};

async function generateCover(documentId: string, videoData: any) {
  try {
    // 获取完整的视频信息
    const entry = await strapi.documents('api::video.video').findOne({
      documentId,
      populate: ['video']
    });

    if (!entry || !entry.video || !entry.video.url) {
      console.log('No video found for document:', documentId);
      return;
    }

    const videoUrl = entry.video.url.startsWith('http') 
      ? entry.video.url 
      : `${process.env.STRAPI_URL || 'http://localhost:1337'}${entry.video.url}`;

    console.log(`Generating cover for video: ${videoUrl}`);
    
    const tempDir = os.tmpdir();
    const thumbName = `thumb_${documentId}_${Date.now()}.jpg`;
    const thumbPath = path.join(tempDir, thumbName);
    
    // 1. 使用 ffmpeg 提取第一帧
    const ffmpegCmd = `ffmpeg -i "${videoUrl}" -ss 00:00:01 -vframes 1 -f image2 "${thumbPath}" -y`;
    
    exec(ffmpegCmd, async (error) => {
      if (error) {
        console.error('FFmpeg error:', error);
        return;
      }

      try {
        const stats = fs.statSync(thumbPath);
        
        const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
          data: {},
          files: {
            path: thumbPath,
            name: `cover_${documentId}.jpg`,
            type: 'image/jpeg',
            size: stats.size,
          },
        });

        const coverId = uploadedFiles[0].id;

        await strapi.documents('api::video.video').update({
          documentId,
          data: {
            cover: coverId,
          },
          status: entry.publishedAt ? 'published' : 'draft' // 保持发布状态一致
        });

        console.log(`Successfully generated and linked cover for ${documentId}`);
        fs.unlinkSync(thumbPath);
      } catch (err) {
        console.error('Failed to save cover:', err);
      }
    });
  } catch (err) {
    console.error('Error in generateCover:', err);
  }
}

