const api = {
    // 辅助方法：生成简单的内容哈希，用于对比数据是否有变动
    _hash(obj) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).substring(0, 32);
    },

    // 缓存管理器（公开供页面瞬时回显）
    cache: {
        get(key) {
            try {
                const data = localStorage.getItem(`cache_${key}`);
                return data ? JSON.parse(data) : null;
            } catch(e) { return null; }
        },
        set(key, data) {
            localStorage.setItem(`cache_${key}`, JSON.stringify(data));
        }
    },

    async fetchWorks() {
        const cacheKey = 'works';
        const cached = this.cache.get(cacheKey);
        
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/works?populate=*`);
            if (res.ok) {
                const worksData = await res.json();
                if (worksData.data) {
                    const items = worksData.data.map(obj => {
                        const item = obj.attributes || obj;
                        item.id = obj.id;
                        let coverUrl = null;
                        if (item.cover && item.cover.data) {
                            const media = Array.isArray(item.cover.data) ? item.cover.data[0] : item.cover.data;
                            const attr = media.attributes || media;
                            coverUrl = attr.url ? (attr.url.startsWith('http') ? attr.url : CONFIG.API_URL + attr.url) : null;
                        }
                        return {
                            id: item.id,
                            type: item.type || 'video',
                            title: item.title,
                            spend: item.spend || 0,
                            roi: item.roi || 0,
                            ctr: item.ctr || '-',
                            cvr: item.cvr || '-',
                            game: item.game || '-',
                            launch_time: item.launch_time || '-',
                            platform: item.platform || '-',
                            videoUrl: item.video_url || '#',
                            feishuUrl: item.feishu_url || '',
                            coverUrl: coverUrl
                        };
                    });
                    
                    // 如果内容没变，不更新
                    if (cached && this._hash(cached) === this._hash(items)) return cached;
                    
                    this.cache.set(cacheKey, items);
                    return items;
                }
            }
            return cached || db.works;
        } catch (error) {
            return cached || db.works;
        }
    },

    async fetchArticles() {
        const cacheKey = 'articles';
        const cached = this.cache.get(cacheKey);
        
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/articles?populate=*`);
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    const items = data.data.map(obj => {
                        const item = obj.attributes || obj;
                        return {
                            id: obj.id, title: item.title, summary: item.summary,
                            date: item.publish_date || obj.attributes.createdAt.split('T')[0]
                        };
                    });
                    if (cached && this._hash(cached) === this._hash(items)) return cached;
                    this.cache.set(cacheKey, items);
                    return items;
                }
            }
            return cached || db.articles;
        } catch (error) {
            return cached || db.articles;
        }
    },

    async fetchAbout() {
        const cacheKey = 'about';
        const cached = this.cache.get(cacheKey);
        
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/abouts`);
            if (res.ok) {
                const aboutData = await res.json();
                if (aboutData.data && aboutData.data.length > 0) {
                    const item = aboutData.data[0].attributes || aboutData.data[0];
                    const data = { title: item.title, content: item.content };
                    if (cached && this._hash(cached) === this._hash(data)) return cached;
                    this.cache.set(cacheKey, data);
                    return data;
                }
            }
            return cached || { title: "", content: "" };
        } catch (error) {
            return cached || { title: "", content: "" };
        }
    },
    
    async fetchFeedItems(filterType) {
        let works = await this.fetchWorks();
        let articles = await this.fetchArticles();
        if (filterType === 'recommend') return [...works].sort((a, b) => b.spend - a.spend).slice(0, 3).concat(articles);
        if (filterType === 'high-spend') return [...works].sort((a, b) => b.spend - a.spend);
        if (filterType === 'article') return articles;
        return works.filter(w => w.type === filterType);
    }
};
