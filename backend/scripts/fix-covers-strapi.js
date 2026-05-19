/**
 * Fix missing video covers — runs INSIDE Strapi process via `strapi console` or standalone.
 *
 * Usage on ECS:
 *   cd /var/www/strapi && node scripts/fix-covers-strapi.js
 */
const { createStrapi } = require('@strapi/strapi');
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');

const execP = promisify(exec);

(async () => {
  const app = await createStrapi({ distDir: './dist' }).load();

  const videos = await app.documents('api::video.video').findMany({
    populate: ['video', 'cover'],
  });

  const needFix = videos.filter((v) => v.video && !v.cover);
  console.log('Found ' + needFix.length + ' videos without covers');

  for (const v of needFix) {
    console.log('Processing: ' + v.Title + ' (' + v.documentId + ')');

    const localPath = path.join(app.dirs.app.root, 'public', v.video.url);
    if (!fs.existsSync(localPath)) {
      console.log('  SKIP - file not found: ' + localPath);
      continue;
    }

    const tmp = path.join(os.tmpdir(), 'cover_' + v.documentId + '_' + Date.now() + '.jpg');
    const cmd = 'ffmpeg -i "' + localPath + '" -ss 00:00:01 -vframes 1 -f image2 "' + tmp + '" -y';

    try {
      await execP(cmd);
    } catch (e) {
      console.log('  FFmpeg failed: ' + (e?.message || e).slice(0, 200));
      try { fs.unlinkSync(tmp); } catch (_) {}
      continue;
    }

    if (!fs.existsSync(tmp)) {
      console.log('  No output file');
      continue;
    }

    const stats = fs.statSync(tmp);
    const uploaded = await app.plugins.upload.services.upload.upload({
      data: {},
      files: {
        filepath: tmp,
        originalFilename: 'cover_' + v.documentId + '.jpg',
        mimetype: 'image/jpeg',
        size: stats.size,
      },
    });

    await app.documents('api::video.video').update({
      documentId: v.documentId,
      data: { cover: uploaded[0].id },
    });

    console.log('  DONE - cover id: ' + uploaded[0].id);
    fs.unlinkSync(tmp);
  }

  console.log('Finished.');
  await app.destroy();
})().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
