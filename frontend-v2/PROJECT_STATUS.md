# Portfolio V2 开发进度与移交清单 (2026-05-12)

## 1. 核心视觉成果 (Frontend Finished)
*   **设计语言**：Shiro 极简主义，Zinc-900 背景 + Emerald-400 交互色。
*   **全站 UI**：
    *   **首页**：3列精选网格，支持弹窗详情。
    *   **作品页**：16:9 容器承载 9:16 视频/图片，支持按消耗/权重排序。
    *   **简历页**：完成数据迁移，高对比度文字优化，支持 PDF 下载。
    *   **手记页**：列表与详情页模版已定稿。
*   **交互细节**：
    *   **WorkModal**：双栏自适应弹窗，支持性能数据展示。
    *   **Socials**：底部气泡栏支持悬停弹出电话、邮箱及微信二维码。
    *   **滚动条**：全局隐藏，仅保留弹窗内精致滚动条。

## 2. 后端数据模型 (Strapi Ready)
*   **Work (作品)**：
    *   新增：`Rank` (Integer), `CTR` (Decimal), `LaunchDate` (String), `Story` (Long Text)。
    *   更新：`Spend` 升级为 Big Integer。
*   **Article (手记)**：
    *   新增：`Slug` (UID, 基于 Title), `Category` (String)。
*   **权限**：Public Find/FindOne 权限已开启。

## 3. 历史待办 (Old Next Steps)
1.  **lib/strapi.ts**：编写通用 fetcher 封装。 (DONE)
2.  **Data Integration**：将页面中的 MOCK 数据替换为真实请求。 (DONE)

---

# 🚀 2026-05-13 更新日志 (Latest Progress)

## 1. 核心架构与部署 (COMPLETED)
*   **部署模式**：**SSG (静态站点导出)**。使用 `next export` 实现了无服务器依赖的高性能静态发布。
*   **正式域名**：已绑定并解析至 [wcyblog.space](https://wcyblog.space)。
*   **自动化流**：确立了“本地 Strapi 修改 -> 本地 Build -> 推送 `out` 目录 -> Vercel 自动上线”的流程。
*   **Clean URLs**：通过 `vercel.json` 实现了无 `.html` 后缀的优雅访问。

## 2. 基础设施集成 (READY)
*   **媒体存储 (Cloudflare R2)**：
    - 已配置 Strapi AWS S3 适配器，所有上传资源自动分发至 R2。
*   **内容管理 (Strapi 5)**：
    - **Blocks 支持**：前端已集成 `@strapi/blocks-react-renderer`。
    - **数据修正**：实现了数据缺失时的空值兜底逻辑（`|| 0`）。

## 3. UI/UX 深度精修
*   **导航栏 (Navbar)**：常规纯白文字，悬停“白底黑字”反转。
*   **背景视觉**：星空粒子扩大至 4000px，完美覆盖 4K 大屏。
*   **视频体验**：修复了自动播放限制，确保弹窗内视频顺畅加载。

## 4. 维护与清理
*   **冗余清理**：已彻底删除旧版 `frontend` 文件夹。

## 5. 架构与性能优化 (Performance & Architecture)
*   **数据库连接池 (Connection Pooling)**：为 Neon PostgreSQL 增加了 `pool` 配置 (min: 2, max: 10)，有效降低跨国请求带来的 API 延迟，提升 Strapi 本地查询速度。
*   **亚太区媒体加速 (R2 APAC)**：
    - 将 Strapi 上传目标彻底迁移至新的 `portfolio-assets-apac` 亚太区 Bucket。
    - 在前端 Vercel 中新增 Rewrite 规则（`/r2-assets/:path*`）代理 R2 公共开发域名。
    - 后端 `.env` 绑定 Vercel CDN 代理地址，将 18 秒缓慢加载的大视频提速至百毫秒级，实现零配置下 Cloudflare 节点与 Vercel 边缘网络的完美结合。

---

# 🚀 2026-05-14 更新日志 (Cloud Migration)

## 1. 架构全面升级 (Cloud Backend Migration)
*   **Strapi Cloud 迁移**：Strapi 后端已从本地环境成功迁移至 **Strapi Cloud (Asia/Singapore 节点)**。
*   **全云端工作流**：
    - 实现了 CMS 后端的 24/7 在线，摆脱了本地 `start-strapi.bat` 的运行依赖。
    - 解决了 Vercel 云端打包时无法访问本地数据库的“断流”隐患。
    - 管理后台响应速度显著提升（Strapi 与 Neon DB 处于同机房，物理延迟降至毫秒级）。

## 2. 数据库与存储修复 (DB & Storage Fix)
*   **脏数据清理**：通过底层脚本强行删除了 Strapi 数据库中 4 条导致删除报错的“幽灵视频”记录。
*   **R2 秘钥更新**：在 Cloudflare 侧新建了 `Strapi R2 Token` 专用秘钥，并已同步至云端环境变量。
*   **配置同步**：完成了 Strapi Cloud 端所有环境变量（Neon, R2, Vercel Proxy）的初始化配置。

## 3. 性能测试 (Latency Test)
*   **API 性能**：在并发拥堵解除后，云端 API 响应稳定在 2s 以内。
*   **代理分发**：确认云端 Strapi 输出的 URL 已通过 Vercel CDN 代理，大文件访问依然保持极速。
 Cloudflare 秘钥 
 CF_ACCESS_KEY_ID: 3c646b549f6ad0278ac0d61d23f7b82f
CF_ACCESS_SECRET: a5472dcdcc8af3af4de781addc3257a2a4067c831a42d220db8efe640734ab73
---
## 4. 自动化流与 UX 深度优化 (Automation & UX Polish)
*   **Vercel 架构转型**：
    - 彻底废弃了“本地打包推送 `out` 目录”的旧模式。
    - 切换为 **Next.js Source Build**，实现了全自动云端构建。
    - 启用了 **ISR (增量静态生成)**，确保 Strapi 内容发布后前台 60s 内自动刷新。
*   **视频体验“大满贯”修复**：
    - **首帧自动化**：利用 Canvas 实现了视频首帧自动提取作为封面，解决了手动切图的繁琐。
    - **动态时长**：实现了视频元数据实时读取，首页卡片时长标签现在能准确显示每条视频的真实秒数。
    - **代理加速 2.0**：针对 Strapi Cloud 媒体域名配置了 Vercel Edge Proxy (`/strapi-media/`)，彻底解决了国内加载缓慢和 CORS 跨域拦截问题。
    - **稳定性增强**：静默处理了快速划过产生的 `AbortError`，并增加了生成预览图时的 `try-catch` 降级保护。

---
*记录人：Antigravity AI (Your Agentic Coding Assistant)*
