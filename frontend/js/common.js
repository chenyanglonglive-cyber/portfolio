// 渲染全站统一导航和弹窗
function renderGlobalComponents() {
    const navHTML = `
    <nav class="glass-nav fixed top-0 w-full z-50">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <a href="index.html" class="flex-shrink-0 flex items-center gap-2">
                    <div class="w-8 h-8 bg-brand rounded-lg flex items-center justify-center text-white font-bold">R.</div>
                    <span class="font-bold text-xl tracking-tight hidden sm:block">Rico.Design</span>
                </a>
                <div class="flex space-x-1 sm:space-x-4 overflow-x-auto no-scrollbar">
                    <a href="index.html" id="nav-home" class="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-textmuted hover:text-textmain transition-colors whitespace-nowrap">首页</a>
                    <a href="resume.html" id="nav-resume" class="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-textmuted hover:text-textmain transition-colors whitespace-nowrap">简历</a>
                    <a href="portfolio.html" id="nav-portfolio" class="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-textmuted hover:text-textmain transition-colors whitespace-nowrap">作品集</a>
                    <a href="insights.html" id="nav-insights" class="px-3 sm:px-4 py-2 rounded-full text-sm font-medium text-textmuted hover:text-textmain transition-colors whitespace-nowrap">复盘文章</a>
                </div>
            </div>
        </div>
    </nav>
    `;

    const modalHTML = `
    <div id="contact-modal" class="fixed inset-0 z-[100] hidden flex items-center justify-center">
        <div class="absolute inset-0 bg-stone-900/40 backdrop-blur-sm transition-opacity" onclick="closeContactModal()"></div>
        <div id="contact-modal-content" class="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-95 opacity-0 text-center">
            <button onclick="closeContactModal()" class="absolute top-4 right-4 text-stone-400 hover:text-textmain transition-colors text-2xl leading-none">&times;</button>
            <div class="text-4xl mb-3 drop-shadow-md">🎉</div>
            <h3 class="text-2xl font-black text-textmain mb-1">英雄已解锁</h3>
            <p class="text-sm text-textmuted mb-6">获取联系方式，开启您的爆款增长之旅</p>
            <div class="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-brand to-purple-400 flex flex-col items-center justify-center text-white shadow-lg mb-6 border-4 border-white ring-4 ring-indigo-50">
                <span class="text-3xl font-bold" id="modal-avatar-text">${db.profile.name.charAt(0)}</span>
            </div>
            <div class="bg-stone-50 rounded-2xl p-4 mb-6 border border-stone-100">
                <div class="text-xs text-textmuted mb-1 uppercase tracking-wider">联系电话 (微信同号)</div>
                <div class="text-2xl font-bold text-brand tracking-wide" id="modal-phone">${db.profile.phone}</div>
            </div>
            <button onclick="copyPhone()" class="w-full bg-textmain hover:bg-black text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                <span id="copy-icon">📋</span> <span id="copy-text">一键复制号码</span>
            </button>
        </div>
    </div>
    `;

    document.body.insertAdjacentHTML('afterbegin', navHTML);
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const path = window.location.pathname;
    let actId = 'nav-home';
    if (path.includes('resume')) actId = 'nav-resume';
    else if (path.includes('portfolio')) actId = 'nav-portfolio';
    else if (path.includes('insights') || path.includes('article')) actId = 'nav-insights';
    
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

function generateWorkCard(item) {
    const isVideo = item.type === 'video';
    const icon = isVideo ? '▶' : '🖼️';
    const bgClass = isVideo ? 'media-placeholder' : 'media-placeholder img-type';
    const bgStyle = item.coverUrl ? `background-image: url('${item.coverUrl}'); background-size: cover; background-position: center;` : '';

    let mediaContent = '';
    if (!item.coverUrl && isVideo && item.doc && item.doc !== '#') {
        mediaContent = `<video src="${item.doc}#t=0.001" class="absolute inset-0 w-full h-full object-cover" preload="metadata" muted playsinline></video>`;
    }

    return `
    <a href="portfolio-detail.html?id=${item.id}" class="rico-card fade-in block group">
        <div class="w-full h-64 ${bgClass} relative overflow-hidden flex items-center justify-center" style="${bgStyle}">
            ${mediaContent}
            <div class="${(item.coverUrl || mediaContent) ? 'absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-0' : ''}"></div>
            <div class="z-10 text-4xl text-white opacity-50 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-lg ${(item.coverUrl || mediaContent) ? 'bg-black/40 w-16 h-16 rounded-full flex items-center justify-center' : ''}">
                ${icon}
            </div>
            <div class="z-10 data-overlay absolute bottom-0 left-0 w-full p-4 pt-16 flex justify-between items-end text-white">
                <div>
                    <span class="text-xs font-medium opacity-80 uppercase tracking-wider">${item.game !== '-' ? item.game : item.type}</span>
                    <h3 class="font-bold text-lg leading-tight mt-1 line-clamp-1">${item.title}</h3>
                </div>
                <div class="text-right">
                    <div class="text-brand font-black bg-white px-2 py-1 rounded text-sm mb-1 inline-block shadow-md">ROI ${item.roi}</div>
                    <div class="text-xs font-medium text-red-300">🔥 消耗 ${formatMoney(item.spend)}</div>
                </div>
            </div>
        </div>
    </a>`;
}

function generateArticleCard(item) {
    return `
    <a href="article-detail.html?id=${item.id}" class="rico-card fade-in block p-6 flex flex-col justify-between h-64 border-t-4 border-t-stone-200 hover:border-t-brand content-between">
        <div>
            <div class="text-xs text-textmuted mb-3 font-mono">${item.date} ｜ 洞察文章</div>
            <h3 class="font-bold text-xl text-textmain leading-snug mb-3 line-clamp-2">${item.title}</h3>
            <p class="text-sm text-textmuted line-clamp-3">${item.summary}</p>
        </div>
        <div class="text-brand text-sm font-medium flex items-center mt-4">
            阅读完整复盘 <span class="ml-1">→</span>
        </div>
    </a>`;
}

document.addEventListener('DOMContentLoaded', () => {
    // 自动在任何引入该脚本的页面注入导航和弹窗结构
    renderGlobalComponents();
});
