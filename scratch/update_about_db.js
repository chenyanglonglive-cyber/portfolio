const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://strapi:Strapi54007!@127.0.0.1:5432/strapi'
});

const listContent = [
  {
    "type": "list",
    "format": "ordered",
    "children": [
      {
        "type": "list-item",
        "children": [
          { "type": "text", "bold": true, "text": "爆款素材与投放战绩突出" },
          { "type": "text", "text": "：主导《雷霆战机》微信小游戏买量，产出抖音巨量" },
          { "type": "text", "bold": true, "text": "单条消耗超800万" },
          { "type": "text", "text": "、广点通" },
          { "type": "text", "bold": true, "text": "单条消耗超60万" },
          { "type": "text", "text": "的现象级素材，数据至今无人打破；项目稳居" },
          { "type": "text", "bold": true, "text": "微信小游戏畅销榜TOP10" },
          { "type": "text", "text": "，海外Bingo游戏长期霸榜" },
          { "type": "text", "bold": true, "text": "iOS Casino排行榜TOP1-3" },
          { "type": "text", "text": "，擅长打造高转化、高量级跑量素材。" }
        ]
      },
      {
        "type": "list-item",
        "children": [
          { "type": "text", "bold": true, "text": "AIGC全链路能力强，懂AI提效与工具化" },
          { "type": "text", "text": "：精通AI视频全流程，自研" },
          { "type": "text", "bold": true, "text": "Gemini智能体+场景化工作流" },
          { "type": "text", "text": "，覆盖创意衍生、分镜生成、成片制作；擅长用AI Agent解决岗位痛点，" },
          { "type": "text", "bold": true, "text": "自动化素材管理、日报生成、资源巡检" },
          { "type": "text", "text": "，显著提升个人与团队效率。" }
        ]
      },
      {
        "type": "list-item",
        "children": [
          { "type": "text", "bold": true, "text": "创意储备深厚，网感强、文字能力突出" },
          { "type": "text", "text": "：阅片量极大，熟悉" },
          { "type": "text", "bold": true, "text": "北美文化、美剧、好莱坞电影" },
          { "type": "text", "text": "，长期跟进海外热点与流行梗；网感敏锐、文字组织与脚本写作能力强，" },
          { "type": "text", "bold": true, "text": "能把文化洞察、热点趋势快速转化为高吸引力创意" },
          { "type": "text", "text": "，素材更抓用户、更懂市场。" }
        ]
      },
      {
        "type": "list-item",
        "children": [
          { "type": "text", "bold": true, "text": "海内外买量经验全面，懂休闲游戏与信息流" },
          { "type": "text", "text": "：国内擅长微信小游戏、抖音信息流，海外深耕" },
          { "type": "text", "bold": true, "text": "solitaire、bingo、block" },
          { "type": "text", "text": "等休闲游戏买量；熟悉北美用户画像与投放逻辑，能根据产品阶段精准调整素材方向，" },
          { "type": "text", "bold": true, "text": "在吸量与ROI提升上有成熟方法论" },
          { "type": "text", "text": "。" }
        ]
      },
      {
        "type": "list-item",
        "children": [
          { "type": "text", "bold": true, "text": "动画专业+PM+UI跨界背景，画面与镜头感扎实" },
          { "type": "text", "text": "：动画本科，" },
          { "type": "text", "bold": true, "text": "手绘能力强、分镜与镜头语言成熟" },
          { "type": "text", "text": "；具备产品UI经验，懂人机交互与用户体验，兼顾视觉冲击力与转化逻辑，素材好看、好懂、好转化。" }
        ]
      }
    ]
  }
];

async function run() {
  try {
    await client.connect();
    console.log('Connected to local DB on ECS');
    
    const query = 'UPDATE abouts SET content = $1 WHERE id = 8 OR id = 5;';
    const values = [JSON.stringify(listContent)];
    
    const res = await client.query(query, values);
    console.log('Update completed. Rows affected:', res.rowCount);
  } catch (err) {
    console.error('Error during update:', err);
  } finally {
    await client.end();
  }
}

run();
