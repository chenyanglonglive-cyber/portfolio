# Portfolio System Architecture & Infra Spec

本项目已完成从 Strapi Cloud → 阿里云 ECS 自建后端的全面迁移。

## 1. 核心架构拓扑

```
前端:  Vercel (Next.js 16 + ISR)  →  wcyblog.space
         │  HTTP (port 80)
         ▼
ECS:   阿里云 ECS 北京 (47.95.242.40)
         │  Nginx :80 → proxy_pass :1337
         │  Nginx :443 → HTTPS (Let's Encrypt)
         ▼
后端:  Strapi 5 (PM2 进程守护)
         │
         ▼
数据库: PostgreSQL 16 (本地, 同机部署)
存储:   本地磁盘 /var/www/strapi/public/uploads/
```

| 层 | 技术 | 位置 |
|---|---|---|
| 前端 | Next.js 16 (Turbopack) | Vercel (iad1) |
| 反向代理 | Nginx 1.24 | 阿里云 ECS |
| CMS | Strapi 5 | 阿里云 ECS (PM2) |
| 数据库 | PostgreSQL 16 | 阿里云 ECS (本地) |
| 媒体存储 | 本地磁盘 | ECS `/var/www/strapi/public/uploads/` |
| SSL | Let's Encrypt (certbot) | ECS, 自动续期 |

## 2. 关键地址

### 访问终端
- **正式域名**: [https://wcyblog.space](https://wcyblog.space)
- **Vercel 备用域名**: `https://portfolio-chenyang-s-projects.vercel.app`

### 管理后台
- **Strapi CMS Admin**: [https://strapi.wcyblog.space/admin](https://strapi.wcyblog.space/admin)
- **Strapi API**: `http://47.95.242.40/api`（Vercel 内部使用 HTTP + IP 直连）
- **ECS SSH**: `ssh -i agent.pem root@47.95.242.40`

### 基础设施控制台
- **Vercel**: [https://vercel.com/chenyang-s-projects/portfolio](https://vercel.com/chenyang-s-projects/portfolio)
- **阿里云 ECS**: [https://ecs.console.aliyun.com](https://ecs.console.aliyun.com) (账号 1525503540425498)
- **阿里云 DNS (HiChina)**: [https://dns.console.aliyun.com](https://dns.console.aliyun.com)

## 3. 网络设计决策

| 路径 | 协议 | 说明 |
|---|---|---|
| 用户 → 前端 | HTTPS | Vercel 自动 SSL |
| Vercel → Strapi API | **HTTP + IP** | `http://47.95.242.40` — 跨中美网络时 HTTPS 443 不通，改用 HTTP 80 直连 |
| 用户 → Strapi Admin | HTTPS | `strapi.wcyblog.space` Let's Encrypt 证书 |
| 媒体文件 | HTTP 代理 | 图片走 `/_next/image` (Vercel → ECS HTTP 抓取)，视频直出 |

## 4. Nginx 端口分配 (ECS)

```
:80   → server_name _ (IP + 域名通配) → proxy_pass :1337
:443  → server_name strapi.wcyblog.space → proxy_pass :1337 + SSL
```

certbot 自动管理 443 证书续期（每天检查两次）。

## 5. 技术特性
- **ISR (Incremental Static Regeneration)**: 页面每 1 小时自动检查后端更新。
- **Auto-Thumbnail**: 视频上传时浏览器端 Canvas 自动抽帧作为封面。
- **PM2**: Strapi 进程守护，开机自启。
- **certbot timer**: SSL 证书自动续期，下次到期 2026-08-17。

## 6. Vercel 环境变量

| Key | Value |
|---|---|
| `NEXT_PUBLIC_STRAPI_URL` | `http://47.95.242.40` |

## 7. 运维备忘

```bash
# ECS 登录
ssh -i agent.pem root@47.95.242.40

# Strapi 管理
pm2 status               # 查看状态
pm2 restart strapi        # 重启
pm2 logs strapi           # 日志

# Nginx
nginx -t                  # 测试配置
systemctl reload nginx    # 重载

# 本地构建 + 部署（ECS 内存不足无法 npm build）
cd backend && npm run build
scp -i agent.pem -r dist root@47.95.242.40:/var/www/strapi/
ssh -i agent.pem root@47.95.242.40 "pm2 restart strapi"
```

---
*Last Updated: 2026-05-19*
*By: Antigravity AI Assistant*
