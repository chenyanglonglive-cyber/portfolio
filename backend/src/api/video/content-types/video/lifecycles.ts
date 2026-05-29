import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import os from 'os';

const execP = promisify(exec);

async function syncVideoUsedStatuses() {
  try {
    const videoEntries = await strapi.db.query('api::video.video').findMany({
      populate: ['video'],
    });

    const referencedIds = new Set<number>();
    for (const entry of videoEntries) {
      if (entry.video && entry.video.id) {
        referencedIds.add(entry.video.id);
      }
    }

    const files = await strapi.db.query('plugin::upload.file').findMany();
    const videoFiles = files.filter((f: any) => f.mime && f.mime.startsWith('video/'));

    for (const file of videoFiles) {
      const isUsed = referencedIds.has(file.id);
      const name = file.name || '';
      const hasUsedEmoji = name.startsWith('✅ ');

      if (isUsed && !hasUsedEmoji) {
        const newName = `✅ ${name}`;
        await strapi.db.query('plugin::upload.file').update({
          where: { id: file.id },
          data: { name: newName }
        });
        console.log(`[Used Status] Marked video '${name}' as used (✅).`);
      } else if (!isUsed && hasUsedEmoji) {
        const newName = name.replace(/^✅\s*/, '');
        await strapi.db.query('plugin::upload.file').update({
          where: { id: file.id },
          data: { name: newName }
        });
        console.log(`[Used Status] Unmarked video '${name}' as unused.`);
      }
    }
  } catch (err: any) {
    console.error('[Used Status] Failed to sync video used statuses:', err?.message ?? err);
  }
}

export default {
  async afterCreate(event: any) {
    const { result } = event;
    if (result.video && !result.cover) {
      await generateCover(result.documentId, result.video);
    }
    await syncVideoUsedStatuses();
  },

  async afterUpdate(event: any) {
    const { result } = event;
    if (result.video && !result.cover) {
      await generateCover(result.documentId, result.video);
    }
    await syncVideoUsedStatuses();
  },

  async afterDelete(event: any) {
    await syncVideoUsedStatuses();
  }
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

