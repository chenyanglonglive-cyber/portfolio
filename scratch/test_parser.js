const fs = require('fs');

const data = {"data":[{"id":8,"documentId":"ra3gl2b5sdga1etjyyfg4pf9","title":"我的优势","content":[{"type":"paragraph","children":[{"text":"1. **","type":"text"},{"bold":true,"text":"爆款素材与投放战绩突出","type":"text"},{"text":"**：主导《雷霆战机》微信小游戏买量，产出抖音巨量**单条消耗超500万**、广点通**单条消耗超60万**的现象级素材，数据至今无人打破；项目稳居**微信小游戏畅销榜TOP10**，海外Bingo游戏长期霸榜**iOS Casino排行榜TOP1-3**，擅长打造高转化、高量级跑量素材。","type":"text"}]},{"type":"paragraph","children":[{"text":"2. **","type":"text"},{"bold":true,"text":"AIGC全链路能力强，懂AI提效与工具化","type":"text"},{"text":"**：精通AI视频全流程，自研**Gemini智能体+场景化工作流**，覆盖创意衍生、分镜生成、成片制作；擅长用AI Agent解决岗位痛点，**自动化素材管理、日报生成、资源巡检**，显著提升个人与团队效率。","type":"text"}]},{"type":"paragraph","children":[{"text":"3. **","type":"text"},{"bold":true,"text":"创意储备深厚，网感强、文字能力突出","type":"text"},{"text":"**：阅片量极大，熟悉**北美文化、美剧、好莱坞电影**，长期跟进海外热点与流行梗；网感敏锐、文字组织与脚本写作能力强，**能把文化洞察、热点趋势快速转化为高吸引力创意**，素材更抓用户、更懂市场。","type":"text"}]},{"type":"paragraph","children":[{"text":"4. **","type":"text"},{"bold":true,"text":"海内外买量经验全面，懂休闲游戏与信息流","type":"text"},{"text":"**：国内擅长微信小游戏、抖音信息流，海外深耕**solitaire、bingo、block**等休闲游戏买量；熟悉北美用户画像与投放逻辑，能根据产品阶段精准调整素材方向，**在吸量与ROI提升上有成熟方法论**。","type":"text"}]},{"type":"paragraph","children":[{"text":"5. **","type":"text"},{"bold":true,"text":"动画专业+PM+UI跨界背景，画面与镜头感扎实","type":"text"},{"text":"**：动画本科，**手绘能力强、分镜与镜头语言成熟**；具备产品UI经验，懂人机交互与用户体验，兼顾视觉冲击力与转化逻辑，素材好看、好懂、好转化。","type":"text"}]},{"type":"paragraph","children":[{"text":"","type":"text"}]},{"type":"paragraph","children":[{"text":"","type":"text"}]},{"type":"paragraph","children":[{"text":"","type":"text"}]}],"createdAt":"2026-04-10T16:22:45.335Z","updatedAt":"2026-05-23T14:33:57.421Z","publishedAt":"2026-05-23T14:33:57.454Z"}]};

function preprocessContent(content) {
  if (!Array.isArray(content)) return content;

  return content.map(block => {
    if (block.type !== 'paragraph') return block;

    let children = block.children || [];

    // Step 1: Remove redundant ** that surround bold blocks
    // If a text node ends with '**' and is followed by a bold node, remove '**' from it.
    // If a text node starts with '**' and is preceded by a bold node, remove '**' from it.
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'text' && !child.bold) {
        // Check next child
        if (i < children.length - 1 && children[i+1].bold && child.text.endsWith('**')) {
          child.text = child.text.slice(0, -2);
        }
        // Check prev child
        if (i > 0 && children[i-1].bold && child.text.startsWith('**')) {
          child.text = child.text.slice(2);
        }
      }
    }

    // Step 2: Parse remaining literal **bold** in the text nodes
    let newChildren = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'text' && !child.bold) {
        const text = child.text;
        // Split by **
        const parts = text.split('**');
        for (let j = 0; j < parts.length; j++) {
          if (parts[j] === '') continue; // Skip empty parts
          // Alternating bold: odd indices are inside **, even indices are outside
          if (j % 2 === 1) {
            newChildren.push({ type: 'text', bold: true, text: parts[j] });
          } else {
            newChildren.push({ type: 'text', text: parts[j] });
          }
        }
      } else {
        newChildren.push(child);
      }
    }

    // Step 3: Check if the paragraph starts with a number (e.g., "1. ", "2. ")
    let number = null;
    if (newChildren.length > 0 && newChildren[0].type === 'text' && !newChildren[0].bold) {
      const match = newChildren[0].text.match(/^\s*(\d+)\.\s*(.*)$/);
      if (match) {
        number = match[1];
        const remainingText = match[2];
        if (remainingText) {
          newChildren[0].text = remainingText;
        } else {
          newChildren.shift(); // Remove the first child if it only contained the number
        }
      }
    }

    return {
      ...block,
      children: newChildren,
      number: number // Attach the number if found
    };
  });
}

const processed = preprocessContent(data.data[0].content);
console.log(JSON.stringify(processed, null, 2));
