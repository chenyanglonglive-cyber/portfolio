---
name: shiro-inspired-visual-style
description: Apply a minimalist personal-site visual language inspired by innei.in and the Shiro/Yohaku family of sites. Use when designing or refactoring a Next.js, React, HTML, Tailwind, or CSS portfolio/blog frontend that should feel quiet, paper-like, spacious, refined, animated with subtle spring motion, and suitable for home, resume, and works pages without implementing comments or Mix Space-specific features.
---

# Shiro-Inspired Visual Style

## Principle

Create an original interface that captures the visual language of innei.in/Shiro without copying source code, proprietary assets, exact branding, or comments/community features. Treat the target as a mood board: quiet paper, soft snow, restrained motion, reading-first layout, and carefully tuned empty space.

Read `references/style-system.md` before implementing a page or component in this style.

## Workflow

1. Audit the current frontend routes, content model, and assets before editing.
2. Preserve the product scope requested by the user. For portfolio builds, keep only home, resume, and works unless explicitly asked for articles, comments, RSS, auth, or realtime features.
3. Define design tokens first: background, foreground, muted text, card, border, accent, radius, shadow, and motion durations.
4. Build page shells with generous max-width containers, narrow reading columns, floating/blurred navigation, low-contrast borders, and calm typography.
5. Add micro-interactions sparingly: hover lift, opacity reveal, soft blur, spring-like entrance, and active nav underline/dot.
6. Verify desktop and mobile screenshots. Check that spacing, text wrapping, navigation, cards, and hero content do not overlap.

## Visual Rules

- Prefer light mode as the primary experience: off-white background, near-black text, gray secondary text, and one soft accent color.
- Use cards as thin, quiet surfaces, not heavy dashboard panels.
- Keep radius moderate: typically 12-20px for cards, 999px only for pills/avatar controls.
- Use shadows as ambient depth, not dramatic elevation.
- Use line length discipline: prose should stay readable, usually 60-76 characters wide.
- Avoid neon, cyberpunk, strong gradients, large decorative blobs, and dense dark panels.
- Use illustration/media only when it supports the person or work. Do not add stock-like decorative imagery to fill space.
- Use comments only in code when needed; do not implement a visual or functional comment system.

## Next.js Guidance

- Prefer App Router with `app/page.tsx`, `app/resume/page.tsx`, and `app/works/page.tsx`.
- Keep data fetching behind small typed helpers such as `lib/strapi.ts`.
- Store visual primitives in `components/site/*` or `components/ui/*`.
- Use CSS variables in `app/globals.css` for theme tokens; map them into Tailwind when appropriate.
- Use `next/image` for R2/Strapi media after configuring remote image domains.

## Output Checklist

- Home presents identity, short bio, status/social links, and selected works.
- Resume presents profile, skills, work experience, education, and contact in a calm long-form layout.
- Works presents a filterable or grouped gallery, with cover, title, role/type, tags, and date.
- The interface still feels polished when content is missing or loading.
- The implementation contains no Shiro source-code copy, no Mix Space dependency, and no comment system unless the user later requests one.
