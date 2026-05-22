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
const { exec } = require('child_process');
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
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout: 300_000, maxBuffer: 10 * 1024 * 1024 }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(error.message + '\nStderr: ' + stderr));
      } else {
        resolve(stdout);
      }
    });
  });
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const client = url.startsWith('https') ? require('https') : require('http');
    client.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error('Failed to download file: ' + response.statusCode));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

let queueChain = Promise.resolve();

function enqueue(task) {
  return new Promise((resolve, reject) => {
    queueChain = queueChain.then(async () => {
      try {
        const result = await task();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });
  });
}

function verifyStrapiJWT(token) {
  return new Promise((resolve, reject) => {
    const req = http.get(STRAPI + '/admin/users/me', {
      headers: { Authorization: 'Bearer ' + token },
      timeout: 5000,
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          const data = JSON.parse(body);
          if (res.statusCode === 200 && data.data && data.data.id) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch { resolve(false); }
      });
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
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
    const cdMatch = headerText.match(/Content-Disposition:[^\n]+;\s*name="([^"]+)"(?:[^\n]*;\s*filename="([^"]+)")?/i);
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
  if (req.method !== 'POST') {
    return json(res, 404, { error: 'POST requests only' });
  }

  const auth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const isLocal = req.socket.remoteAddress === '127.0.0.1' || req.socket.remoteAddress === '::ffff:127.0.0.1' || req.socket.remoteAddress === '::1';

  // --- Asynchronous video compression trigger ---
  if (req.url === '/compress-async') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const tokenValid = isLocal || auth === TOKEN || (await verifyStrapiJWT(auth).catch(() => false));
      if (!tokenValid) {
        return json(res, 401, { error: 'Unauthorized' });
      }

      let body;
      try {
        body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
      } catch (e) {
        return json(res, 400, { error: 'Invalid JSON body' });
      }

      const { id, url } = body;
      if (!id || !url) {
        return json(res, 400, { error: 'Missing id or url' });
      }

      // Respond immediately with 202 Accepted
      json(res, 202, { ok: true, message: 'Enqueued' });

      // Process task in background queue
      enqueue(async () => {
        console.log('[compress-async] Starting background task for file ID:', id);
        const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "compress-async-"));
        const safeName = path.basename(url).replace(/[/\\:*?"<>|]/g, "_");
        const inputPath = path.join(workDir, "input" + path.extname(safeName));
        const outputName = path.parse(safeName).name + ".mp4";
        const outputPath = path.join(workDir, outputName);

        try {
          // 1. Download file from Strapi
          const downloadUrl = (url.startsWith('http://') || url.startsWith('https://')) ? url : (STRAPI + url);
          console.log('[compress-async] Downloading from:', downloadUrl);
          await downloadFile(downloadUrl, inputPath);

          const inMB = (fs.statSync(inputPath).size / 1024 / 1024).toFixed(1);
          console.log('[compress-async] Download complete:', inMB, 'MB');

          // 2. FFmpeg compression
          await sh('ffmpeg -i ' + JSON.stringify(inputPath) +
             ' -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart ' +
             JSON.stringify(outputPath) + ' -y');

          if (!fs.existsSync(outputPath)) {
            throw new Error('FFmpeg output not found');
          }

          const outSize = fs.statSync(outputPath).size;
          const outMB = (outSize / 1024 / 1024).toFixed(1);
          console.log('[compress-async] Compression done:', inMB, 'MB ->', outMB, 'MB');

          // 3. Upload replace to Strapi
          const formData = new FormData();
          const fileBuffer = fs.readFileSync(outputPath);
          const fileBlob = new Blob([fileBuffer], { type: 'video/mp4' });
          formData.append('files', fileBlob, outputName);
          formData.append('fileInfo', JSON.stringify({ alternativeText: 'compressed' }));

          console.log('[compress-async] Uploading replacement to Strapi...');
          const uploadRes = await fetch(STRAPI + '/api/upload?id=' + id, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + TOKEN,
            },
            body: formData,
          });

          if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error('Strapi upload replacement failed (' + uploadRes.status + '): ' + errText.slice(0, 200));
          }

          console.log('[compress-async] Replacement OK for file ID:', id);
        } catch (err) {
          console.error('[compress-async] Error in task:', err.message);
        } finally {
          try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
        }
      }).catch((err) => {
        console.error('[compress-async] Queue execution error:', err.message);
      });
    });
    return;
  }

  // --- Original synchronous-blocking compat route ---
  if (req.url === '/compress') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const tokenValid = isLocal || auth === TOKEN ||
        (await verifyStrapiJWT(auth).catch(() => false));
      if (!tokenValid) {
        return json(res, 401, { error: 'Unauthorized' });
      }
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

      const safeName = filePart.filename.replace(/[/\\:*?"<>|]/g, "_");
      const workDir = fs.mkdtempSync(path.join(os.tmpdir(), "compress-"));
      const inputPath = path.join(workDir, "input" + path.extname(safeName));
      const outputName = path.parse(safeName).name + ".mp4";
      const outputPath = path.join(workDir, outputName);

      try {
        fs.writeFileSync(inputPath, filePart.body);
        const inMB = (filePart.body.length / 1024 / 1024).toFixed(1);
        console.log('[compress] Received:', inMB, 'MB');

        const outFile = await enqueue(async () => {
          await sh('ffmpeg -i ' + JSON.stringify(inputPath) +
             ' -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k -movflags +faststart ' +
             JSON.stringify(outputPath) + ' -y');

          if (!fs.existsSync(outputPath)) {
            throw new Error('FFmpeg output not found');
          }

          const outSize = fs.statSync(outputPath).size;
          const outMB = (outSize / 1024 / 1024).toFixed(1);
          console.log('[compress] Done:', inMB, 'MB ->', outMB, 'MB');

          const formData = new FormData();
          const fileBuffer = fs.readFileSync(outputPath);
          const fileBlob = new Blob([fileBuffer], { type: 'video/mp4' });
          formData.append('files', fileBlob, outputName);

          for (const part of parts) {
            if (part.name !== 'files') {
              formData.append(part.name, part.body.toString('utf-8'));
            }
          }

          console.log('[compress] Uploading to Strapi natively...');
          const uploadRes = await fetch(STRAPI + '/api/upload', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + TOKEN,
            },
            body: formData,
          });

          if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            throw new Error('Strapi upload failed (' + uploadRes.status + '): ' + errText.slice(0, 200));
          }

          const upData = await uploadRes.json();
          const result = upData[0];
          if (!result || !result.id) {
            throw new Error('Strapi upload returned invalid response');
          }

          console.log('[compress] Upload OK:', result.id);

          return {
            id: result.id,
            url: result.url,
            name: result.name,
            size: outSize,
            hash: result.hash || '',
            mime: result.mime || 'video/mp4',
            ext: result.ext || '.mp4',
            width: result.width || null,
            height: result.height || null,
          };
        });

        json(res, 200, [outFile]);
      } catch (err) {
        console.error('[compress] Error:', err.message);
        json(res, 500, { ok: false, error: err.message });
      } finally {
        try { fs.rmSync(workDir, { recursive: true, force: true }); } catch {}
      }
    });
    return;
  }

  return json(res, 404, { error: 'Not Found' });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('[compress] Listening on http://127.0.0.1:' + PORT);
});
