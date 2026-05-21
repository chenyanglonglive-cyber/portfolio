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
## 5. 存储架构揭秘与限制 (Storage Architecture Reality)
在尝试将媒体库切换为 Cloudflare R2 的测试中，我们发现了 **Strapi Cloud 的平台级限制**：

*   **供应商锁定 (Vendor Lock-in)**：Strapi Cloud 会强制劫持并覆盖本地代码中的 `plugins.ts` 存储配置。它统一使用官方的 `strapi-provider-upload-strapi-cloud`，导致即使配置了完善的 R2 密钥，文件依然会被存入 Strapi 官方分配的存储空间中。
*   **解决方案与现状**：目前，我们已经退回了最稳定的 **“本地截帧 + Strapi 官方 API 直传”** 模式。因为缩略图已在浏览器提前提取完成，所以上传大视频时不再触发 Strapi 耗时的 ffmpeg 后台转码，从而彻底规避了 524 响应超时。
*   **后续建议**：若未来存储空间告急并执意要使用免费的 Cloudflare R2，唯一的途径是将后端从 Strapi Cloud 整体迁移至第三方托管（如 Zeabur 或 Railway）。

---

# 🚀 2026-05-17 更新日志 (UI Polish & Video Pipeline Fix)

## 1. 全站样式统一 (Typography & Layout)
*   **去除斜体**：所有页面 h1/h2/h3 大标题移除 `italic`，改为正体显示，配合移除冗余的 `not-italic` 补偿类。
*   **Resume 布局调整**：下载按钮从 About 侧边移至下方独立行，About 区域去掉 `max-w-2xl` 限制，撑满版心宽度。
*   **容器比例分离**：WorkCard 根据媒体类型自动切换 — 视频 `aspect-[9/16]`，图片 `aspect-[16/9]`。
*   **筛选栏视觉区分**：分类按钮（segmented control 白底/半透明）与排序按钮（emerald 色系圆角方形）样式明显区分。

## 2. 作品筛选重构 (Works Filter)
*   **去掉 ALL 标签**：视频和图片不再混合展示，默认显示「视频」分类。
*   **排序作用域**：按消耗排序仅作用于当前所选分类，后续新增筛选（如标签）同理。

## 3. Resume 动态化 (Dynamic About)
*   **新建 `About` 类型** (`types/about.ts`) 和 API 函数 (`getAbout()`)。
*   **Resume 页面拆分**：`page.tsx` 改为 Server Component 拉取 About 数据，渲染逻辑抽至 `ResumeContent` Client Component。
*   **兜底策略**：Strapi 无 About 数据时回退到原有硬编码文案。

## 4. 视频加载管线修复 (Video Pipeline — Critical Fix)
*   **上传流修复 (`actions.ts`)**：
    - 废弃旧的 `createWorkEntry`（往 `/api/works` 发请求）。
    - 新增 `createVideoEntry` → 正确 POST 到 `/api/videos`。
    - **cover 自动填入**：上传视频时，客户端抽帧缩略图直接写入 `cover` 字段，用户可见此动作完成。
*   **WorkCard 修复**：
    - 移除 mount 时的 `useEffect` 客户端抽帧逻辑（曾在页面加载时下载全部视频）。
    - 视频仅在 hover 时注入 `videoSrc`，配合 `preload="none"` 实现真正懒加载。
    - 封面优先使用 Strapi 后端 `cover` 字段，hover 抓帧仅作兜底。
*   **TypeScript 编译修复**：修复 `useEffect` 未导入和 `captureFirstFrame` 声明顺序错误，解除 Vercel 构建阻塞。

## 5. Vercel 部署恢复 (Deployment Recovery)
*   **问题诊断**：Vercel 最近 2 次部署处于 Error 状态，根因为 TypeScript 编译失败。
*   **修复后部署成功**：`wcyblog.space` 作品页正常展示 3 个视频卡片。
*   **已知遗留**：~~现有 3 个视频 `cover` 仍为 `null`（修复前上传），重新上传后自动填充。~~ ✅ 已通过 ffmpeg + API 手动回填。

## 6. Strapi Admin 自动抽帧注入 (Auto Cover Injection)
*   **新增 `backend/src/admin/extensions/auto-cover.ts`**：
    - 注入脚本到 Strapi Admin 编辑表单
    - 轮询监测 video 字段变化 → 客户端 Canvas 抽帧 → 上传到媒体库 → 自动写入 cover
    - 显示实时状态：「⏳ 正在抽帧…」→「✅ 封面已自动填充」
    - 通过 `backend/src/admin/app.tsx` 的 bootstrap 钩子加载
*   **待完成**：需在 Strapi Cloud Dashboard 手动触发一次 **Redeploy**，Admin 面板才会加载该脚本。

---
# 🚀 2026-05-17 晚间更新 (Critical Bug Fixes)

## 1. Strapi 5 API 字段查询兼容 (Root Cause of Empty Homepage)
*   **问题**：首页精选作品始终为空，RSC 数据 `"videos":[],"images":[]`。
*   **根因**：`populate[cover]=*` 在 Strapi 5 中对 media 字段返回 400 Bad Request（`Invalid key related at cover.related`）。构建时 `getFeaturedWorks()` 静默失败返回空数组。
*   **修复**：`src/lib/strapi.ts` — 将 `populate[cover]=*` 改为 `populate[cover][fields][0]=url`，`populate[image]=*` 同理。影响 `getWorks()` 和 `getFeaturedWorks()`。

## 2. 历史视频 Cover 回填
*   **问题**：3 个旧视频的 cover 仍为 null，首页卡片无封面。
*   **修复**：通过 ffmpeg 逐一下载视频 → 提取第 1 秒帧 → 上传到 Strapi 媒体库 → PUT /api/videos 回填 cover 关系。
*   **结果**：三体联动、割草风格克隆 AI、logo 演绎动画 均已显示封面。

## 3. Vercel 项目清理
*   **删除**：`blog-fixed` 冗余项目（与 `portfolio` 指向同一仓库，造成部署混淆）。
*   **确认**：`wcyblog.space` 仅绑定在 `portfolio` 项目上，删除无影响。

---
# 🚀 2026-05-18/19 晚间更新 (阿里云 ECS 迁移)

## 架构重大变更：Strapi + 数据库 搬离云端 → 阿里云自建

### 迁移原因
- Strapi Cloud 供应商锁定（存储不可控）
- Neon 数据库新加坡节点，国内访问延迟高
- 降低长期运营成本

### 新架构
```
前端: Vercel (wcyblog.space)         — 不变
后端: 阿里云 ECS (47.95.242.40)      — 原 Strapi Cloud
数据库: ECS 本地 PostgreSQL 16       — 原 Neon (新加坡)
媒体: ECS 本地磁盘 public/uploads/   — 原 Strapi Cloud 存储
域名: strapi.wcyblog.space → ECS IP  — 待配置
```

## ✅ 已完成

### 1. ECS 环境搭建
- Node.js 22.22.2 + npm (淘宝镜像 `registry.npmmirror.com`)
- PostgreSQL 16.13 — 数据库 `strapi`，用户 `strapi`
- Nginx 1.24.0（待配置反向代理）
- PM2 7.0.1（已配置开机自启）
- ffmpeg 6.1.1（视频抽帧）

### 2. 数据库迁移 (Neon → ECS)
- PG 17 客户端安装后用 pg_dump 从 Neon 导出 460KB dump
- 导入本地 PostgreSQL，6 videos / 6 images / 3 articles / 2 abouts / 17 files / 2 admin users — 数据完整
- `files` 表 URL 已批量更新：`strapiapp.com` CDN URL → `/uploads/hash.ext` 本地路径

### 3. 媒体文件迁移 (Strapi Cloud → ECS)
- 17 个文件（11 视频 + 6 图片，共 ~75MB）全部从 Strapi Cloud CDN 下载到 `/var/www/strapi/public/uploads/`
- 按 `hash.ext` 命名，与数据库 URL 匹配

### 4. 后端代码改造
- 移除 `@strapi/plugin-cloud` 依赖
- `config/database.ts` — 去掉 `connectionString`，改用独立字段
- `config/middlewares.ts` — CSP 中 `*.strapiapp.com` → `strapi.wcyblog.space`
- `.env` / `.env.example` — 数据库连接拆分为独立字段
- `frontend-v2/next.config.ts` — rewrites + remotePatterns 改为新域名
- `frontend-v2/src/lib/strapi.ts` — getStrapiMedia 兼容新旧域名
- `frontend-v2/src/app/admin/upload/actions.ts` — fallback URL 更新

### 5. Strapi 部署到 ECS
- 代码上传 `/var/www/strapi/`，生产 `.env` 配置完成
- ⚠️ ECS 内存不足无法本地构建（OOM），改为本地构建 `dist` 后 scp 上传
- PM2 启动成功，`localhost:1337/api/videos` 返回 200
- Strapi 管理后台已就绪：`https://strapi.wcyblog.space/admin`（待 DNS）

## ❌ 未完成 / 待办

### 1. Nginx 反向代理 + SSL
- Nginx 已安装但未创建站点配置
- 需要创建 `/etc/nginx/sites-available/strapi` 反代 `127.0.0.1:1337`
- 需要 certbot 签发 Let's Encrypt 证书
- **阻塞项**：DNS 必须先生效（Let's Encrypt 验证域名）

### 2. DNS 配置
- 在 Cloudflare 控制台添加 A 记录：`strapi` → `47.95.242.40`
- **需手动操作**：登录 Cloudflare → wcyblog.space → DNS → Add Record

### 3. Vercel 环境变量
- `NEXT_PUBLIC_STRAPI_URL` 改为 `https://strapi.wcyblog.space`
- **需手动操作**：Vercel Dashboard → portfolio → Settings → Environment Variables

### 4. 前端重新部署
- 推送代码后 Vercel 自动部署
- `next.config.ts` rewrites 已更新，部署即生效

### 5. 端到端验证
- [ ] `https://strapi.wcyblog.space/admin` — 管理后台可访问
- [ ] `https://wcyblog.space` — 首页精选作品正常
- [ ] `/works` — 作品列表 + 视频播放
- [ ] `/blog` — 手记列表
- [ ] `/resume` — 简历页

### 6. 已知风险
- ECS 内存不足（`npm run build` OOM），后续 Strapi 更新需本地构建 + scp dist
- 阿里云安全组需确认 80/443 端口已开放

---

# 🚀 2026-05-20 更新日志 (Local Dev & AI Workflow Modalization)

## 1. 本地开发流程优化 (Local Development Setup)
- **新增本地启动脚本**：在根目录下创建了 [start-dev.bat](file:///D:/blog/portfolio/start-dev.bat)，双击即可一键运行前端 Next.js 本地开发服务器，具备热更新（Hot Reload）功能。
- **环境配置优化**：更新了 [frontend-v2/.env.local](file:///D:/blog/portfolio/frontend-v2/.env.local) 和 [frontend-v2/.env](file:///D:/blog/portfolio/frontend-v2/.env)，将 `NEXT_PUBLIC_STRAPI_URL` 指向已配置好的阿里云 ECS 后端生产环境（`https://strapi.wcyblog.space`），实现本地直接拉取云端数据进行高保真调试，无需推到线上。

## 2. 首页版位与内容优化 (Homepage Optimization)
- **核心板块前置**：将 **“AI 工作流大屏”**（`AIWorkflowGrid` 组件）移动到了首页的**第一版位**（位于精选作品 `WorkGrid` 之上），作为用户的最核心竞争优势优先展示。
- **卡片卡槽精简**：移除了卡片底部的 `Key Pipelines` 核心管线灰色字列表，使卡片布局更精简美观。
- **文案微调**：
  - **AI 创意生成**：更新为“使用生成类AI 实现玩法类素材，角色剧情类素材快速复刻，攻略活动类，口播解说类批量生产，使用SKILLS 生产演示动画。”
  - **AI 自动化提效**：更新为“基于视频设计师岗位的真实痛点，我用 AI Agent 打造了一套从素材管理、办公流程到资源巡检的全链路自动化工具，把重复低效的工作彻底交给 AI 处理，实现团队效率 of 系统性提升。”

## 3. 工作流大屏模态化重构 (Interactive Workflow Modal)
- **大屏交互弹窗化**：废弃了原有的新开网页跳转模式。现在在首页点击“探索工作流”按钮会以全屏半透明磨砂（`backdrop-blur-md bg-black/60`）的 **iframe 弹窗形式**优雅淡入展示。
- **只保留核心流程**：隐藏了左侧案例列表（`nav-column`）与右侧详情版块（`details-column`），大屏集中展示中间高精度的流程网络图，提高视觉焦点。
- **灵动岛胶囊 Tab**：将顶部品类切换重构为固定定位、孤悬于弹窗外的**“灵动岛胶囊”**，支持模糊悬浮效果与霓虹外发光微动效。
- **关闭机制与双向通信**：在流程画布右上角添加了关闭按钮 (✕)，点击时通过 HTML5 `postMessage` 向 React 父级窗口发送 `close-workflow` 信号，无缝控制模态窗口的开启与关闭，同时在开启时锁定底层网页滚动。

# 🚀 2026-05-21 更新日志 (Mobile Responsive Adaptations & Preferences)

## 1. 移动端适配优化 (Mobile Responsive Layouts)
- **首页视频详情弹窗 (`WorkModal.tsx`)**：
  - 针对移动端屏幕（宽度小于 `768px`）将双栏布局重构为单栏垂直滚动布局。
  - 优化弹窗的间距与排版，防止数据详情内容遮挡视频播放，确保视频区域优先展示。
  - 将庞杂的数据指标及技术痛点面板在移动端隐藏，只保留最核心的标题、视频内容和关键说明。
- **AI 工作流交互大屏 (`AI-Workflow/index.html` & `frontend-v2/public/AI-Workflow/index.html`)**：
  - 将原本宽屏大屏展示的网格重构为适合移动端手势操作的流畅排版。
  - 将顶部 Tab 切换重构为水平滚动的滑动式灵动岛胶囊，方便移动端单手切换。
  - 修复了移动端下 SVG 贝塞尔曲线连线的坐标重绘问题，使流光脉冲在屏幕旋转和缩放时精确对齐节点。
  - 优化了节点内的字号、间距与圆角，使其符合移动端轻量化视觉体验。

## 2. 自动化验证与测试 (Verification & Playwright)
- 编写 Playwright 移动端仿真脚本，模拟 iPhone 及主流 Android 机型分辨率。
- 自动化生成移动端布局截图（如 `mobile_home_modal.png`、`mobile_workflow_creative.png` 等）进行视觉回溯，确认无遮挡、无溢出、无重叠。

## 3. 用户偏好配置集成 (User Preferences Config)
- 遵循用户的个性化偏好配置：
  1. 在所有可能引发用户授权或卡住的命令执行前运行 `auth_alert.ps1` 提示音。
  2. 在所有任务彻底完成前运行 `task_complete.ps1` 提示音。
  3. **新增偏好**：每次推送 Git 前自动检查并更新 `PROJECT_STATUS.md` 状态清单。

---
*记录人：Antigravity AI (Your Agentic Coding Assistant)*
*Last Updated: 2026-05-21*
