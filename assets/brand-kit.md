# Kovin — Brand Kit

> *"We don't sell more. We sell right."*

A complete reference for designers, developers, and anyone building on or with the Kovin brand.

---

## Table of Contents

1. [Brand Essence](#1-brand-essence)
2. [Logo & Wordmark](#2-logo--wordmark)
3. [Color Palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Motion & Animation](#6-motion--animation)
7. [Iconography](#7-iconography)
8. [Photography Style](#8-photography-style)
9. [Voice & Tone](#9-voice--tone)
10. [Do / Don't](#10-do--dont)

---

## 1. Brand Essence

### What Kovin Is

A curated electronics store for the Indian market. Not a marketplace. Not a deals platform. A curation — a small number of things we genuinely believe in, presented honestly.

### Brand Pillars

| Pillar | Meaning |
|--------|---------|
| **Curation** | We carry fewer things on purpose. Every product is chosen. |
| **Honesty** | We say "this is the right phone for most people" — not "buy this." |
| **Warmth** | Premium doesn't mean cold. We feel like a trusted friend, not a corporation. |
| **Depth** | We explain *why* something is good, not just *that* it is. |

### Positioning

Kovin lives between two extremes: the impersonal noise of Amazon and Flipkart, and the inaccessible luxury of Apple Stores. We are the knowledgeable friend who knows exactly what to buy — and why.

---

## 2. Logo & Wordmark

### The Wordmark: Kov·in

```
Kov·in
```

- Font: **Cormorant Garamond Semibold** (600 weight)
- The interpunct `·` is rendered as a **copper circle** (`#E35336`)
- Letter spacing: `0.08em`
- Never use all-caps or all-lowercase

### Files

| File | Use |
|------|-----|
| `assets/brand/logo.svg` | Default wordmark on light backgrounds |
| `assets/brand/logo-white.svg` | Reverse wordmark on dark backgrounds |
| `assets/brand/logo-mark.svg` | K monogram — app icon, QR overlay, favicon context |
| `assets/brand/logo-mark-light.svg` | K monogram on light tile |

### Minimum Size

- Wordmark: minimum **120px** wide in digital contexts
- Monogram: minimum **32×32px**

### Clear Space

Maintain clear space equal to the height of the "K" on all sides of the wordmark.

### Color Variations

| Background | Wordmark Color | Dot Color |
|-----------|---------------|-----------|
| Light (paper `#F7F4EF`) | Ink `#1A1612` | Copper `#E35336` |
| Dark (`#0D0B09`) | Paper `#F7F4EF` | Sand `#F4A460` |
| Copper background | Paper `#F7F4EF` | Paper `#F7F4EF` |

**Never** use the logo in gray, or change the dot to any color other than copper/sand.

---

## 3. Color Palette

### Primary Colors

| Name | Light Mode | Dark Mode | Role |
|------|-----------|----------|------|
| **Ink** | `#1A1612` | `#F7F4EF` | Text, borders, primary UI |
| **Paper** | `#F7F4EF` | `#0D0B09` | Background |
| **Paper Warm** | `#EDE8E0` | `#161210` | Cards, secondary surfaces |
| **Copper** | `#E35336` | `#E35336` | Brand accent, CTAs |
| **Copper Light / Sand** | `#F4A460` | `#F4A460` | Secondary accent, warmth |
| **Wood** | `#7B5940` | `#A07858` | Supporting depth accent |

### Opacity Scale (Ink)

Used for text hierarchy and borders. Always derived from ink, not pure black.

| Token | Value | Use |
|-------|-------|-----|
| `ink-60` | 60% ink | Muted text, secondary labels |
| `ink-40` | 40% ink | Subtle text, captions |
| `ink-20` | 20% ink | Hover borders |
| `ink-08` | 8% ink | Default borders, dividers |
| `ink-04` | 4% ink | Hairline layers |

### The Copper Rule

Copper (`#E35336`) is the **only** saturated color in the palette. It appears on:
- Primary CTA buttons
- Cart badge
- Product "fit line" italic text
- The interpunct in the wordmark
- Save/offer tags (used sparingly)

Do not introduce any other saturated colors. The warmth of the palette comes from the warm neutrals — not from additional accent hues.

---

## 4. Typography

### Font Stack

| Role | Font | Fallback |
|------|------|---------|
| **Display** | Cormorant Garamond | Georgia, Times New Roman, serif |
| **Body / UI** | Inter | -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif |

### Type Scale

| Token | Value | Use |
|-------|-------|-----|
| `--fs-hero` | `clamp(3.2rem, 5.5vw, 6.5rem)` | Hero headlines |
| `--fs-section` | `clamp(2.25rem, 3.5vw, 3.5rem)` | Section titles |
| `--fs-h3` | `clamp(1.75rem, 2.2vw, 2.25rem)` | Subheadings |
| `--fs-card` | `1.45rem` | Product card titles |
| `--fs-lead` | `1.1rem` | Intro paragraphs |
| `--fs-body` | `1rem` | Body copy |
| `--fs-small` | `0.9rem` | Secondary labels |
| `--fs-caption` | `0.82rem` | Specs, captions |
| `--fs-micro` | `0.72rem` | Badges, legal |

### Font Pairing Rules

**Cormorant Garamond** is for editorial, emotional, and aspirational moments:
- Hero headlines
- Product names
- Section titles
- Pull-quotes
- Collection character lines (400 italic)

**Inter** is for everything functional:
- Navigation labels
- Buttons and CTAs
- Prices
- Specs and features
- Form inputs
- All micro-copy

### Line Heights

| Token | Value | Use |
|-------|-------|-----|
| `--lh-tight` | `1.1` | Display headlines |
| `--lh-snug` | `1.3` | Subheadings, cards |
| `--lh-body` | `1.65` | Body paragraphs |
| `--lh-relaxed` | `1.8` | Long-form reading |

### Eyebrow Pattern

Used above section and collection titles:
```css
font-family: var(--font-body);
font-size: var(--fs-caption);       /* 0.82rem */
font-weight: 500;
letter-spacing: 0.12em;
text-transform: uppercase;
opacity: 0.45;
```

---

## 5. Spacing & Layout

### Spacing Scale

Uses an 8px base grid with named tokens:

| Token | Value | Common Use |
|-------|-------|-----------|
| `--sp-1` | `4px` | Micro gaps between inline elements |
| `--sp-2` | `8px` | Between related items |
| `--sp-3` | `12px` | Internal padding, icon gaps |
| `--sp-4` | `16px` | Default component padding |
| `--sp-5` | `24px` | Section internal spacing |
| `--sp-6` | `32px` | Component margins |
| `--sp-7` | `48px` | Section gaps (mobile) |
| `--sp-8` | `64px` | Section gaps (desktop) |
| `--sp-9` | `96px` | Large section spacing |
| `--sp-10` | `128px` | Hero vertical padding |

### Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | `8px` | Buttons, small chips |
| `--radius-md` | `16px` | Cards, inputs |
| `--radius-lg` | `24px` | Panels, overlays |
| `--radius-xl` | `36px` | Full panels, drawers |
| `--radius-full` | `9999px` | Pills, badges, dots |

### Layout Maxima

| Context | Max Width |
|---------|-----------|
| Page container | `1400px` |
| Body text | `640px` |
| Cart / checkout panel | `580px` |
| Mobile dock | `440px` |

---

## 6. Motion & Animation

### Philosophy

Motion is used to guide attention and communicate state changes — not to decorate. Every animation has a reason. Animations are fast and feel physical.

### Easing Tokens

| Token | Curve | Use |
|-------|-------|-----|
| `--ease-expo` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default — most transitions |
| `--ease-smooth` | `cubic-bezier(0.22, 1, 0.36, 1)` | Scrolling, continuous motion |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Badge pops, satisfying micro-interactions |

### Duration Guidelines

| Use | Duration |
|-----|---------|
| Micro (icon state, badge) | `150–200ms` |
| Standard (show/hide elements) | `320–380ms` |
| Modal / drawer entrance | `480–580ms` |
| Hero / scroll reveals | `600–800ms` |

### GSAP Conventions

- GSAP **owns** the transform matrix on animated elements — never mix CSS `transform` with GSAP on the same element
- Use `xPercent: -50` (not `x: '-50%'`) for centered elements — percentage stays stable at call-time
- All bottom-sheet panels enter with: `y: '100%'` → `y: 0`, duration `0.52s`, `power4.out`
- All modal overlays fade with: `opacity: 0` → `opacity: 1`, duration `0.36s`, `power2.out`
- `will-change: transform, opacity` on all GSAP-animated elements
- `backface-visibility: hidden` on fixed positioned animated elements (prevents subpixel jitter)

---

## 7. Iconography

### System

All icons use **Lucide Icons** style: 2px stroke, round linecap and linejoin, 24×24 viewBox.

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" 
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
```

### Usage Rules

- Icons are always `currentColor` — they inherit text color
- Touch targets minimum `44×44px` (icon can be 20–24px inside a larger tap area)
- Do not fill icons except for the cart badge counter and special state indicators
- Icon sizes: `16px` (inline), `20px` (UI default), `24px` (dock/nav), `32px` (feature highlights)

---

## 8. Photography Style

### The Kovin Aesthetic

Photography should feel like a considered editorial — not a product catalogue. The goal is to show a *life* that includes these products, not a product on a white background.

### Visual Principles

| Principle | Description |
|-----------|-------------|
| **Warm, ambient light** | Golden hour, soft window light, never harsh studio flash |
| **Lived-in environments** | Products in context: coffee tables, desks, morning routines |
| **Depth and blur** | Shallow depth of field. Products sharp, backgrounds soft. |
| **Warm neutral palette** | Backgrounds match paper/ink palette — no random colours |
| **Never glossy** | Matte surfaces, natural textures, honest materials |
| **Cropping** | Generous breathing room. Never packed or claustrophobic. |

### Available Campaign Images

| File | Subject |
|------|---------|
| `Photos/01_kovin_hero_master_visual.png` | Master hero — brand establishing shot |
| `Photos/02_kovin_daily_life_technology.png` | Daily companions in lifestyle context |
| `Photos/03_kovin_immersive_audio_experience.png` | Headphones / audio lifestyle |
| `Photos/04_kovin_premium_entertainment_space.png` | Living room / television context |
| `Photos/05_kovin_smart_accessories_flatlay.png` | Accessories flat-lay, styled |
| `Photos/06_kovin_guided_technology_experience.png` | Human + technology guidance moment |
| `Photos/07_kovin_mobile_first_digital_experience.png` | Smartphone in use, hands |
| `Photos/08_kovin_cinematic_product_rail.png` | Cinematic product lineup |
| `Photos/09_kovin_trust_service_experience.png` | Trust / service / care context |
| `Photos/10_kovin_brand_signature_visual.png` | Brand signature — closing/about |

---

## 9. Voice & Tone

### The Kovin Voice

Kovin speaks like **a knowledgeable friend who has already done the research** — not a salesperson, not a spec sheet, not a brand trying to seem cool.

### Tone Attributes

| Attribute | Meaning |
|-----------|---------|
| **Honest** | We say what something is actually for. We name its limits. |
| **Calm** | Never urgent, never "limited time only." |
| **Specific** | "One phone. The right one." — not "Amazing smartphone deals!" |
| **Warm** | Human warmth, not corporate politeness. |
| **Quiet confidence** | We don't need to shout. The curation speaks. |

### Writing Patterns

**Headlines**: Short. Specific. Often incomplete sentences.
- ✅ "Two phones. Two honest choices. Nothing more."
- ✅ "The right screen for most living rooms."
- ❌ "Explore Our Amazing Range of Premium Smartphones!"

**Product descriptions**: Lead with who it's for, then what it does, then the technical detail.
- ✅ "For the person who wants one great phone without the research."
- ❌ "Featuring 50MP camera and 5000mAh battery for all-day performance!"

**CTAs**: Direct, not pushy. Specific, not generic.
- ✅ "Buy Now" / "Add to Cart" / "View Details"
- ❌ "Shop Amazing Deals!" / "Get Yours Today!"

**Prices**: Show clearly. Never hide. Never discount-spam.
- ✅ `₹79,900` with a quiet `₹89,900` strikethrough when genuinely discounted
- ❌ "SAVE 40%!! LIMITED OFFER!!"

### What We Never Say

- "Amazing" / "Incredible" / "Revolutionary"
- "Limited time" / "Hurry" / "Don't miss out"
- Exclamation marks on product claims
- Anything that requires the word "literally"

---

## 10. Do / Don't

### Logo

| ✅ Do | ❌ Don't |
|-------|---------|
| Use on paper or dark backgrounds | Stretch or distort the wordmark |
| Keep the copper interpunct dot | Change the dot colour |
| Maintain clear space | Place on busy or clashing backgrounds |
| Use the monogram for icon contexts | Use at sizes below minimum |

### Color

| ✅ Do | ❌ Don't |
|-------|---------|
| Use warm ink for all text | Use pure black `#000000` |
| Derive opacity from ink, not black | Add new accent colors |
| Use copper sparingly for true accents | Use copper for all interactive elements |
| Stay within the warm neutral palette | Use cool grays or blue-tinted whites |

### Typography

| ✅ Do | ❌ Don't |
|-------|---------|
| Cormorant for editorial moments | Cormorant for UI labels or buttons |
| Inter for all functional text | Mix more than two fonts |
| Use italic Cormorant for emotional lines | Fake-bold with `font-weight: 900` |
| Use `clamp()` for responsive sizing | Fix font sizes in px for body copy |

### Motion

| ✅ Do | ❌ Don't |
|-------|---------|
| Animate with purpose (state change) | Animate for decoration |
| Use expo or smooth easing | Use linear easing |
| Keep entrances under 600ms | Loop animations without user action |
| Respect `prefers-reduced-motion` | Autoplay video or flashing content |

---

*Kovin Brand Kit v1.0 — May 2025*
