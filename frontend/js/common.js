// 渲染全站统一导航和弹窗
function renderGlobalComponents() {
    const navHTML = `
    <nav class="fixed top-3 left-3 right-3 z-50 glass-nav rounded-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="index.html" class="flex-shrink-0 flex items-center gap-3">
                    <img src="images/logo.png" alt="Logo" class="w-10 h-10 rounded-md" style="image-rendering: pixelated;">
                    <span class="font-black text-xl tracking-tight hidden sm:block text-white" style="font-family: 'Press Start 2P', monospace; font-size: 0.75rem;">Alessio</span>
                </a>
                <div class="flex space-x-2 sm:space-x-8 overflow-x-auto no-scrollbar items-center">
                    <a href="index.html" id="nav-home" class="relative px-3 sm:px-4 py-3 font-bold text-textmuted hover:text-white transition-colors whitespace-nowrap">首页</a>
                    <a href="resume.html" id="nav-resume" class="relative px-3 sm:px-4 py-3 font-bold text-textmuted hover:text-white transition-colors whitespace-nowrap">简历</a>
                    <a href="portfolio.html" id="nav-portfolio" class="relative px-3 sm:px-4 py-3 font-bold text-textmuted hover:text-white transition-colors whitespace-nowrap">作品集</a>
                    <a href="insights.html" id="nav-insights" class="relative px-3 sm:px-4 py-3 font-bold text-textmuted hover:text-white transition-colors whitespace-nowrap">灵感文章</a>
                </div>
            </div>
        </div>
    </nav>
    `;

    const modalHTML = `
    <div id="contact-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onclick="closeContactModal()"></div>
        <div id="contact-modal-content" class="relative rico-card p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-95 opacity-0 text-center">
            <button onclick="closeContactModal()" class="absolute top-4 right-4 text-stone-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
            <div class="text-4xl mb-3 drop-shadow-md">🔓</div>
            <h3 class="text-2xl font-black text-textmain mb-1">英雄已解锁</h3>
            <p class="text-sm text-textmuted mb-6">获取联系方式，开启您的爆款增长之旅</p>
            <div class="w-24 h-24 mx-auto rounded-md bg-gradient-to-tr from-[#ff465a] to-[#c246ff] flex flex-col items-center justify-center text-white shadow-lg mb-6 border border-[#ff465a]/70">
                <span class="text-3xl font-bold" id="modal-avatar-text">${db.profile.name.charAt(0)}</span>
            </div>
            <div class="bg-stone-50 rounded-md p-4 mb-6 border border-stone-100">
                <div class="text-xs text-textmuted mb-1 uppercase tracking-wider">联系电话 (微信同号)</div>
                <div class="text-2xl font-bold text-brand tracking-wide" id="modal-phone">${db.profile.phone}</div>
            </div>
            <button onclick="copyPhone()" class="w-full cyber-button font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2">
                <span id="copy-icon">📋</span> <span id="copy-text">一键复制号码</span>
            </button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const path = window.location.pathname;
    const fileName = path.split('/').pop() || 'index.html';
    
    let actId = 'nav-home';
    if (fileName === 'index.html' || fileName === '') actId = 'nav-home';
    else if (fileName.includes('resume')) actId = 'nav-resume';
    else if (fileName.includes('portfolio')) actId = 'nav-portfolio';
    else if (fileName.includes('insights') || fileName.includes('article')) actId = 'nav-insights';
    
    const activeEl = document.getElementById(actId);
    if (activeEl) {
        activeEl.classList.add('nav-active');
        activeEl.classList.remove('text-textmuted');
    }
}

function openContactModal() {
    const modal = document.getElementById('contact-modal');
    const content = document.getElementById('contact-modal-content');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    });
}

function closeContactModal() {
    const modal = document.getElementById('contact-modal');
    const content = document.getElementById('contact-modal-content');
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function copyPhone() {
    const textToCopy = db.profile.phone;
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        document.getElementById('copy-icon').innerText = '✅';
        document.getElementById('copy-text').innerText = '复制成功';
        setTimeout(() => closeContactModal(), 1500);
    } catch (err) {}
    document.body.removeChild(textArea);
}

function formatMoney(num) {
    if (num === 0) return '0';
    return num >= 10000 ? (num / 10000).toFixed(1) + 'w' : num;
}

/**
 * 智能返回上一页，如果无来源则跳转到保底 URL
 * @param {Event} e 
 * @param {string} fallbackUrl 
 */
function goBack(e, fallbackUrl) {
    const isLocal = window.location.protocol === 'file:';
    const hasReferrer = document.referrer && (
        document.referrer.includes(window.location.host) || 
        document.referrer.includes('localhost') || 
        document.referrer.includes('127.0.0.1')
    );

    if (hasReferrer || (window.history.length > 1 && !isLocal)) {
        e.preventDefault();
        history.back();
    } else if (fallbackUrl) {
        // 如果由于刷新导致历史丢失，才跳转到保底页面
        window.location.href = fallbackUrl;
    }
}

function generateWorkCard(item) {
    const isVideo = item.type === 'video';
    const icon = isVideo ? '▶' : '🖼️';
    const bgStyle = item.coverUrl ? `background-image: url('${item.coverUrl}'); background-size: cover; background-position: center; border:none;` : '';

    let mediaContent = '';
    if (!item.coverUrl && isVideo && item.videoUrl && item.videoUrl !== '#') {
        mediaContent = `<video src="${item.videoUrl}#t=0.001" class="absolute inset-0 w-full h-full object-cover" preload="metadata" muted playsinline></video>`;
    }

    return `
    <a href="portfolio-detail.html?id=${item.id}" class="rico-card fade-in block group overflow-hidden transition-all duration-300 flex flex-col h-[26rem]">
        <div class="relative w-full flex-1 overflow-hidden min-h-0">
            ${mediaContent}
            <div class="absolute inset-0 z-0 bg-stone-100 transition-transform duration-700 group-hover:scale-105" style="${bgStyle}"></div>
            <div class="${(item.coverUrl || mediaContent) ? 'absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-colors z-10' : ''}"></div>
            <div class="absolute inset-0 flex items-center justify-center z-20">
                <div class="text-4xl text-white opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-lg ${(item.coverUrl || mediaContent) ? 'bg-black/50 w-16 h-16 rounded-md border border-[#c246ff]/60 flex items-center justify-center' : ''}">
                    ${icon}
                </div>
            </div>
        </div>
        <div class="p-5 z-30 flex flex-col justify-between shrink-0 h-36 border-t border-[#ff465a]/20">
            <div>
                <div class="text-xs cyber-title mb-1">${isVideo ? '视频作品' : '图片素材'}</div>
                <h3 class="font-black text-xl text-white leading-tight line-clamp-1 mb-1">${item.title}</h3>
                <div class="flex items-center gap-2 text-sm font-bold text-stone-500">
                    <span class="w-5 h-5 rounded bg-gradient-to-tr from-[#ff465a] to-[#c246ff] text-white flex items-center justify-center text-[10px]">A</span>
                    @Rico.Design
                </div>
            </div>
            <div class="flex justify-between items-end mt-2">
                <div>
                    <div class="text-[10px] text-stone-400 font-bold uppercase tracking-wider mb-0.5">${item.game !== '-' ? item.game : item.type} ROI</div>
                    <div class="font-black text-lg text-white inline-flex items-center gap-1"><span class="text-xs text-stone-500">🔥 消耗 ${formatMoney(item.spend)}</span> ${item.roi}</div>
                </div>
                <div class="w-8 h-8 rounded border border-[#c246ff]/40 flex items-center justify-center text-[#c246ff] hover:text-[#ff465a] hover:border-[#ff465a] transition-colors">
                    ♥
                </div>
            </div>
        </div>
    </a>`;
}

function generateArticleCard(item) {
    return `
    <a href="article-detail.html?id=${item.id}" class="rico-card fade-in block flex flex-col h-[26rem] transition-all duration-300 overflow-hidden group">
        <div class="w-full h-44 bg-stone-100 relative overflow-hidden shrink-0">
            <div class="absolute inset-0 bg-gradient-to-br from-[#20133b] to-[#3b1126] flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                <span class="text-6xl">📝</span>
            </div>
        </div>
        <div class="p-6 flex flex-col flex-1 text-left">
            <div class="flex items-center gap-2 text-sm font-bold text-stone-500 mb-3">
                <span class="w-5 h-5 rounded bg-[#c246ff] text-white flex items-center justify-center text-[10px]">A</span>
                @Rico.Design
            </div>
            <h3 class="font-black text-xl text-white leading-tight mb-2 line-clamp-2">${item.title}</h3>
            <p class="text-sm text-textmuted line-clamp-3 leading-relaxed mb-4 flex-1">${item.summary}</p>
            <div class="font-black text-sm text-white flex items-center gap-1 uppercase tracking-wider">
                ${item.date} <span class="ml-auto flex items-center justify-center w-8 h-8 rounded border border-[#c246ff]/40 group-hover:bg-[#c246ff] group-hover:text-white transition-colors">→</span>
            </div>
        </div>
    </a>`;
}

/**
 * 渲染 Strapi Blocks (富文本) 内容为 HTML
 * @param {Array} blocks Strapi 返回的 blocks 数组
 */
function renderBlocks(blocks) {
    if (!blocks || !Array.isArray(blocks)) return typeof blocks === 'string' ? blocks : '';
    return blocks.map(block => {
        switch (block.type) {
            case 'paragraph':
                return `<p class="mb-4 leading-relaxed text-justify text-stone-600">${renderInlineNodes(block.children)}</p>`;
            case 'heading':
                const level = block.level || 1;
                const sizeClasses = { 1: 'text-3xl', 2: 'text-2xl', 3: 'text-xl', 4: 'text-lg', 5: 'text-base', 6: 'text-sm' };
                return `<h${level} class="${sizeClasses[level]} font-bold mb-4 text-textmain mt-6">${renderInlineNodes(block.children)}</h${level}>`;
            case 'list':
                const tag = block.format === 'ordered' ? 'ol' : 'ul';
                const listClass = block.format === 'ordered' ? 'list-decimal ml-6 space-y-2 mb-4 text-stone-600' : 'list-disc ml-6 space-y-2 mb-4 text-stone-600';
                return `<${tag} class="${listClass}">${block.children.map(li => `<li>${renderInlineNodes(li.children)}</li>`).join('')}</${tag}>`;
            case 'quote':
                return `<blockquote class="border-l-4 border-brand pl-4 italic my-6 text-stone-500 bg-stone-50 py-2">${renderInlineNodes(block.children)}</blockquote>`;
            case 'code':
                return `<pre class="bg-stone-900 text-stone-100 p-4 rounded-xl my-6 overflow-x-auto text-sm font-mono"><code>${renderInlineNodes(block.children)}</code></pre>`;
            case 'image':
                const url = block.image.url.startsWith('http') ? block.image.url : (CONFIG.API_URL + block.image.url);
                return `<div class="my-6 rounded-2xl overflow-hidden shadow-md"><img src="${url}" alt="${block.image.alternativeText || ''}" class="w-full h-auto"></div>`;
            default:
                return '';
        }
    }).join('');
}

function renderInlineNodes(children) {
    if (!children) return '';
    return children.map(node => {
        if (node.type === 'text') {
            let text = node.text || '';
            if (node.bold) text = `<strong>${text}</strong>`;
            if (node.italic) text = `<em>${text}</em>`;
            if (node.underline) text = `<u>${text}</u>`;
            if (node.strikethrough) text = `<s>${text}</s>`;
            if (node.code) text = `<code class="bg-stone-100 px-1.5 py-0.5 rounded text-sm font-mono">${text}</code>`;
            return text;
        }
        if (node.type === 'link') {
            return `<a href="${node.url}" target="_blank" class="text-brand hover:underline font-medium">${renderInlineNodes(node.children)}</a>`;
        }
        return '';
    }).join('');
}

// 处理浏览器前进后退 (传统模式下此监听器通常不再需要，但保留为空或移除均可)
// window.addEventListener('popstate', () => { ... });

document.addEventListener('DOMContentLoaded', () => {
    // 自动在任何引入该脚本的页面注入导航和弹窗结构
    renderGlobalComponents();
    // 执行页面特有的初始化逻辑 (每个页面刷新后都会重新执行自己的脚本)
    if (window.initPage) window.initPage();
});
