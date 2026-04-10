const api = {
    async fetchWorks() {
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/works?populate=*`);
            if (res.ok) {
                const worksData = await res.json();
                if (worksData.data && worksData.data.length > 0) {
                    return worksData.data.map(item => {
                        let coverUrl = null;
                        if (item.cover) {
                            // Extract the first item if cover is an array (due to multiple: true), otherwise use it directly
                            const coverObj = Array.isArray(item.cover) ? item.cover[0] : item.cover;
                            if (coverObj && coverObj.url) {
                                coverUrl = coverObj.url.startsWith('http')
                                    ? coverObj.url
                                    : CONFIG.API_URL + coverObj.url;
                            }
                        }

                        return {
                            id: item.id,
                            type: item.type || 'video',
                            title: item.title || '未命名作品',
                            spend: item.spend || 0,
                            roi: item.roi || 0,
                            ctr: item.ctr ? item.ctr + '%' : '-',
                            cvr: item.cvr ? item.cvr + '%' : '-',
                            platform: item.platform || '-',
                            game: item.game || '-',
                            launch_time: item.launch_time ? item.launch_time.split('T')[0] : '-',
                            videoUrl: item.video_url || '#',
                            feishuUrl: item.feishu_url || '',
                            coverUrl: coverUrl
                        };
                    });
                }
            }
            return db.works;
        } catch (error) {
            console.warn("未能连接到 Strapi 后端，正在使用本地兜底数据展示效果。", error);
            return db.works;
        }
    },

    async fetchArticles() {
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/articles?populate=*`);
            if (res.ok) {
                const articlesData = await res.json();
                if (articlesData.data && articlesData.data.length > 0) {
                    return articlesData.data.map(item => {
                        return {
                            id: item.id,
                            title: item.title || '未命名文章',
                            summary: item.summary || '',
                            date: item.publish_date || item.createdAt.split('T')[0],
                            content_link: item.content_link || '#'
                        };
                    });
                }
            }
            return db.articles;
        } catch (error) {
            console.warn("未能连接到 Strapi 后端读取洞察数据。", error);
            return db.articles;
        }
    },

    async fetchAbout() {
        try {
            const res = await fetch(`${CONFIG.API_URL}/api/abouts`);
            if (res.ok) {
                const aboutData = await res.json();
                if (aboutData.data && aboutData.data.length > 0) {
                    const item = aboutData.data[0];
                    return {
                        title: item.title || db.profile.bio_title,
                        content: item.content || db.profile.bio
                    };
                }
            }
            return { title: db.profile.bio_title, content: db.profile.bio };
        } catch (error) {
            console.warn("未能连接到 Strapi 后端读取简介数据。", error);
            return { title: db.profile.bio_title, content: db.profile.bio };
        }
    },
    
    // 供首页和推荐列表使用
    async fetchFeedItems(filterType) {
        let works = await this.fetchWorks();
        let articles = await this.fetchArticles();
        
        let combinedItems = [];
        if (filterType === 'recommend') {
            const recommendedWorks = [...works].sort((a, b) => b.spend - a.spend).slice(0, 3);
            combinedItems = [...recommendedWorks, ...articles];
        } else if (filterType === 'high-spend') {
            combinedItems = [...works].sort((a, b) => b.spend - a.spend);
        } else if (filterType === 'video' || filterType === 'image') {
            combinedItems = works.filter(w => w.type === filterType);
        } else if (filterType === 'article') {
            combinedItems = articles;
        }
        return combinedItems;
    }
};
