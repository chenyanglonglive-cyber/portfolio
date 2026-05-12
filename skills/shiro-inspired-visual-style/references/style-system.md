# Shiro-Inspired Style System

## Source Mood

Use these public references as inspiration only:

- innei.in: minimalist personal home with avatar, direct greeting, short role statement, recent writing, compact footer links, theme/language controls.
- Innei/Shiro: described as a minimalist personal website with the purity of paper and freshness of snow, built with modern Next.js, Tailwind, motion, and accessible UI primitives.

Do not copy exact source code, assets, logos, text, layout measurements, or distinctive brand marks.

## Design Tokens

Recommended light theme:

```css
:root {
  --background: 38 38% 97%;
  --foreground: 230 18% 12%;
  --muted: 230 8% 46%;
  --muted-foreground: 230 7% 58%;
  --card: 0 0% 100%;
  --card-foreground: 230 18% 12%;
  --border: 230 16% 90%;
  --accent: 210 72% 56%;
  --accent-soft: 210 90% 96%;
  --ring: 210 72% 56%;
  --radius-card: 1rem;
  --radius-pill: 999px;
}
```

Recommended dark theme:

```css
:root.dark {
  --background: 230 18% 8%;
  --foreground: 220 22% 94%;
  --muted: 225 12% 64%;
  --muted-foreground: 225 8% 54%;
  --card: 230 18% 11%;
  --card-foreground: 220 22% 94%;
  --border: 230 12% 20%;
  --accent: 210 82% 66%;
  --accent-soft: 210 34% 18%;
  --ring: 210 82% 66%;
}
```

## Typography

- Use a system sans stack or a quiet variable sans font.
- Use large but calm hero type: 42-64px desktop, 34-42px mobile.
- Body text should be 16-18px with 1.75-1.9 line-height.
- Avoid all-caps headings except small metadata labels.
- Keep letter spacing at 0 unless using tiny uppercase metadata.

## Layout

Home:

- Center a narrow hero within a max-width page.
- Show avatar or portrait near the introduction.
- Include a compact stats/status row only if it supports the identity.
- Put selected works below the intro, not in a dense dashboard.

Resume:

- Use a readable document-like page.
- Prefer sections separated by whitespace and hairline borders.
- Use timeline rows for work experience.
- Keep skills as simple chips or soft progress rows.

Works:

- Use a calm grid, 2-3 columns desktop, 1 column mobile.
- Cards should be image-first when cover art exists.
- Use gentle hover: translateY(-2px), shadow increase, or image scale 1.02.
- Filters should be small pills, not large segmented dashboards.

Navigation:

- Floating top nav or compact header.
- Use translucent background with blur and a thin border.
- Active item can be indicated by accent text, a dot, or a fine underline.

Footer:

- Keep small, quiet, and link-focused.
- Avoid large promotional CTA blocks.

## Motion

Use subtle motion:

- Page entrance: opacity 0 -> 1, translateY(8px) -> 0, 240-420ms.
- Card hover: translateY(-2px), 180-220ms.
- Image hover: scale(1.02), 300-500ms.
- Use spring easing only for small UI elements.

Respect reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Anti-Patterns

- Do not use cyberpunk panels, neon frames, pixel art, or terminal motifs.
- Do not create nested cards.
- Do not use heavy glassmorphism everywhere.
- Do not make a marketing landing page when the user asked for a portfolio.
- Do not add comments, like counters, reader counters, subscriptions, RSS, language switchers, or analytics unless explicitly requested.
- Do not import Shiro components into a commercial or private project without reviewing license obligations.
