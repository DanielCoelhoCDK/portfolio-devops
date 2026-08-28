---
name: Synthetic Infrastructure
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bcc9cd'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#869397'
  outline-variant: '#3d494c'
  surface-tint: '#4cd7f6'
  primary: '#4cd7f6'
  on-primary: '#003640'
  primary-container: '#06b6d4'
  on-primary-container: '#00424f'
  inverse-primary: '#00687a'
  secondary: '#4ae176'
  on-secondary: '#003915'
  secondary-container: '#00b954'
  on-secondary-container: '#004119'
  tertiary: '#ffb2b7'
  on-tertiary: '#67001b'
  tertiary-container: '#ff7f8b'
  on-tertiary-container: '#7d0023'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#acedff'
  primary-fixed-dim: '#4cd7f6'
  on-primary-fixed: '#001f26'
  on-primary-fixed-variant: '#004e5c'
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#ffdadb'
  tertiary-fixed-dim: '#ffb2b7'
  on-tertiary-fixed: '#40000d'
  on-tertiary-fixed-variant: '#92002a'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is engineered for a DevOps and Cloud Engineering context, emphasizing reliability, automation, and technical precision. The brand personality is "Industrial Digital"—combining the raw, functional aesthetic of a terminal with the polished, high-end feel of modern cloud architecture.

The visual style leans into **Glassmorphism** and **Modern Corporate** aesthetics. It utilizes deep layering, subtle translucent surfaces, and vibrant accent colors to guide the user through complex data environments. The emotional response should be one of absolute control, clarity, and high-performance engineering.

## Colors
The palette is rooted in a "Deep Space" dark mode to reduce eye strain during long engineering sessions. 

- **Primary (Cyan):** Reserved for primary actions, active states, and high-level progress indicators.
- **Success (Terminal Green):** Used for deployment status, "running" states, and validated inputs.
- **Backgrounds:** The foundation uses Deep Slate (#0f172a) for the lowest layer, with Navy (#1e293b) used for elevated surface containers and cards.
- **Accents:** Tertiary Red is used sparingly for alerts and destructive actions.

## Typography
The typography strategy employs a dual-font approach. **Inter** provides high legibility for prose, navigation, and headers, ensuring the interface feels professional and modern. **JetBrains Mono** is utilized for technical metadata, labels, and code snippets to reinforce the developer-centric nature of the portfolio.

Large headers should use tighter letter spacing for a "technical impact" look, while monospaced labels should use all-caps and increased letter spacing to differentiate them from body content.

## Layout & Spacing
The layout follows a **Fluid Grid** system based on a 12-column architecture for desktop. 

- **Desktop:** 12 columns, 24px gutters, and 40px side margins. 
- **Tablet:** 8 columns, 16px gutters, 24px side margins.
- **Mobile:** 4 columns, 16px gutters, 16px side margins.

Content blocks should adhere strictly to the 4px baseline grid to maintain an "engineered" feel. Use generous vertical spacing (lg/xl) between major sections to mimic the airy feel of modern infrastructure diagrams.

## Elevation & Depth
Elevation in this design system is achieved through **Tonal Layering** and **Glassmorphism**. 

- **Level 0 (Base):** Deep Slate (#0f172a).
- **Level 1 (Cards/Containers):** Navy (#1e293b) with a 1px border of #334155.
- **Level 2 (Overlays/Modals):** A semi-transparent Navy with `backdrop-filter: blur(12px)`. 

Shadows are not used for depth; instead, depth is conveyed through subtle inner glows (1px primary-color strokes at 10% opacity) and increasing the lightness of the background color as the element "rises" toward the user.

## Shapes
The shape language is "Soft-Industrial." Elements use a consistent 0.25rem (4px) corner radius to feel precise and rigid, avoiding the overly-playful roundness of consumer apps. Tags and badges may use the `rounded-lg` (8px) setting to provide a slight visual contrast against the more angular card containers.

## Components
- **Interactive Cards:** Features a Navy background with a 1px border. On hover, the border transitions to Cyan and the background gains a subtle 5% Cyan tint.
- **Badges/Tags:** Use JetBrains Mono. Styled as "Ghost" badges with a subtle background fill (10% of the accent color) and a solid 1px border of the same color.
- **Buttons:** 
    - *Primary:* Solid Cyan with Black text for maximum contrast.
    - *Secondary:* Ghost style with Cyan border and text.
- **Terminal Inputs:** Form fields should look like CLI prompts, using a background slightly darker than the card color and a "Terminal Green" focus ring.
- **Status Indicators:** Use a "pulsing" animation for "Live" or "Running" states using Terminal Green.
- **Progress Bars:** Thin (4px) Cyan lines with a glow effect (drop-shadow) to simulate high-energy data transfer.