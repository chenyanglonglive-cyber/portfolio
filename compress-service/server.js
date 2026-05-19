/**
 * Standalone video compression service.
 *
 * POST /compress (multipart, field "files")
 *   → FFmpeg H.264 CRF 23 → Strapi upload via localhost
 *   → returns { ok, data: { id, url, name, size }, stats }
 *
 * Requires: COMPRESS_API_TOKEN env var
 */

const http = require('http');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3001;
const STRAPI = 'http://127.0.0.1:1337';
const TOKEN = process.env.COMPRESS_API_TOKEN || '';

function json(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function sh(cmd) {
  console.log('[compress]', cmd.slice(0, 250));
  return execSync(cmd, { timeout: 300_000, encoding: 'utf-8', stdio: 'pipe' });
}

function parseMultipart(buffer, boundary) {
  // Parse multipart form-data, return array of { headers, body: Buffer }
  const str = buffer.toString('binary');
  const parts = [];
  const sep = '--' + boundary;
  const sections = str.split(sep);
  for (const section of sections) {
    if (section.startsWith('--')) continue; // closing boundary
    const headerEnd = section.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerText = section.slice(0, headerEnd);
    const body = section.slice(headerEnd + 4);
    // trim trailing \r\n before next boundary
    const cleanBody = body.replace(/\r\n$/, '');
    // Parse Content-Disposition to get filename
    const cdMatch = headerText.match(/Content-Disposition:[^\n]+name="([^"]+)"(?:;[^\n]+filename="([^"]+)")?/i);
    if (cdMatch) {
      parts.push({
        name: cdMatch[1],
        filename: cdMatch[2] || null,
        headers: headerText,
        body: Buffer.from(cleanBody, 'binary'),
      });
    }
  }
  return parts;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'POST' || req.url !== '/compress') {
    return json(res, 404, { error: 'POST /compress only' });
  }

  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!TOKEN || auth !== TOKEN) {
    return json(res, 401, { error: 'Unauthorized' });
  }

  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const buffer = Buffer.concat(chunks);
    const contentType = req.headers['content-type'] || '';
    const boundaryMatch = contentType.match(/boundary=(.+?)(;|$)/);
    if (!boundaryMatch) {
      return json(res, 400, { error: 'No multipart boundary' });
    }
    const boundary = boundaryMatch[1].replace(/^"|"$/g, '');

    let parts;
    try {
      parts = parseMultipart(buffer, boundary);
    } catch (e) {
      return json(res, 400, { error: 'Failed to parse multipart: ' + e.message });
    }

    const filePart = parts.find((p) => p.name === 'files' && p.filename);
    if (!filePart) {
      return json(res, 400, { error: 'No file in "files" field' });
    }

    const tmpDir = os.tmpdir();
    const safeName = filePart.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const inputPath = path.join(tmpDir, 'up_' + Date.now() + '_' + safeName);
    const outputPath = path.join(tmpDir, 'comp_' + Date.now() + '_' + path.parse(safeName).name + '.mp4');

    let inputPathForCleanup = '';
    let outputPathForCleanup = '';

    try {
      fs.writeFileSync(inputPath, filePart.body);
      inputPathForCleanup = inputPath;
      const inMB = (filePart.body.length / 1024 / 1024).toFixed(1);
      console.log('[compress] Received:', inMB, 'MB');

      // FFmpeg
      sh('ffmpeg -i ' + JSON.stringify(inputPath) +
         ' -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart ' +
         JSON.stringify(outputPath) + ' -y');

      if (!fs.existsSync(outputPath)) {
        throw new Error('FFmpeg output not found');
      }
      outputPathForCleanup = outputPath;

      const outSize = fs.statSync(outputPath).size;
      const outMB = (outSize / 1024 / 1024).toFixed(1);
      console.log('[compress] Done:', inMB, 'MB ->', outMB, 'MB');

      // Upload to Strapi via curl
      const curlOut = sh(
        'curl -s -X POST ' + STRAPI + '/api/upload ' +
        '-H "Authorization: Bearer ' + TOKEN + '" ' +
        '-F "files=@' + outputPath + '"'
      );
      const upData = JSON.parse(curlOut);
      const result = upData[0];
      if (!result || !result.id) {
        throw new Error('Strapi upload failed: ' + curlOut.slice(0, 200));
      }

      console.log('[compress] Upload OK:', result.id);

      json(res, 200, {
        ok: true,
        data: { id: result.id, url: result.url, name: result.name, size: outSize },
        stats: {
          originalSize: filePart.body.length,
          compressedSize: outSize,
          reduction: Math.round((1 - outSize / filePart.body.length) * 100),
        },
      });
    } catch (err) {
      console.error('[compress] Error:', err.message);
      json(res, 500, { ok: false, error: err.message });
    } finally {
      try { if (inputPathForCleanup) fs.unlinkSync(inputPathForCleanup); } catch {}
      try { if (outputPathForCleanup) fs.unlinkSync(outputPathForCleanup); } catch {}
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('[compress] Listening on http://127.0.0.1:' + PORT);
});
