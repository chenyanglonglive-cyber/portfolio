# Portfolio V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium portfolio for a Game Advertising Designer using Next.js 16, Strapi 5, and custom visual effects.

**Architecture:** Next.js 16 App Router for the frontend, Strapi 5 as the Headless CMS, and Framer Motion for animations.

**Tech Stack:** Next.js 16, Tailwind CSS 4, Framer Motion, Lucide React, Strapi 5.

---

### Task 1: Foundation & Global Visuals

**Files:**
- Modify: `frontend-v2/src/app/globals.css`
- Create: `frontend-v2/src/components/StarBackground.tsx`
- Modify: `frontend-v2/src/app/layout.tsx`

- [ ] **Step 1: Implement Star Background CSS in globals.css**
  Based on CodePen LYGbwj, add the stars animation logic.

```css
/* frontend-v2/src/app/globals.css */
@keyframes animStar {
  from { transform: translateY(0px); }
  to { transform: translateY(-2000px); }
}

#stars, #stars2, #stars3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  background: transparent;
  z-index: -1;
}

/* We will use a JS utility or a pre-calculated string for the box-shadows in the component */
```

- [ ] **Step 2: Create StarBackground Component**

```tsx
// frontend-v2/src/components/StarBackground.tsx
"use client";
import React, { useEffect, useState } from 'react';

const generateStars = (count: number) => {
  let stars = "";
  for (let i = 0; i < count; i++) {
    stars += `${Math.random() * 2000}px ${Math.random() * 2000}px #FFF${i < count - 1 ? ',' : ''}`;
  }
  return stars;
};

export default function StarBackground() {
  const [shadows, setShadows] = useState({ s1: '', s2: '', s3: '' });

  useEffect(() => {
    setShadows({
      s1: generateStars(700),
      s2: generateStars(200),
      s3: generateStars(100),
    });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none bg-zinc-950 z-[-1]">
      <div id="stars" style={{ boxShadow: shadows.s1, animation: 'animStar 50s linear infinite' }} />
      <div id="stars2" style={{ boxShadow: shadows.s2, animation: 'animStar 100s linear infinite', width: '2px', height: '2px' }} />
      <div id="stars3" style={{ boxShadow: shadows.s3, animation: 'animStar 150s linear infinite', width: '3px', height: '3px' }} />
    </div>
  );
}
```

- [ ] **Step 3: Integrate StarBackground into Layout**
  Add the component to `layout.tsx`.

---

### Task 2: Wave Loading Screen

**Files:**
- Create: `frontend-v2/src/components/LoadingScreen.tsx`
- Modify: `frontend-v2/src/app/layout.tsx`

- [ ] **Step 1: Implement Wave Loading Animation**
  Based on CodePen dvBwVw.

```tsx
// frontend-v2/src/components/LoadingScreen.tsx
"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center overflow-hidden"
        >
          <div className="relative w-40 h-40 rounded-full border-4 border-white/20 overflow-hidden">
            <div className="absolute inset-0 bg-zinc-900" />
            <div className="wave-container">
               <div className="wave" />
               <div className="wave" />
               <div className="wave" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Add Wave CSS to globals.css**

---

### Task 3: Navigation & Homepage Structure

**Files:**
- Modify: `frontend-v2/src/components/Navbar.tsx`
- Modify: `frontend-v2/src/app/page.tsx`

- [ ] **Step 1: Refine Navbar**
  Order: Home, Resume, Works, Blog. Remove secondary nav.

- [ ] **Step 2: Build Homepage Sections**
  Implement the Hero (Slogan + Intro) and the featured grids.

---

### Task 4: Strapi Content Modeling

**Action:**
- Configure `Works` and `Articles` collection types in Strapi Admin.
- Add fields: `Spend`, `ROI_7D`, `Type (enum: Video, Image)`, `IsFeatured (boolean)`.

---

### Task 5: Works Page with Dynamic Preview

**Files:**
- Create: `frontend-v2/src/app/works/page.tsx`
- Create: `frontend-v2/src/components/WorkCard.tsx`

- [ ] **Step 1: Implement WorkCard with Hover Video Preview**
  Use `onMouseEnter` / `onMouseLeave` to trigger video playback.
