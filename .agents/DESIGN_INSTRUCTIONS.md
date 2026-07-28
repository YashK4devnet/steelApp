# RNE Mobile Design System

## Project Overview

This application is an internal business application for **Rathi North East Brother Private Limited (RNE)**.

The application will primarily be used by employees on Android devices through Capacitor.

The design language should communicate:

- Professionalism
- Trust
- Simplicity
- Speed
- Consistency

This application blends enterprise utility with premium design.

Embrace a modern, flat, and highly polished aesthetic. We favor a sleek, lightweight interface that feels frictionless.

The application should feel similar to modern enterprise applications like:

- Linear
- Stripe Dashboard
- Apple Human Interface Guidelines (HIG)
- Microsoft Fluent 2
- Notion Mobile

The UI should prioritize speed, readability, and immediate usability over flashy visual effects.

---

# Design Philosophy

The UI should always be:

- Clean
- Spacious
- Professional
- Minimal
- Consistent
- Mobile First
- Fast feeling

Every screen should focus on helping users complete their task quickly.
Avoid visual clutter.
Whitespace is heavily encouraged.

---

# Color Palette

The color palette should be derived from the company logo, applied strictly and intentionally.

## Primary
Deep Navy
`#0A2E63`

Used for:
- Primary Buttons
- Headers
- Navigation
- Active Icons
- Links
- Selected States

## Accent
Corporate Red
`#C8102E`

Used sparingly for:
- Important Actions
- Notifications
- Badges
- Delete Buttons
- Error Indicators

Do NOT overuse red.

## Background
Subtle Gradient
`bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF]`

We use a soft layered interface rather than flat gray backgrounds. The interface should feel light and airy.
Avoid pure white backgrounds for the root layout.

## Surface
`#FFFFFF` (White)

Used for Cards, Dialogs, Sheets, Inputs.

## Primary Text
`#1F2937` (Dark Slate)

## Secondary Text
`#6B7280` (Gray-500)

## Borders
`rgba(15, 23, 42, 0.05)` or `border-slate-900/5`
Borders should be exceptionally thin and subtle.

---

# Typography

Use a modern hierarchy. Reduce the use of ALL CAPS and avoid excessive font weights.

Greeting / Subtitle:
16px, Medium / Regular

Name / Large Headers:
32px, Bold

Card Title:
18px, SemiBold

Body / Description:
14px, Regular

Caption / Helper Text:
12px, Regular

Never use more than four font sizes on one screen.

---

# Border Radius

- Cards: 20px - 24px (Large, friendly corners)
- Floating Navigation: Fully rounded (`rounded-full`)
- Buttons: 12px
- Inputs: 12px
- Bottom Sheets: 24px
- Dialogs: 24px

---

# Elevation & Shadows

Use extremely soft, premium shadows.
Avoid harsh shadows or large spreads.

Standard Premium Shadow for Cards:
`shadow-[0_8px_24px_rgba(15,23,42,0.05)]` or `shadow-[0_8px_24px_rgba(15,23,42,0.04)]`

Floating Navigation Shadow:
`shadow-[0_8px_32px_rgba(15,23,42,0.08)]`

**Never use glassmorphism or excessive blur.**

---

# Layout & Spacing

Use a strict 8pt spacing system.

- Top padding: 32px
- Section spacing: 24px
- Card spacing: 16px
- Internal card padding: 20px

Do not make components larger—make them breathe. Increase whitespace throughout the screen. Avoid arbitrary spacing.

---

# Mobile First

Design for phones first.
Minimum width: 360px
Maximum content width: 100%

Avoid desktop-specific layouts. Avoid hover-only interactions (ensure touch states exist). Everything should be thumb-friendly.

---

# Safe Areas

Respect:
- Android navigation bar
- Status bar
- Device cutouts

Never allow content underneath system UI.

---

# Navigation

**Bottom Navigation (Floating Pill Bar)**
Navigation should feel elevated from the page as a floating pill bar at the bottom center.

- Background: White with a subtle border and premium shadow.
- Active tab: Elevated "pill" style with a light blue background (`bg-primary/10`) and primary color text/icon.
- Inactive tabs: Gray icons and gray labels.
- Layout: Icon stacked with text or horizontal pill, depending on space.

---

# App Bar / Top Header

Keep it clean and balanced.
Instead of heavy cards, use minimal typography directly on the background gradient.

Example:
```
Good Morning,
[User Name] 👋
What would you like to do today?
```
Place a notification bell or avatar on the right. The header should feel balanced instead of left-heavy.

---

# Cards

Cards should be the primary layout container.

Cards should have:
- White background
- Premium soft shadow
- Thin slate border
- 20-24px rounded corners
- Generous internal padding (20px)

Card Interaction:
- Cards should clearly look interactive.
- Include a subtle chevron arrow (`→`) on the right side.

---

# Icons

Use a single icon library (Lucide React or Custom SVGs).
Increase icon size for primary actions to around 24-32px.
Icons should use slightly thicker strokes (`strokeWidth="2"` or `2.5`) for clarity and a premium feel.

Left Icon Area on Action Cards:
Use a circular colored icon container (`w-12 h-12 bg-primary/10 rounded-full`) instead of large heavy rectangles.

---

# Animations

Use highly performant, lightweight animations.

Card Press (Tap):
- `scale-[0.98]`
- Duration: 150ms
- Spring animation on release.
Cards should slightly push in on touch.

Avoid heavy animations, expensive blurs, bounce, elastic, or rotate transitions. Focus on speed.

---

# Things to Avoid

❌ Glassmorphism / Heavy Blurs
❌ Neumorphism
❌ Skeuomorphism
❌ Bright, saturated gradients for backgrounds
❌ Harsh, dark drop shadows
❌ Material Design 2 aesthetic
❌ Neon colors
❌ Inconsistent spacing
❌ Fancy fonts

✅ Stripe / Linear flat aesthetic
✅ Tasteful, extremely subtle background gradients
✅ Ultra-soft shadows
✅ Strict 8pt spacing system
✅ Clear visual hierarchy

---

# Overall Experience

Every screen should feel like it belongs to the same design system. The application should appear polished, modern, fast, and enterprise-ready.

When implementing new features, always reuse existing components and design tokens before creating new styles. Design decisions should favor clarity, consistency, and usability over visual complexity.