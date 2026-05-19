/**
 * 一次性脚本：为所有缺失封面的视频自动生成封面。
 *
 * 在 ECS 上运行：
 *   cd /root/portfolio/backend
 *   node scripts/fix-video-covers.js
 *
 * 前提条件：ECS 上已安装 ffmpeg。
 */
const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');
const os = require('os');

const execP = promisify(exec);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const PUBLIC_DIR = path.resolve(__dirname, '..', 'public');

async function main() {
  console.log('Fetching videos without covers…');

  const res = await fetch(
    `${STRAPI_URL}/api/videos?populate[cover]=*&populate[video]=*&pagination[pageSize]=100`
  );

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  // Filter to videos that have a video file but no cover
  const videos = (json.data || []).filter(
    (v) => v.video?.url && !v.cover
  );

  if (videos.length === 0) {
    console.log('No videos without covers found.');
    return;
  }

  console.log(`Found ${videos.length} video(s) to fix:\n`);

  for (const v of videos) {
    const docId = v.documentId;
    const title = v.Title || '(no title)';
    const videoUrl = v.video?.url;

    if (!videoUrl) {
      console.log(`  SKIP ${docId} "${title}" — no video file`);
      continue;
    }

    const localPath = path.join(
      PUBLIC_DIR,
      videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`
    );

    if (!fs.existsSync(localPath)) {
      console.log(`  SKIP ${docId} "${title}" — file not found: ${localPath}`);
      continue;
    }

    console.log(`  Processing: "${title}" (${docId})`);

    const thumbPath = path.join(
      os.tmpdir(),
      `fixcover_${docId}_${Date.now()}.jpg`
    );

    try {
      await execP(
        `ffmpeg -i "${localPath}" -ss 00:00:01 -vframes 1 -f image2 "${thumbPath}" -y`
      );
    } catch (err) {
      console.log(`    FFmpeg failed: ${err?.message ?? err}`);
      continue;
    }

    if (!fs.existsSync(thumbPath)) {
      console.log('    FFmpeg produced no output');
      continue;
    }

    // Upload via Strapi upload API
    const fileBuffer = fs.readFileSync(thumbPath);

    // Node 18+ built-in FormData + Blob
    const formData = new FormData();
    formData.append(
      'files',
      new Blob([fileBuffer], { type: 'image/jpeg' }),
      `cover_${docId}.jpg`
    );

    const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      console.log(
        `    Upload failed: ${uploadRes.status} ${uploadRes.statusText}`
      );
      fs.unlinkSync(thumbPath);
      continue;
    }

    const uploadJson = await uploadRes.json();
    const coverId = uploadJson?.[0]?.id;

    if (!coverId) {
      console.log('    Upload returned no file id');
      fs.unlinkSync(thumbPath);
      continue;
    }

    // Link cover to video entry
    const updateRes = await fetch(`${STRAPI_URL}/api/videos/${docId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { cover: coverId } }),
    });

    if (updateRes.ok) {
      console.log(`    ✓ Cover set (id=${coverId})`);
    } else {
      console.log(
        `    ✗ Update failed: ${updateRes.status} ${updateRes.statusText}`
      );
    }

    fs.unlinkSync(thumbPath);
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
