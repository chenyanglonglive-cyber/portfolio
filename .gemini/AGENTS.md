# AGENTS.md — Portfolio 项目 AI 开发规范

> 本文件是 Antigravity / Gemini CLI 在本项目中的**唯一权威规范**。
> 所有 AI 助手在操作此项目时必须遵守以下规则。

---

## 1. 语言偏好

- **默认使用中文**：所有回复、实施计划、任务列表、工作总结均使用中文。
- 代码注释和变量命名可沿用英文行业惯例，但文档性描述必须为中文。
- 除非用户明确要求使用英文，否则中文为默认语言。

---

## 2. 项目架构概览

```
前端:  Vercel (Next.js 16 + ISR)  →  wcyblog.space
         │
ECS:   阿里云 ECS 北京 (47.95.242.40)
         │  Nginx :80/:443 → proxy_pass :1337
         ▼
后端:  Strapi 5 (PM2 进程守护)  →  strapi.wcyblog.space
         │
数据库: PostgreSQL 16 (本地同机部署)
存储:   本地磁盘 /var/www/strapi/public/uploads/
压缩:   compress-service :3001 (FFmpeg H.264)
```

| 组件 | 技术 | 本地路径 | 远程路径 |
|------|------|---------|---------|
| 前端 | Next.js 16 (Turbopack) | `g:\blog\frontend-v2` | Vercel 自动部署 |
| 后端 | Strapi 5 (TypeScript) | `g:\blog\backend` | `/var/www/strapi` |
| 压缩服务 | Node.js + FFmpeg | `g:\blog\compress-service` | ECS `:3001` |
| AI 工作流大屏 | 纯 HTML/JS | `g:\blog\AI-Workflow` | 前端 public 静态文件 |

### 关键地址

- **正式域名**: https://wcyblog.space
- **Strapi Admin**: https://strapi.wcyblog.space/admin
- **Strapi API (Vercel 内部)**: `http://47.95.242.40/api`
- **ECS SSH**: `ssh -i agent.pem root@47.95.242.40`（密钥在项目根目录）

---

## 3. 🚨 ECS 部署铁律（最高优先级）

> [!CAUTION]
> **永远不要在 ECS 上执行 build、npm install、或任何吃内存的操作！**
> ECS 只有 1.6GB RAM + 1GB swap，`npm run build` 必 OOM 宕机。

### 正确的部署流程

```bash
# ① 本地构建（在 g:\blog\backend 目录）
cd g:\blog\backend
npm run build

# ② SCP 上传 dist 目录到 ECS
scp -i "g:\blog\agent.pem" -r dist root@47.95.242.40:/var/www/strapi/

# ③ 如果有新增 src 文件（如 lifecycles、admin extensions），也要同步
scp -i "g:\blog\agent.pem" -r src root@47.95.242.40:/var/www/strapi/

# ④ 重启 Strapi
ssh -i agent.pem root@47.95.242.40 "pm2 restart strapi"
```

### 其他运维命令

```bash
# ECS 登录
ssh -i agent.pem root@47.95.242.40

# PM2 管理
pm2 status / pm2 restart strapi / pm2 logs strapi --lines 50 --nostream

# Nginx
nginx -t && systemctl reload nginx
```

---

## 4. Git 与状态管理

### 提交前必做

1. 完成代码修改并验证通过。
2. 更新 `PROJECT_STATUS.md` —— 在最新章节记录开发内容、完成项、待办。
3. `git add` 将状态文档和代码一同提交，推送至远程仓库。

### 分支策略

- 主分支为 `main`，直接推送。
- 重大功能建议先创建 feature 分支。

---

## 5. 技术约定

### 后端 (Strapi 5)

- **Content Types**: Video、Image、Tag、Project 等，schema 在 `backend/src/api/*/content-types/*/schema.json`
- **Lifecycles**: 视频创建/更新时自动生成 cover（FFmpeg 抽帧）、同步 ✅ 标记。见 `backend/src/api/video/content-types/video/lifecycles.ts`
- **Admin 扩展**: 
  - `auto-cover.ts` — 浏览器端 Canvas 抽帧自动填充 cover
  - `compress-upload.ts` — 视频上传时自动压缩
- **全局 Lifecycle**: `backend/src/index.ts` — 上传文件自动归类到 cover 文件夹
- **媒体文件夹规则**: 所有自动生成的 cover 图片必须归入媒体库的 `cover` 文件夹

### 前端 (Next.js)

- 部署在 Vercel，ISR 每小时刷新一次
- 环境变量 `NEXT_PUBLIC_STRAPI_URL=http://47.95.242.40`
- 图片走 `/_next/image`（Vercel 代理抓取 ECS），视频直出 ECS

### 压缩服务

- `compress-service/server.js` — ECS :3001
- FFmpeg H.264 CRF 23，Nginx 路由 `/compress` → `:3001`
- 认证：接受 API token 或 Strapi admin JWT

---

## 6. 提示音偏好

在特定自动化节点运行提示音脚本：

| 时机 | 脚本 |
|------|------|
| 授权前提示 | `G:\blog\scripts\auth_alert.ps1` |
| 任务完成提示 | `G:\blog\scripts\task_complete.ps1` |

---

## 7. Skills 与工作流偏好

### Superpowers Skills

Skills 位于 `C:\Users\admin\superpowers\skills\`，可用的包括：
- `subagent-driven-development` — 子智能体驱动开发（复杂任务首选）
- `writing-plans` — 编写实施计划
- `executing-plans` — 执行实施计划
- `systematic-debugging` — 系统化调试
- `brainstorming` — 头脑风暴
- `test-driven-development` — 测试驱动开发

### 工作流规范

1. **复杂任务**使用子智能体驱动方案（参考 `subagent-driven-development/SKILL.md`）
2. **实施计划**必须先产出中文方案，获得用户批准后执行
3. **实施计划**存放于 `docs/superpowers/plans/` 目录，以日期命名

---

## 8. 文件结构索引

```
g:\blog/
├── .gemini/AGENTS.md          ← 本文件（AI 规范）
├── ARCHITECTURE.md            ← 架构详情
├── PROJECT_STATUS.md          ← 项目进度日志
├── DATABASE_SCHEMA.md         ← 数据库 schema 文档
├── agent.pem                  ← ECS SSH 密钥
├── backend/                   ← Strapi 5 后端
│   ├── src/api/               ← Content Types & Lifecycles
│   ├── src/admin/extensions/  ← Admin 注入脚本
│   └── config/                ← Strapi 配置
├── frontend-v2/               ← Next.js 前端
├── compress-service/          ← 视频压缩微服务
├── AI-Workflow/               ← AI 工作流可视化页面
├── docs/superpowers/plans/    ← 实施计划存档
├── scripts/                   ← 自动化脚本（提示音等）
└── scratch/                   ← 临时调试脚本（不提交）
```

---

*Last Updated: 2026-06-02*
