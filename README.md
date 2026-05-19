# Wcy'Blog

个人博客/作品集，展示游戏广告设计作品。

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | Next.js 16 + React 19 + Tailwind CSS v4 + Framer Motion |
| 后端 | Strapi 5 + PostgreSQL |
| 部署 | Vercel（前端）+ 阿里云轻量服务器（后端/媒体） |

## 媒体概况

| 类型 | 单文件大小 | 总量 | 总计 |
|------|-----------|------|------|
| 视频 | ~10 MB | ~50 个 | ~500 MB |
| 图片 | 100-200 KB | ~50 个 | ~10 MB |

访问量极低（个人使用），核心要求：**视频和图片加载快**。

## 架构

```
用户(国内) ──→ Vercel ──→ 前端页面 (HTML/JS/CSS)
    │
    └──→ https://strapi.wcyblog.space ──→ ECS(国内) ──→ 媒体文件
                                                  └──→ Strapi API
```

- 页面走 Vercel CDN
- 媒体文件直连 ECS HTTPS，不绕 Vercel
- ECS：阿里云轻量服务器 2GB RAM，Ubuntu 24.04，nginx + certbot (SSL)

## 目录结构

```
portfolio/
├── frontend-v2/          # Next.js 前端
│   ├── src/
│   │   ├── app/          # 页面路由
│   │   ├── components/   # React 组件
│   │   ├── lib/          # Strapi 客户端、工具函数
│   │   └── types/        # TypeScript 类型
│   └── next.config.ts
├── backend/              # Strapi 5 后端
│   ├── src/api/          # 内容类型 (video, image, article, about)
│   ├── config/           # 服务器/数据库/中间件配置
│   └── scripts/          # 维护脚本
└── compress-service/     # 视频压缩服务（上传时使用）
```

## 本地开发

```bash
# 后端
cd backend && npm run develop

# 前端
cd frontend-v2 && npm run dev
```

## 部署

- **前端**：push 到 GitHub main 分支，Vercel 自动部署
- **后端**：本地 `npm run build`，SCP 上传 `dist/` 到 ECS，`pm2 restart strapi`
- **⚠️ 禁止在 ECS 上 build**（2GB 内存必 OOM）

## ECS 运维

```bash
ssh -i agent.pem root@47.95.242.40
pm2 list                    # strapi + compress 进程
pm2 restart strapi          # 重启后端
certbot renew               # 续期 SSL 证书（8 月到期）
node scripts/fix-covers-strapi.js  # 修复缺失视频封面
```
