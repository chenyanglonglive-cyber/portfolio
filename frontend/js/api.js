const api = {
    _hash(obj) {
        return btoa(unescape(encodeURIComponent(JSON.stringify(obj)))).substring(0, 32);
    },

    cache: {
        get(key) {
            try {
                const data = localStorage.getItem(`cache_${key}`);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                return null;
            }
        },
        set(key, data) {
            try {
                localStorage.setItem(`cache_${key}`, JSON.stringify(data));
            } catch (e) {}
        }
    },

    _getItem(obj) {
        return obj && obj.attributes ? { id: obj.id, ...obj.attributes } : (obj || {});
    },

    _absoluteUrl(url) {
        if (!url) return null;
        if (url.startsWith('#')) return url;
        if (url.startsWith('//')) return window.location.protocol + url;
        return url.startsWith('http') ? url : CONFIG.API_URL + url;
    },

    _mediaUrl(mediaField) {
        if (!mediaField) return null;

        let media = mediaField;
        if (media.data !== undefined) media = media.data;
        if (Array.isArray(media)) media = media[0];
        if (!media) return null;

        const attr = media.attributes || media;
        const directUrl = attr.url;
        const formatUrl =
            attr.formats?.large?.url ||
            attr.formats?.medium?.url ||
            attr.formats?.small?.url ||
            attr.formats?.thumbnail?.url;

        return this._absoluteUrl(directUrl || formatUrl);
    },

    async _fetchJson(path, timeoutMs = 4500) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const res = await fetch(`${CONFIG.API_URL}${path}`, { signal: controller.signal });
            if (!res.ok) return null;
            return await res.json();
        } finally {
            clearTimeout(timeoutId);
        }
    },

    async fetchWorks() {
        const cacheKey = 'works';
        const cached = this.cache.get(cacheKey);

        try {
            const worksData = await this._fetchJson('/api/works?populate=*');
            if (worksData && Array.isArray(worksData.data)) {
                    const items = worksData.data.map(obj => {
                        const item = this._getItem(obj);
                        return {
                            id: item.id,
                            type: item.type || 'video',
                            title: item.title || '无标题',
                            spend: Number(item.spend) || 0,
                            roi: item.roi || 0,
                            ctr: item.ctr || '-',
                            cvr: item.cvr || '-',
                            game: item.game || '-',
                            launch_time: item.launch_time || '-',
                            platform: item.platform || '-',
                            videoUrl: this._absoluteUrl(item.video_url) || '#',
                            feishuUrl: item.feishu_url || '',
                            coverUrl: this._mediaUrl(item.cover)
                        };
                    });

                    if (cached && this._hash(cached) === this._hash(items)) return cached;

                    this.cache.set(cacheKey, items);
                    return items;
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
            const data = await this._fetchJson('/api/articles?populate=*');
            if (data && Array.isArray(data.data)) {
                    const items = data.data.map(obj => {
                        const item = this._getItem(obj);
                        const createdAt = item.createdAt || obj.createdAt;
                        return {
                            id: item.id || obj.id,
                            title: item.title || '无标题',
                            summary: item.summary || '',
                            date: item.publish_date || (createdAt ? createdAt.split('T')[0] : '')
                        };
                    });

                    if (cached && this._hash(cached) === this._hash(items)) return cached;

                    this.cache.set(cacheKey, items);
                    return items;
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
            const aboutData = await this._fetchJson('/api/abouts');
            if (aboutData) {
                const aboutItems = Array.isArray(aboutData.data) ? aboutData.data : [aboutData.data].filter(Boolean);
                if (aboutItems.length > 0) {
                    const item = this._getItem(aboutItems[0]);
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
        const [worksResult, articlesResult] = await Promise.allSettled([
            this.fetchWorks(),
            this.fetchArticles()
        ]);

        const works = worksResult.status === 'fulfilled' ? worksResult.value : (this.cache.get('works') || db.works);
        const articles = articlesResult.status === 'fulfilled' ? articlesResult.value : (this.cache.get('articles') || db.articles);

        if (filterType === 'recommend') {
            return [...works].sort((a, b) => b.spend - a.spend).slice(0, 3).concat(articles);
        }
        if (filterType === 'high-spend') return [...works].sort((a, b) => b.spend - a.spend);
        if (filterType === 'article') return articles;
        return works.filter(w => w.type === filterType);
    }
};
