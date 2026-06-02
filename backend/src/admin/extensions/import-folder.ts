export function injectImportFolderUI() {
  const SCRIPT_ID = 'project-folder-import-injector';

  if (document.getElementById(SCRIPT_ID)) return;

  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.textContent = `
(function() {
  'use strict';

  const POLL_MS = 1000;
  const JWT_KEY = 'jwtToken';
  let cachedFolders = null; // Cache folder list to avoid querying multiple times

  function getToken() {
    return sessionStorage.getItem(JWT_KEY) || localStorage.getItem(JWT_KEY) || '';
  }

  function getStrapiOrigin() {
    return window.location.origin;
  }

  /** Find the field container by checking label text prefix */
  function findFieldContainer(fieldName) {
    const labels = document.querySelectorAll('label');
    for (const label of labels) {
      const text = (label.textContent || '').trim().toLowerCase();
      if (text.startsWith(fieldName.toLowerCase())) {
        return label.closest('[class*="Field"]') || label.closest('[class*="field"]') || label.parentElement;
      }
    }
    return null;
  }

  /** Parse current edit entry type and documentId from URL */
  function parseEntryFromUrl() {
    const m = window.location.pathname.match(
      /\\/content-manager\\/collection-types\\/([^/]+)\\/([^/?]+)/
    );
    if (!m) return null;
    const [, rawType, docId] = m;
    const parts = rawType.split('.');
    const collection = (parts[parts.length - 1] || '').toLowerCase();
    return { collection, documentId: docId };
  }

  /** Fetch media library folders */
  async function fetchFolders() {
    if (cachedFolders) return cachedFolders;
    try {
      const resp = await fetch(getStrapiOrigin() + '/upload/folders?pageSize=100', {
        headers: { Authorization: 'Bearer ' + getToken() }
      });
      if (resp.ok) {
        const data = await resp.json();
        // Strapi 5 might return folders in data array or data.data
        const folders = data.data || data;
        if (Array.isArray(folders)) {
          cachedFolders = folders.map(f => ({ id: f.id, name: f.name }));
          return cachedFolders;
        }
      }
    } catch (err) {
      console.error('[Import Folder] Failed to fetch folders:', err);
    }
    return [];
  }

  /** Inject UI into a specific container if not already injected */
  async function injectUIForField(fieldName, type) {
    const container = findFieldContainer(fieldName);
    if (!container) return;

    // Check if already injected
    if (container.querySelector('.project-folder-import-container')) return;

    const folders = await fetchFolders();
    if (!folders || folders.length === 0) return;

    // Create container
    const importDiv = document.createElement('div');
    importDiv.className = 'project-folder-import-container';
    importDiv.style.cssText = 'margin-top: 10px; padding: 12px; background: #18181c; border: 1px solid #323238; border-radius: 4px; display: flex; align-items: center; gap: 10px; width: 100%; box-sizing: border-box;';

    // Label
    const span = document.createElement('span');
    span.style.cssText = 'font-size: 12px; color: #c1c1d6; font-weight: 500; white-space: nowrap;';
    span.textContent = '📂 批量导入文件夹:';
    importDiv.appendChild(span);

    // Select
    const select = document.createElement('select');
    select.className = 'project-folder-select';
    select.style.cssText = 'flex: 1; padding: 6px 10px; background: #212127; color: #e2e2e9; border: 1px solid #4a4a5a; border-radius: 4px; font-size: 12px; outline: none; cursor: pointer; min-width: 120px;';
    
    const defOption = document.createElement('option');
    defOption.value = '';
    defOption.textContent = '-- 选择媒体库文件夹 --';
    select.appendChild(defOption);

    folders.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      select.appendChild(opt);
    });
    importDiv.appendChild(select);

    // Button
    const btn = document.createElement('button');
    btn.className = 'project-folder-import-btn';
    btn.style.cssText = 'padding: 6px 12px; background: #10b981; color: #fff; border: none; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; transition: background 0.2s; white-space: nowrap;';
    btn.textContent = '导入';
    
    // Status text
    const statusSpan = document.createElement('span');
    statusSpan.style.cssText = 'font-size: 12px; font-weight: 500; display: none; margin-left: 5px;';
    
    btn.onclick = async (e) => {
      e.preventDefault();
      const folderId = select.value;
      if (!folderId) {
        alert('请先选择一个媒体库文件夹！');
        return;
      }

      const entry = parseEntryFromUrl();
      if (!entry || !entry.documentId) {
        alert('无法解析当前项目的信息');
        return;
      }

      // Disable inputs
      select.disabled = true;
      btn.disabled = true;
      btn.style.background = '#4b5563';
      btn.textContent = '导入中...';

      statusSpan.style.display = 'inline-block';
      statusSpan.style.color = '#34d399';
      statusSpan.textContent = '⏳ 正在导入...';

      try {
        const resp = await fetch(getStrapiOrigin() + '/api/projects/' + encodeURIComponent(entry.documentId) + '/import-folder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + getToken()
          },
          body: JSON.stringify({ folderId: parseInt(folderId), type })
        });

        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error?.message || '导入失败: ' + resp.status);
        }

        const res = await resp.json();
        statusSpan.style.color = '#34d399';
        statusSpan.textContent = '✅ ' + (res.message || '导入成功！');
        btn.textContent = '成功';

        // Reload page after a delay to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);

      } catch (err) {
        console.error('[Import Folder]', err);
        statusSpan.style.color = '#f87171';
        statusSpan.textContent = '❌ ' + (err.message || '导入失败');
        
        // Reset state
        setTimeout(() => {
          select.disabled = false;
          btn.disabled = false;
          btn.style.background = '#10b981';
          btn.textContent = '导入';
          statusSpan.style.display = 'none';
        }, 3000);
      }
    };

    importDiv.appendChild(btn);
    importDiv.appendChild(statusSpan);

    // Append to container
    container.appendChild(importDiv);
    console.log('[Import Folder] Injected UI for', fieldName);
  }

  /** Main tick flow */
  async function checkAndInject() {
    const entry = parseEntryFromUrl();
    if (entry && entry.collection === 'project') {
      // Inject for both videos and images fields
      await injectUIForField('videos', 'video');
      await injectUIForField('images', 'image');
    }
  }

  function tick() {
    if (window.location.pathname.includes('/content-manager/')) {
      checkAndInject();
    }
    setTimeout(tick, POLL_MS);
  }

  setTimeout(tick, 1500);
})();
  `;

  document.head.appendChild(script);
}
