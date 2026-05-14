# 博客系统当前架构分析 (Portfolio V2 Architecture Review)

> 报告生成时间：2026年05月14日
> 针对项目：`g:\blog`

## 1. 现状架构拓扑 (Current Topology)

你当前的博客系统是一个典型的**混合型解耦架构**（前端在云端，后端在本地，数据再上云）。

*   **🌐 前端展示层 (Frontend)**：[Next.js 16](https://nextjs.org) 部署于 [Vercel](https://vercel.com)（边缘节点加速）。
*   **💻 服务端/管理台 (CMS)**：[Strapi 5](https://strapi.io) 运行于**你的本地电脑** (`localhost:1337`)。
*   **💾 关系型数据库 (Database)**：[Neon PostgreSQL](https://neon.tech) 部署于云端（新加坡 `ap-southeast-1`）。
*   **📦 对象存储 (Storage)**：[Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) 亚太节点 (`portfolio-assets-apac`)。
*   **🚀 代理层 (CDN Proxy)**：Vercel 的 `next.config.ts` Rewrite 功能，作为 R2 文件的全球加速代理。

---

## 2. 数据链路说明 (Data Flow)

### 🧑‍💻 作者视角（你发文章的流程）：
1. 在本地电脑双击 `start-strapi.bat` 启动服务。
2. 浏览器打开本地 Strapi 后台，开始写文章/传视频。
3. **文本保存链路**：本地电脑 -> 跨国网络 -> 新加坡 Neon 数据库。
4. **媒体上传链路**：本地电脑 -> 跨国网络 -> 亚太区 Cloudflare R2。

### 🌍 访客视角（全世界看你博客的流程）：
1. 访客打开 `wcyblog.space`。
2. Vercel 瞬间返回已经编译好的静态 HTML 网页。
3. 网页内遇到大视频 (`/r2-assets/xxx.mp4`) 时，请求发给 Vercel，Vercel 内部从 R2 抓取文件并缓存，以极高的速度发送给访客。

---

## 3. 当前架构的优点 (Pros)

1. **极致的媒体加载体验**：通过 Vercel Proxy + Cloudflare R2 亚太桶的组合，解决了大视频加载的 18 秒卡顿，实现了低延迟和防盗链。
2. **极低的运维成本 (白嫖方案)**：Vercel、Neon、Cloudflare R2 都有非常慷慨的免费额度。目前这套复杂的系统你几乎不需要付任何服务器月费。
3. **数据高度安全**：因为数据库和文件都托管在云端大厂（Neon & CF），哪怕你本地电脑硬盘彻底坏了，你的博客内容也不会丢失。

---

## 4. 致命缺点与隐患 (Cons & Risks)

> [!WARNING]
> 以下是由于“后端在本地”带来的不可忽视的硬伤。

1. **Vercel 云端部署断流（最大隐患）**
   你的 Next.js 代码里配置了 `NEXT_PUBLIC_STRAPI_URL=http://localhost:1337`。这意味着，当你把代码推送到 GitHub，Vercel 在云端服务器为你打包编译 (Build) 时，它根本**连不上你的本地电脑**，导致无法抓取文章列表，必定会报错打包失败。
2. **ISR (增量静态生成) 彻底失效**
   前端代码中虽然写了 `revalidate: 60`（希望 Vercel 每 60 秒自动去 Strapi 拉取一次新内容并更新页面缓存），但因为 Strapi 在本地，Vercel 根本找不到你的数据源，导致你以后每次修改文章，都只能在本地手动 `npm run build` 再上传，彻底丧失了云端自动化的体验。
3. **被绑架的移动办公**
   由于后台必须依托于 `start-strapi.bat`，你无法在外面用手机、iPad 或别人的电脑登录后台发文章。
4. **编辑体验有不可消除的物理延迟**
   由于本地电脑到新加坡 Neon 数据库存在物理距离，后台管理（查询权限、保存草稿）始终有 2~3 秒的加载时间。

---

## 5. 终极演进建议 (Next Steps)

如果你希望这个博客长期运营，且体验达到“现代化生产级”，强烈建议进行以下唯一的架构升级：

**🛠️ 动作：将 Strapi 部署到云端 (Render / Railway / Zeabur)**
*   **配置建议**：选择与 Neon 相同的地区（例如新加坡 / 亚太）。
*   **带来的巨变**：
    1. Strapi 和 Neon 数据库同处一个数据中心，后台响应速度从 3 秒缩短至 **10毫秒**，丝滑无比。
    2. 你的博客将拥有一个属于自己的云端后台地址（如 `admin.wcyblog.space`），手机随时登录发文章。
    3. Vercel 终于能在云端访问到你的数据，真正实现**写完文章，前台网页自动更新**的全自动魔法流。

> [!TIP]
> 如果目前只是本地测试和开发阶段，现在的架构完全足够使用。等所有的前端 UI 和内容模型彻底定版，再进行最后一步的云端部署即可。
