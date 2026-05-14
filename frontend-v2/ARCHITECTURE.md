# 🚀 Portfolio System Architecture & Infra Spec

本项目已完成从“本地化”向“全云端、全自动化”架构的全面转型。

## 1. 核心架构拓扑
- **前端 (Frontend)**: Next.js 14+ (App Router)
- **后端 (Backend/CMS)**: Strapi 5 (Strapi Cloud 托管)
- **数据库 (Database)**: PostgreSQL (Neon Serverless)
- **对象存储 (Storage)**: Cloudflare R2 / Strapi Cloud Media
- **部署平台 (Deployment)**: Vercel (Edge Network)

## 2. 关键云端地址 (Cloud Links)

### 🌍 访问终端
- **正式域名**: [https://wcyblog.space](https://wcyblog.space)
- **Vercel 备用域名**: [https://portfolio-chenyang-s-projects.vercel.app](https://portfolio-chenyang-s-projects.vercel.app)

### ⚙️ 管理后台
- **Strapi CMS Admin**: [https://dazzling-family-6d1f24102d.strapiapp.com/admin](https://dazzling-family-6d1f24102d.strapiapp.com/admin)
  *(用于发布作品、编辑简历和博文)*
- **Strapi API Endpoint**: `https://dazzling-family-6d1f24102d.strapiapp.com/api`

### 💾 基础设施控制台
- **Vercel 控制台**: [https://vercel.com/chenyang-s-projects/portfolio](https://vercel.com/chenyang-s-projects/portfolio)
- **Neon 数据库**: [https://console.neon.tech/](https://console.neon.tech/)
- **Cloudflare R2**: [https://dash.cloudflare.com/](https://dash.cloudflare.com/)

## 3. 技术特性
- **ISR (Incremental Static Regeneration)**: 前端页面每 60 秒自动检查后端更新，实现“发布即同步”且不牺牲访问速度。
- **Vercel Edge Proxy**: 所有 Strapi 云端媒体文件通过 `/strapi-media/` 路径进行全球边缘加速，并自动解决跨域 (CORS) 问题。
- **Auto-Thumbnail**: 系统自动提取视频 1.0s 处画面作为预览封面，无需手动切图。

## 4. 环境配置参考 (Vercel ENV)
| Key | Value (Example) |
| :--- | :--- |
| `NEXT_PUBLIC_STRAPI_URL` | `https://dazzling-family-6d1f24102d.strapiapp.com` |
🔑 令牌信息
名称：Antigravity-Fast-Access
权限：Full Access (全权限)
用途：由我（AI 助手）直接通过代码操控 Strapi 云端数据。
为了安全和后续使用，我已经把这个令牌保存在了你的本地环境变量文件 .env.local 中（Key 名为 STRAPI_ADMIN_TOKEN）。
---
*Last Updated: 2026-05-14*
*By: Antigravity AI Assistant*
