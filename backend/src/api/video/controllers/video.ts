/**
 * video controller — core CRUD + compress()
 */

import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { factories } from '@strapi/strapi';

function runFFmpeg(cmd: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, _stdout, stderr) => {
      if (error) {
        reject(new Error(`FFmpeg failed: ${error.message}. stderr: ${stderr?.slice(0, 300)}`));
      } else {
        resolve();
      }
    });
  });
}

export default factories.createCoreController('api::video.video', () => ({
  /**
   * POST /api/videos/compress
   *
   * Receives a video file (multipart, field name "files"), compresses with
   * FFmpeg (H.264 CRF 23, AAC 128k), uploads the result to the media library,
   * and returns the Strapi file object.
   *
   * Auth: Bearer token checked against COMPRESS_API_TOKEN env var.
   */
  async compress(ctx: any) {
    // Auth: validate Bearer token against Strapi API token database
    const authHeader = ctx.request.headers.authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (token) {
      let valid = false;
      try {
        const found = await strapi.db.query('admin::api-token').findOne({
          where: { accessKey: token },
          select: ['id'],
        });
        valid = !!found;
      } catch {
        // Fallback: check against env var for initial setup
        const expected = process.env.COMPRESS_API_TOKEN || '';
        valid = expected && token === expected;
      }
      if (!valid) {
        console.warn('[compress] Invalid or unknown API token');
        return ctx.unauthorized('Invalid or missing API token');
      }
    } else {
      return ctx.unauthorized('Missing authorization header');
    }

    const files = ctx.request.files as Record<string, any> | undefined;
    const videoFile = files?.files;

    if (!videoFile) {
      return ctx.badRequest('No video file provided (field name must be "files")');
    }

    const fileObj = Array.isArray(videoFile) ? videoFile[0] : videoFile;
    const inputPath: string = fileObj.filepath || fileObj.path;
    const originalName: string = fileObj.originalFilename || fileObj.name || 'video.mp4';

    if (!inputPath || !fs.existsSync(inputPath)) {
      return ctx.badRequest('Uploaded file not found on disk');
    }

    const originalSize = fs.statSync(inputPath).size;
    const tempDir = os.tmpdir();
    const outputBase = `comp_${Date.now()}_${path.basename(originalName).replace(/\.[^.]+$/, '')}.mp4`;
    const outputPath = path.join(tempDir, outputBase);

    const ffmpegCmd = [
      'ffmpeg',
      '-i', `"${inputPath}"`,
      '-c:v', 'libx264',
      '-crf', '23',
      '-preset', 'medium',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      `"${outputPath}"`,
      '-y',
    ].join(' ');

    console.log(`[compress] Starting: ${(originalSize / 1024 / 1024).toFixed(1)}MB input`);

    try {
      await runFFmpeg(ffmpegCmd);

      if (!fs.existsSync(outputPath)) {
        throw new Error('FFmpeg completed but output file not found');
      }

      const stats = fs.statSync(outputPath);
      console.log(
        `[compress] Done: ${(originalSize / 1024 / 1024).toFixed(1)}MB → ${(stats.size / 1024 / 1024).toFixed(1)}MB (${((1 - stats.size / originalSize) * 100).toFixed(0)}% reduction)`
      );

      const [uploaded] = await strapi.plugins.upload.services.upload.upload({
        data: {
          fileInfo: {
            name: outputBase,
            caption: `Compressed from: ${originalName}`,
          },
        },
        files: {
          path: outputPath,
          name: outputBase,
          type: 'video/mp4',
          size: stats.size,
        },
      });

      try { fs.unlinkSync(inputPath); } catch (_) { /* ok */ }
      try { fs.unlinkSync(outputPath); } catch (_) { /* ok */ }

      return { data: uploaded };
    } catch (err: any) {
      try { fs.unlinkSync(inputPath); } catch (_) { /* ok */ }
      try { fs.unlinkSync(outputPath); } catch (_) { /* ok */ }
      console.error('[compress] Error:', err.message);
      return ctx.internalServerError(err.message || 'Compression failed');
    }
  },
}));
