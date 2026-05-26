"use client";

import { BlocksRenderer } from '@strapi/blocks-react-renderer';

function preprocessContent(content: any): any {
  if (!Array.isArray(content)) return content;

  // Deep clone content to avoid mutating cache/props
  const clone = JSON.parse(JSON.stringify(content));

  return clone.map((block: any) => {
    if (block.type !== 'paragraph') return block;

    const children = block.children || [];

    // Step 1: Remove redundant ** that surround bold blocks
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'text' && !child.bold) {
        if (i < children.length - 1 && children[i + 1].bold && child.text.endsWith('**')) {
          child.text = child.text.slice(0, -2);
        }
        if (i > 0 && children[i - 1].bold && child.text.startsWith('**')) {
          child.text = child.text.slice(2);
        }
      }
    }

    // Step 2: Parse remaining literal **bold** in the text nodes
    const newChildren: any[] = [];
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.type === 'text' && !child.bold) {
        const text = child.text;
        const parts = text.split('**');
        for (let j = 0; j < parts.length; j++) {
          if (parts[j] === '') continue;
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

    return {
      ...block,
      children: newChildren
    };
  });
}

export default function CustomBlocksRenderer({ content }: { content: any }) {
  const processedContent = preprocessContent(content);

  return (
    <BlocksRenderer 
      content={processedContent} 
      blocks={{
        heading: ({ children, level }: any) => {
          const text = children[0]?.props?.text || "";
          const id = text ? `heading-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}` : undefined;
          const Tag = `h${level}` as any;
          return <Tag id={id}>{children}</Tag>;
        },
        paragraph: ({ children }: any) => {
          // Check if children[0] is a string starting with a number and dot (e.g. "1. ")
          if (children && children.length > 0 && typeof children[0] === 'string') {
            const match = children[0].match(/^\s*(\d+)\.\s*(.*)$/);
            if (match) {
              const num = match[1];
              const rest = match[2];
              const remainingChildren = rest 
                ? [rest, ...children.slice(1)] 
                : children.slice(1);

              return (
                <div className="flex items-start gap-3 mb-6 leading-relaxed">
                  <span className="font-black text-emerald-400 select-none shrink-0 w-6 text-left text-lg md:text-xl">
                    {num}.
                  </span>
                  <div className="flex-1 text-zinc-200 text-base md:text-lg">
                    {remainingChildren}
                  </div>
                </div>
              );
            }
          }
          return (
            <p className="mb-6 leading-relaxed text-zinc-200 text-base md:text-lg">
              {children}
            </p>
          );
        }
      }}
    />
  );
}
