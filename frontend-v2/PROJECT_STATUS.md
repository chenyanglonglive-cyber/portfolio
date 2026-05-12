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

---
*记录人：Antigravity AI (Your Agentic Coding Assistant)*
