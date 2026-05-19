/**
 * Strapi Admin injection: intercept media library uploads to compress
 * before saving.
 *
 * - Images → Canvas WebP (100–200 KB), client-side, instant
 * - Videos → redirect to /compress (ECS FFmpeg H.264 CRF 23)
 * - Toast shows queue progress for multi-file uploads
 */

export function injectCompressUpload() {
  const SCRIPT_ID = 'compress-upload-hook';
  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.textContent = /* javascript */ `
(function () {
  'use strict';

  // ── toast UI ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = '.cu-toast{position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;flex-direction:column;gap:8px;font-family:system-ui,sans-serif}.cu-toast-item{background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:12px;padding:12px 18px;font-size:13px;box-shadow:0 8px 32px rgba(0,0,0,.6);animation:cu-in .3s ease;display:flex;align-items:center;gap:10px;min-width:280px;max-width:420px}.cu-toast-item.success{border-color:#34d399}.cu-toast-item.error{border-color:#f87171}.cu-toast-msg{flex:1;line-height:1.4}.cu-toast-close{background:none;border:none;color:#666;cursor:pointer;font-size:16px;padding:0 2px}@keyframes cu-in{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);

  const toastContainer = document.createElement('div');
  toastContainer.className = 'cu-toast';
  document.body.appendChild(toastContainer);

  function toast(msg, type) {
    type = type || '';
    const el = document.createElement('div');
    el.className = 'cu-toast-item ' + type;
    const icon = type === 'success' ? '\\u2705' : type === 'error' ? '\\u274C' : '\\u23F3';
    el.innerHTML = '<span>' + icon + '</span><span class="cu-toast-msg">' + msg.replace(/</g,'&lt;') + '</span><button class="cu-toast-close">&times;</button>';
    el.querySelector('button').onclick = function () { el.remove(); };
    toastContainer.appendChild(el);
    if (type !== '') setTimeout(function () { el.remove(); }, 5000);
    else setTimeout(function () { el.remove(); }, 8000);
    return el;
  }

  // ── image compression ─────────────────────────────────────
  function loadImage(file) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { URL.revokeObjectURL(img.src); resolve(img); };
      img.onerror = function () { URL.revokeObjectURL(img.src); reject(new Error('load failed')); };
      img.src = URL.createObjectURL(file);
    });
  }

  function canvasToBlob(canvas, quality) {
    return new Promise(function (resolve) {
      canvas.toBlob(function (blob) { resolve(blob); }, 'image/webp', quality);
    });
  }

  async function compressImageToWebP(file) {
    if (file.type === 'image/webp' && file.size >= 90 * 1024 && file.size <= 210 * 1024) return file;

    var img = await loadImage(file);
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0);

    var lo = 0.1, hi = 1.0, best = null;
    for (var i = 0; i < 8; i++) {
      var q = (lo + hi) / 2;
      var blob = await canvasToBlob(canvas, q);
      if (!blob) break;
      var kb = blob.size / 1024;
      if (kb >= 100 && kb <= 200) { best = blob; break; }
      if (kb < 100) { lo = q; } else { hi = q; best = blob; }
    }
    if (!best) best = await canvasToBlob(canvas, 0.6);
    if (!best) return file;

    var name = file.name.replace(/\\.[^.]+$/, '') + '.webp';
    return new File([best], name, { type: 'image/webp' });
  }

  function isImage(file) { return file.type.startsWith('image/'); }
  function isVideo(file) { return file.type.startsWith('video/'); }

  // ── queue ─────────────────────────────────────────────────
  var queue = [];
  var running = false;

  async function processQueue() {
    if (running) return;
    running = true;
    while (queue.length > 0) {
      var task = queue.shift();
      var toastEl = toast(
        '\\u23F3 ' + (task.isVideo ? '压缩视频' : '压缩图片') +
        ' (' + task.idx + '/' + task.total + '): ' + task.name,
        ''
      );
      try {
        if (task.isVideo) {
          await processVideoUpload(task);
        } else {
          await task.resolve(task.file); // already compressed
        }
        toastEl.querySelector('.cu-toast-msg').textContent =
          '\\u2705 ' + (task.isVideo ? '视频' : '图片') +
          ' (' + task.idx + '/' + task.total + '): ' + task.name;
        toastEl.className = 'cu-toast-item success';
      } catch (err) {
        toastEl.querySelector('.cu-toast-msg').textContent =
          '\\u274C ' + task.name + ': ' + (err.message || 'failed');
        toastEl.className = 'cu-toast-item error';
      }
    }
    running = false;
  }

  function enqueue(task) {
    queue.push(task);
    processQueue();
  }

  // ── video: upload to /compress ────────────────────────────
  async function processVideoUpload(task) {
    var fd = new FormData();
    fd.append('files', task.file);
    var resp = await fetch(window.location.origin + '/compress', {
      method: 'POST',
      headers: task.authHeader ? { Authorization: task.authHeader } : {},
      body: fd,
    });
    if (!resp.ok) {
      var err = await resp.json().catch(function () { return {}; });
      throw new Error(err.error || 'Compression failed (' + resp.status + ')');
    }
    var data = await resp.json();
    // Return in Strapi-compatible format
    return Array.isArray(data) ? data : (data.data ? [data.data] : [data]);
  }

  // ── monkey-patch fetch ────────────────────────────────────
  var origFetch = window.fetch;
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input.url || input.toString());
    init = init || {};

    if (init.method === 'POST' && url.indexOf('/upload') !== -1 && init.body instanceof FormData) {
      var files = [];
      // Collect all File entries from FormData
      var entries = [];
      if (typeof init.body.getAll === 'function') {
        var raw = init.body.getAll('files');
        for (var i = 0; i < raw.length; i++) {
          if (raw[i] instanceof File) entries.push(raw[i]);
        }
      }
      if (entries.length === 0) {
        init.body.forEach(function (value) {
          if (value instanceof File) entries.push(value);
        });
      }

      if (entries.length > 0) {
        return handleUpload(url, init, entries, origFetch, input, init);
      }
    }

    return origFetch.call(window, input, init);
  };

  // ── monkey-patch XHR ──────────────────────────────────────
  var OrigXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    var xhr = new OrigXHR();
    var origOpen = xhr.open;
    var origSend = xhr.send;
    var _method, _url;

    xhr.open = function (method, url) {
      _method = method;
      _url = url;
      return origOpen.apply(xhr, arguments);
    };

    xhr.send = function (body) {
      if (_method === 'POST' && _url && _url.indexOf('/upload') !== -1 && body instanceof FormData) {
        var entries = [];
        if (typeof body.getAll === 'function') {
          var raw = body.getAll('files');
          for (var i = 0; i < raw.length; i++) {
            if (raw[i] instanceof File) entries.push(raw[i]);
          }
        }
        if (entries.length === 0) {
          body.forEach(function (value) {
            if (value instanceof File) entries.push(value);
          });
        }

        if (entries.length > 0) {
          handleUpload(_url, { method: _method, body: body, headers: {} }, entries, null, null, null, xhr);
          return;
        }
      }
      return origSend.apply(xhr, arguments);
    };

    return xhr;
  };
  window.XMLHttpRequest.prototype = OrigXHR.prototype;

  // ── upload handler ────────────────────────────────────────
  async function handleUpload(url, init, entries, origFetchFn, fetchInput, fetchInit, xhrOverride) {
    var authHeader = '';
    if (init.headers) {
      var h = init.headers;
      if (h.Authorization) authHeader = h.Authorization;
      else if (h.authorization) authHeader = h.authorization;
      else if (typeof h.get === 'function') authHeader = h.get('Authorization') || h.get('authorization') || '';
    }

    // Separate images and videos
    var imageFiles = [];
    var videoFiles = [];
    for (var i = 0; i < entries.length; i++) {
      var f = entries[i];
      if (isImage(f)) imageFiles.push(f);
      else if (isVideo(f)) videoFiles.push(f);
      else imageFiles.push(f); // treat unknown as image
    }

    var total = imageFiles.length + videoFiles.length;
    var idx = 0;
    var compressedFD = new FormData();

    // --- compress images (parallel) ---
    if (imageFiles.length > 0) {
      toast('\\u23F3 正在压缩 ' + imageFiles.length + ' 张图片...', '');
      var compResults = await Promise.all(
        imageFiles.map(async function (file) {
          idx++;
          var t = toast('\\u23F3 压缩图片 (' + idx + '/' + total + '): ' + file.name, '');
          try {
            var compressed = await compressImageToWebP(file);
            var kb = (compressed.size / 1024).toFixed(0);
            t.querySelector('.cu-toast-msg').textContent =
              '\\u2705 图片 (' + idx + '/' + total + '): ' + compressed.name + ' (' + kb + ' KB)';
            t.className = 'cu-toast-item success';
            return compressed;
          } catch (err) {
            t.querySelector('.cu-toast-msg').textContent = '\\u274C ' + file.name + ': ' + (err.message || 'compress failed');
            t.className = 'cu-toast-item error';
            return file; // fallback to original
          }
        })
      );
      for (var j = 0; j < compResults.length; j++) {
        compressedFD.append('files', compResults[j]);
      }
    }

    // --- if only images, just upload compressed versions ---
    if (videoFiles.length === 0 && imageFiles.length > 0) {
      // Replace FormData body with compressed files
      // Copy non-file entries from original
      if (init.body && init.body.forEach) {
        init.body.forEach(function (value, key) {
          if (!(value instanceof File)) {
            compressedFD.append(key, value);
          }
        });
      }

      if (xhrOverride) {
        // XHR path — send with compressed FD
        var newXhr = new OrigXHR();
        newXhr.open('POST', url);
        // Copy headers
        if (init.headers && init.headers.Authorization) {
          newXhr.setRequestHeader('Authorization', init.headers.Authorization);
        }
        // Copy event listeners from original xhr
        newXhr.onload = xhrOverride.onload;
        newXhr.onerror = xhrOverride.onerror;
        newXhr.onreadystatechange = xhrOverride.onreadystatechange;
        newXhr.upload.onprogress = xhrOverride.upload.onprogress;
        newXhr.send(compressedFD);
        return;
      } else if (origFetchFn) {
        var newInit = Object.assign({}, fetchInit, { body: compressedFD });
        return origFetchFn.call(window, fetchInput, newInit);
      }
    }

    // --- videos: upload each to /compress, collect responses ---
    var allResults = [];
    // First, upload compressed images normally (if any)
    if (imageFiles.length > 0 && origFetchFn) {
      var imgInit = Object.assign({}, fetchInit, { body: compressedFD });
      var imgResp = await origFetchFn.call(window, fetchInput, imgInit);
      if (imgResp.ok) {
        var imgData = await imgResp.json();
        if (Array.isArray(imgData)) allResults = allResults.concat(imgData);
      }
    }

    // Then queue videos
    for (var k = 0; k < videoFiles.length; k++) {
      idx++;
      var vf = videoFiles[k];
      var task = {
        file: vf,
        name: vf.name,
        isVideo: true,
        idx: idx,
        total: total,
        authHeader: authHeader,
      };
      await processVideoUpload(task);
      // We can't easily aggregate video results since they upload separately
    }

    // For video-only uploads, return a synthetic response so Strapi doesn't error out
    if (imageFiles.length === 0 && videoFiles.length > 0) {
      // The videos were uploaded to /compress which already stores them in Strapi.
      // Return a response that the admin panel can handle.
      // Since each video upload goes to /compress separately, we have results there.
      // But the admin panel expects a single response for this request.
      // We return an empty success — the files are already in the media library.
      var syntheticResp = new Response(JSON.stringify(allResults), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
      return syntheticResp;
    }

    // Fallback: original upload
    if (origFetchFn) return origFetchFn.call(window, fetchInput, fetchInit);
  }
})();
`;
  document.head.appendChild(script);
}
