import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execP = promisify(exec);

export default {
  async afterCreate(event: any) {
    const { result } = event;
    if (result.video && !result.cover) {
      await generateCover(result.documentId, result.video);
    }
  },

  async afterUpdate(event: any) {
    const { result } = event;
    if (result.video && !result.cover) {
      await generateCover(result.documentId, result.video);
    }
  },
};

async function generateCover(documentId: string, videoData: any) {
  try {
    const entry = await strapi.documents('api::video.video').findOne({
      documentId,
      populate: ['video'],
    });

    if (!entry?.video?.url) {
      console.log('No video found for document:', documentId);
      return;
    }

    const videoUrl: string = entry.video.url;
    console.log(`Generating cover for video ${documentId}: ${videoUrl}`);

    // Resolve local file path — avoid HTTP download since we're on the same machine
    const publicDir = path.join(strapi.dirs?.app?.root ?? process.cwd(), 'public');
    const localPath = path.join(publicDir, videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`);
    if (!fs.existsSync(localPath)) {
      console.error(`Video file not found locally: ${localPath}`);
      return;
    }

    const tempDir = os.tmpdir();
    const thumbName = `thumb_${documentId}_${Date.now()}.jpg`;
    const thumbPath = path.join(tempDir, thumbName);

    const ffmpegCmd = `ffmpeg -i "${localPath}" -ss 00:00:01 -vframes 1 -f image2 "${thumbPath}" -y`;

    try {
      await execP(ffmpegCmd);
    } catch (err: any) {
      console.error('FFmpeg error:', err?.message ?? err);
      return;
    }

    if (!fs.existsSync(thumbPath)) {
      console.error('FFmpeg did not produce output');
      return;
    }

    const stats = fs.statSync(thumbPath);

    const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
      data: {},
      files: {
        filepath: thumbPath,
        originalFilename: `cover_${documentId}.jpg`,
        mimetype: 'image/jpeg',
        size: stats.size,
      },
    });

    const coverId = uploadedFiles[0].id;

    await strapi.documents('api::video.video').update({
      documentId,
      data: { cover: coverId },
      status: entry.publishedAt ? 'published' : 'draft',
    });

    console.log(`Cover generated for ${documentId}`);
    fs.unlinkSync(thumbPath);
  } catch (err: any) {
    console.error('Error in generateCover:', err?.message ?? err);
  }
}

