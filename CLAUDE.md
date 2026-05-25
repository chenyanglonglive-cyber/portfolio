@AGENTS.md

# ECS 服务器铁律
**永远不要在 ECS (47.95.242.40) 上执行 build、npm install、或任何吃内存的操作。**
- ECS 只有 1.6GB RAM + 1GB swap，`npm run build` 必 OOM 挂机
- 所有构建本地完成，SCP 上传：`scp -i "G:/blog/agent.pem" -r <local> root@47.95.242.40:<remote>`
- SSH 连接用 `-i "G:/blog/agent.pem"`，git push 用 `-4` (IPv4)

# 2026-05-19 工作状态
## 媒体库上传压缩 (已完成部署)
- **Admin 扩展**：`backend/src/admin/extensions/compress-upload.ts` — 注入浏览器 IIFE，拦截 fetch/XHR
- **压缩服务**：`compress-service/server.js` — ECS :3001，FFmpeg H.264 CRF 23，零依赖 multipart 解析
- **认证**：compress service 接受 API token 或 Strapi admin JWT（调用 /admin/users/me 验证）
- **图片**：Canvas WebP 客户端压缩 100-200KB
- **视频**：→ /compress → FFmpeg → Strapi upload → 返回 Strapi 格式 [{ id, url, ... }]
- **Toast**：右下角排队进度提示
- **Nginx**：`/compress` → `127.0.0.1:3001`，client_max_body_size 500M，proxy_read_timeout 300s
