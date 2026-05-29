# 作品标签、媒体分类与状态标记实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 Strapi 中创建标签（Tag）模型并与视频（Video）和图片（Image）模型关联，在前端展示页支持按标签筛选作品；同时实现自动生成的封面图（Cover）自动分类保存至媒体库 "cover" 文件夹，并为已被作品引用的视频在媒体库中打上 "✅" 标记。

**Architecture:** 我们将在 Strapi 中新增 `tag` 集合类型，并与 Video 和 Image 建立多对多关系。通过编写 Strapi 后端的 lifecycle 钩子和数据库生命周期订阅（Subscriber），实现自动上传的封面自动分类以及对使用中视频的展示名自动前缀标记。前端通过一次性获取全部标签和带 tags 关系的作品数据，在前端网格组件中进行实时无缝的标签过滤。

**Tech Stack:** Strapi 5 (Node, PostgreSQL), Next.js 16 (React, TypeScript, Tailwind CSS)

---

### Task 1: 在 Strapi 中创建 Tag 集合类型 (API)

**Files:**
- Create: `backend/src/api/tag/content-types/tag/schema.json`
- Create: `backend/src/api/tag/controllers/tag.ts`
- Create: `backend/src/api/tag/routes/tag.ts`
- Create: `backend/src/api/tag/services/tag.ts`

- [x] **Step 1: 创建 Tag 模型的 schema 配置文件**
  
  创建文件 `backend/src/api/tag/content-types/tag/schema.json`，内容如下：
  ```json
  {
    "kind": "collectionType",
    "collectionName": "tags",
    "info": {
      "singularName": "tag",
      "pluralName": "tags",
      "displayName": "Tag",
      "description": "Tags for portfolio works"
    },
    "options": {
      "draftAndPublish": false
    },
    "pluginOptions": {},
    "attributes": {
      "Name": {
        "type": "string",
        "required": true,
        "unique": true
      },
      "videos": {
        "type": "relation",
        "relation": "manyToMany",
        "target": "api::video.video",
        "inversedBy": "tags"
      },
      "images": {
        "type": "relation",
        "relation": "manyToMany",
        "target": "api::image.image",
        "inversedBy": "tags"
      }
    }
  }
  ```

- [x] **Step 2: 创建 Tag 的控制器、路由和服务文件**

  创建文件 `backend/src/api/tag/controllers/tag.ts`：
  ```typescript
  import { factories } from '@strapi/strapi';
  export default factories.createCoreController('api::tag.tag');
  ```

  创建文件 `backend/src/api/tag/routes/tag.ts`：
  ```typescript
  import { factories } from '@strapi/strapi';
  export default factories.createCoreRouter('api::tag.tag');
  ```

  创建文件 `backend/src/api/tag/services/tag.ts`：
  ```typescript
  import { factories } from '@strapi/strapi';
  export default factories.createCoreService('api::tag.tag');
  ```

- [x] **Step 3: 运行本地构建命令，确保后端编译成功**
  
  在 `backend` 目录下运行：`npm run build`
  预期输出：`Building...` 并且编译成功结束，无 TypeScript 错误。

- [x] **Step 4: 提交代码**
  
  ```bash
  git add backend/src/api/tag
  git commit -m "feat(backend): create tag content-type model, controller, router and service"
  ```

---

### Task 2: 在 Video 和 Image 模型中关联 Tag

**Files:**
- Modify: `backend/src/api/video/content-types/video/schema.json`
- Modify: `backend/src/api/image/content-types/image/schema.json`

- [ ] **Step 1: 在 Video 的 schema 中添加 tags 多对多关联字段**
  
  编辑 `backend/src/api/video/content-types/video/schema.json`，在 `attributes` 对象中插入 `tags` 属性：
  ```json
      "tags": {
        "type": "relation",
        "relation": "manyToMany",
        "target": "api::tag.tag",
        "mappedBy": "videos"
      }
  ```

- [ ] **Step 2: 在 Image 的 schema 中添加 tags 多对多关联字段**
  
  编辑 `backend/src/api/image/content-types/image/schema.json`，在 `attributes` 对象中插入 `tags` 属性：
  ```json
      "tags": {
        "type": "relation",
        "relation": "manyToMany",
        "target": "api::tag.tag",
        "mappedBy": "images"
      }
  ```

- [ ] **Step 3: 运行后端构建进行架构与模式解析校验**
  
  在 `backend` 目录下运行：`npm run build`
  预期输出：编译成功。

- [ ] **Step 4: 提交代码**
  
  ```bash
  git add backend/src/api/video/content-types/video/schema.json backend/src/api/image/content-types/image/schema.json
  git commit -m "feat(backend): link tags relation to video and image schemas"
  ```

---

### Task 3: 编写媒体生命周期钩子将自动生成的 Cover 分类至 'cover' 文件夹

**Files:**
- Modify: `backend/src/index.ts`

- [ ] **Step 1: 在 bootstrap 钩子中订阅 upload.file 创建事件**
  
  编辑 `backend/src/index.ts`，替换 bootstrap 方法以监测客户端 `auto-cover.jpg` 和服务端 `cover_` 前缀的封面文件创建：
  ```typescript
  import type { Core } from '@strapi/strapi';

  export default {
    register() {},

    bootstrap({ strapi }: { strapi: any }) {
      strapi.db.lifecycles.subscribe({
        models: ["plugin::upload.file"],
        async afterCreate(event: any) {
          const { result } = event;
          const name = result.name || '';
          if (name.startsWith('cover_') || name.startsWith('auto-cover') || name === 'auto-cover.jpg') {
            try {
              const folderService = strapi.plugins.upload.services.folder;
              let folder = await strapi.query('plugin::upload.folder').findOne({
                where: { name: 'cover' }
              });
              if (!folder) {
                folder = await folderService.create({ name: 'cover' });
              }
              await strapi.db.query('plugin::upload.file').update({
                where: { id: result.id },
                data: { folder: folder.id }
              });
              console.log(`[Lifecycle] Moved auto-cover ${result.name} (ID: ${result.id}) to 'cover' folder (ID: ${folder.id})`);
            } catch (err: any) {
              console.error('[Lifecycle] Failed to move cover to folder:', err.message);
            }
          }
        }
      });
    },
  };
  ```

- [ ] **Step 2: 运行编译验证**
  
  在 `backend` 目录下运行：`npm run build`
  预期输出：编译成功。

- [ ] **Step 3: 提交代码**
  
  ```bash
  git add backend/src/index.ts
  git commit -m "feat(backend): add media folder organization hook for covers"
  ```

---

### Task 4: 实现已被引用视频的 "✅" 状态标记同步

**Files:**
- Modify: `backend/src/api/video/content-types/video/lifecycles.ts`

- [ ] **Step 1: 在 video 的生命周期中集成已使用视频的状态监测**
  
  编辑 `backend/src/api/video/content-types/video/lifecycles.ts`，增加 `syncVideoUsedStatuses` 处理函数，并在创建、更新和删除后自动执行：
  ```typescript
  import { exec } from 'child_process';
  import { promisify } from 'util';
  import path from 'path';
  import fs from 'fs';
  import os from 'os';

  const execP = promisify(exec);

  async function syncVideoUsedStatuses() {
    try {
      const videoEntries = await strapi.db.query('api::video.video').findMany({
        populate: ['video'],
      });

      const referencedIds = new Set<number>();
      for (const entry of videoEntries) {
        if (entry.video && entry.video.id) {
          referencedIds.add(entry.video.id);
        }
      }

      const files = await strapi.db.query('plugin::upload.file').findMany();
      const videoFiles = files.filter((f: any) => f.mime && f.mime.startsWith('video/'));

      for (const file of videoFiles) {
        const isUsed = referencedIds.has(file.id);
        const name = file.name || '';
        const hasUsedEmoji = name.startsWith('✅ ');

        if (isUsed && !hasUsedEmoji) {
          const newName = `✅ ${name}`;
          await strapi.db.query('plugin::upload.file').update({
            where: { id: file.id },
            data: { name: newName }
          });
          console.log(`[Used Status] Marked video '${name}' as used (✅).`);
        } else if (!isUsed && hasUsedEmoji) {
          const newName = name.replace(/^✅\s*/, '');
          await strapi.db.query('plugin::upload.file').update({
            where: { id: file.id },
            data: { name: newName }
          });
          console.log(`[Used Status] Unmarked video '${name}' as unused.`);
        }
      }
    } catch (err: any) {
      console.error('[Used Status] Failed to sync video used statuses:', err?.message ?? err);
    }
  }

  export default {
    async afterCreate(event: any) {
      const { result } = event;
      if (result.video && !result.cover) {
        await generateCover(result.documentId, result.video);
      }
      await syncVideoUsedStatuses();
    },

    async afterUpdate(event: any) {
      const { result } = event;
      if (result.video && !result.cover) {
        await generateCover(result.documentId, result.video);
      }
      await syncVideoUsedStatuses();
    },

    async afterDelete(event: any) {
      await syncVideoUsedStatuses();
    }
  };

  async function generateCover(documentId: string, videoData: any) {
    try {
      const entry = await strapi.documents('api::video.video').findOne({
        documentId,
        populate: ['video'],
      });

      if (!entry?.video?.url) {
        console.log('No video found for document:', documentId);
        return;
      }

      const videoUrl: string = entry.video.url;
      console.log(`Generating cover for video ${documentId}: ${videoUrl}`);

      const publicDir = path.join(strapi.dirs?.app?.root ?? process.cwd(), 'public');
      const localPath = path.join(publicDir, videoUrl.startsWith('/') ? videoUrl : `/${videoUrl}`);
      if (!fs.existsSync(localPath)) {
        console.error(`Video file not found locally: ${localPath}`);
        return;
      }

      const tempDir = os.tmpdir();
      const thumbName = `thumb_${documentId}_${Date.now()}.jpg`;
      const thumbPath = path.join(tempDir, thumbName);

      const ffmpegCmd = `ffmpeg -i "${localPath}" -ss 00:00:01 -vframes 1 -f image2 "${thumbPath}" -y`;

      try {
        await execP(ffmpegCmd);
      } catch (err: any) {
        console.error('FFmpeg error:', err?.message ?? err);
        return;
      }

      if (!fs.existsSync(thumbPath)) {
        console.error('FFmpeg did not produce output');
        return;
      }

      const stats = fs.statSync(thumbPath);

      const uploadedFiles = await strapi.plugins.upload.services.upload.upload({
        data: {},
        files: {
          filepath: thumbPath,
          originalFilename: `cover_${documentId}.jpg`,
          mimetype: 'image/jpeg',
          size: stats.size,
        },
      });

      const coverId = uploadedFiles[0].id;

      await strapi.documents('api::video.video').update({
        documentId,
        data: { cover: coverId },
        status: entry.publishedAt ? 'published' : 'draft',
      });

      console.log(`Cover generated for ${documentId}`);
      fs.unlinkSync(thumbPath);
    } catch (err: any) {
      console.error('Error in generateCover:', err?.message ?? err);
    }
  }
  ```

- [ ] **Step 2: 编译测试后端逻辑**
  
  在 `backend` 目录下运行：`npm run build`
  预期输出：编译成功。

- [ ] **Step 3: 提交代码**
  
  ```bash
  git add backend/src/api/video/content-types/video/lifecycles.ts
  git commit -m "feat(backend): sync video display name checkmark emoji based on usage"
  ```

---

### Task 5: 编写公共角色 API 访问权限授权脚本

**Files:**
- Create: `backend/scripts/grant_tag_permissions.js`

- [ ] **Step 1: 创建用于在本地和 ECS 上设置权限的 SQL 脚本**
  
  创建文件 `backend/scripts/grant_tag_permissions.js`，内容如下：
  ```javascript
  const { Client } = require('pg');
  
  const client = new Client({
    connectionString: 'postgres://strapi:Strapi54007!@127.0.0.1:5432/strapi'
  });

  async function run() {
    try {
      await client.connect();
      console.log('Connected to Database');

      const actions = ['api::tag.tag.find', 'api::tag.tag.findOne'];
      const roles = [5, 6]; // 5 = Authenticated, 6 = Public

      for (const action of actions) {
        // Insert permission if not exists
        const checkPerm = await client.query('SELECT id FROM up_permissions WHERE action = $1 LIMIT 1;', [action]);
        let permissionId;
        if (checkPerm.rows.length === 0) {
          const docId = 'tag' + Math.random().toString(36).substring(2, 22);
          const insPerm = await client.query(
            'INSERT INTO up_permissions (document_id, action, created_at, updated_at, published_at) VALUES ($1, $2, NOW(), NOW(), NOW()) RETURNING id;',
            [docId, action]
          );
          permissionId = insPerm.rows[0].id;
          console.log(`Inserted permission ${action} (ID: ${permissionId})`);
        } else {
          permissionId = checkPerm.rows[0].id;
          console.log(`Permission ${action} already exists (ID: ${permissionId})`);
        }

        // Link to roles
        for (const roleId of roles) {
          const checkLink = await client.query(
            'SELECT id FROM up_permissions_role_lnk WHERE permission_id = $1 AND role_id = $2 LIMIT 1;',
            [permissionId, roleId]
          );
          if (checkLink.rows.length === 0) {
            await client.query(
              'INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES ($1, $2);',
              [permissionId, roleId]
            );
            console.log(`Linked permission ${action} to role ${roleId}`);
          } else {
            console.log(`Link already exists for permission ${action} and role ${roleId}`);
          }
        }
      }
    } catch (e) {
      console.error('Error granting permissions:', e.message);
    } finally {
      await client.end();
    }
  }

  run();
  ```

- [ ] **Step 2: 在本地和 ECS 生产环境中执行此脚本**

  本地执行校验：`node backend/scripts/grant_tag_permissions.js`
  预期输出：显示权限插入并成功关联至相应 Role 的提示。
  
  同步并执行至 ECS：
  SCP 发送脚本：`scp -i agent.pem backend/scripts/grant_tag_permissions.js root@47.95.242.40:/var/www/strapi/scripts/`
  SSH 执行脚本：`ssh -i agent.pem root@47.95.242.40 "node /var/www/strapi/scripts/grant_tag_permissions.js"`
  预期输出：远程 ECS 服务器提示数据库更新完成。

- [ ] **Step 3: 提交代码**

  ```bash
  git add backend/scripts/grant_tag_permissions.js
  git commit -m "feat(backend): add permission grant script for tag endpoint"
  ```

---

### Task 6: 更新前端 TypeScript 类型声明与数据获取查询

**Files:**
- Modify: `frontend-v2/src/types/work.ts`
- Modify: `frontend-v2/src/app/works/page.tsx`

- [ ] **Step 1: 更新 VideoWork 与 ImageWork 类型声明**

  编辑 `frontend-v2/src/types/work.ts`，为作品接口增加 `tags` 属性声明：
  ```typescript
  export interface VideoWork {
    id: number;
    documentId: string;
    Title: string;
    video?: { url: string };
    cover?: { url: string };
    Story?: string;
    IsFeatured: boolean;
    Spend: number;
    ROI_7D: number;
    CTR: number;
    Rank: number;
    LaunchDate?: string;
    tags?: { id: number; documentId: string; Name: string }[];
  }

  export interface ImageWork {
    id: number;
    documentId: string;
    Title: string;
    image?: { url: string };
    Story?: string;
    IsFeatured: boolean;
    Spend: number;
    ROI_7D: number;
    CTR: number;
    Rank: number;
    LaunchDate?: string;
    tags?: { id: number; documentId: string; Name: string }[];
  }
  ```

- [ ] **Step 2: 修改 Works Page 查询，关联 tags 字段并拉取所有标签**

  编辑 `frontend-v2/src/app/works/page.tsx`，在 `videoFields` 与 `imageFields` 中添加 `"populate[tags][fields][0]=Name"` 关联查询：
  ```typescript
    const videoFields = [
      "populate[video][fields][0]=url",
      "populate[cover][fields][0]=url",
      "populate[tags][fields][0]=Name",
      "fields[0]=Title",
      "fields[1]=IsFeatured",
      "fields[2]=Rank",
      "fields[3]=Spend",
      "fields[4]=ROI_7D",
      "fields[5]=CTR",
      "fields[6]=Story",
      "fields[7]=LaunchDate",
      "pagination[pageSize]=50",
    ].join("&");

    const imageFields = [
      "populate[image][fields][0]=url",
      "populate[tags][fields][0]=Name",
      "fields[0]=Title",
      "fields[1]=IsFeatured",
      "fields[2]=Rank",
      "fields[3]=Spend",
      "fields[4]=ROI_7D",
      "fields[5]=CTR",
      "fields[6]=Story",
      "fields[7]=LaunchDate",
      "pagination[pageSize]=50",
    ].join("&");
  ```
  并在 `WorksPage` 组件中查询获取全量 tags，传入 `WorksFilterGrid` 中：
  ```typescript
    const tags = await queryStrapi<any[]>('tags').catch(() => []);
  ```
  更新 `WorksFilterGrid` 渲染调用：`<WorksFilterGrid initialVideos={videos} initialImages={images} tags={tags} />`

- [ ] **Step 3: 运行本地打包编译，验证类型检查**
  
  在 `frontend-v2` 目录下运行：`npm run build`
  预期输出：静态页面成功导出，无编译报错。

- [ ] **Step 4: 提交代码**
  
  ```bash
  git add frontend-v2/src/types/work.ts frontend-v2/src/app/works/page.tsx
  git commit -m "feat(frontend): fetch tags and populate tags on works page"
  ```

---

### Task 7: 前端标签筛选过滤 UI 交互开发

**Files:**
- Modify: `frontend-v2/src/components/WorksFilterGrid.tsx`

- [ ] **Step 1: 让 WorksFilterGrid 支持 tags 属性与标签过滤状态**

  编辑 `frontend-v2/src/components/WorksFilterGrid.tsx`，将 `tags` 加入 Props 声明并新增 `selectedTagId` 状态：
  ```typescript
  interface WorksFilterGridProps {
    initialVideos: Work[];
    initialImages: Work[];
    tags: { id: number; documentId: string; Name: string }[];
    error?: string;
  }

  export default function WorksFilterGrid({ initialVideos, initialImages, tags, error }: WorksFilterGridProps) {
    const [filter, setFilter] = useState<'video' | 'image'>('video');
    const [sortBy, setSortBy] = useState<'default' | 'spend'>('default');
    const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
    const [selectedWork, setSelectedWork] = useState<Work | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
  ```

- [ ] **Step 2: 在 JSX 中渲染美观的毛玻璃标签过滤器按钮栏**

  在分类切换 Tabs 下方渲染横向滚动的标签选择区：
  ```typescript
        {/* 标签过滤栏 */}
        {tags && tags.length > 0 && (
          <div className="w-full flex flex-wrap items-center gap-2 mt-4 py-2 border-t border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest mr-2">标签过滤:</span>
            <button
              onClick={() => setSelectedTagId(null)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-300 ${
                selectedTagId === null
                  ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                  : 'bg-white/5 text-zinc-400 border border-transparent hover:text-white hover:bg-white/10'
              }`}
            >
              全部
            </button>
            {tags.map((t) => (
              <button
                key={t.documentId}
                onClick={() => setSelectedTagId(t.documentId)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-bold tracking-wider transition-all duration-300 ${
                  selectedTagId === t.documentId
                    ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                    : 'bg-white/5 text-zinc-400 border border-transparent hover:text-white hover:bg-white/10'
                }`}
              >
                {t.Name}
              </button>
            ))}
          </div>
        )}
  ```

- [ ] **Step 3: 在 `useMemo` 中整合标签过滤逻辑**

  修改 `filteredAndSortedWorks` 筛选逻辑，增加根据 `selectedTagId` 匹配 `work.tags` 的功能：
  ```typescript
    const filteredAndSortedWorks = useMemo(() => {
      let result = [...currentWorks];
      
      // 按选中的标签进行二次过滤
      if (selectedTagId !== null) {
        result = result.filter(work => 
          work.tags && work.tags.some(t => t.documentId === selectedTagId)
        );
      }

      if (sortBy === 'spend') {
        result.sort((a, b) => b.Spend - a.Spend);
      } else {
        result.sort((a, b) => (b.Rank || 0) - (a.Rank || 0) || (b.id || 0) - (a.id || 0));
      }
      return result;
    }, [currentWorks, sortBy, selectedTagId]);
  ```

- [ ] **Step 4: 本地编译测试，保证全部静态页面生成正常**
  
  在 `frontend-v2` 目录下运行：`npm run build`
  预期输出：构建成功。

- [ ] **Step 5: 提交代码**

  ```bash
  git add frontend-v2/src/components/WorksFilterGrid.tsx
  git commit -m "feat(frontend): implement tag selection and filtering inside works filter grid"
  ```
