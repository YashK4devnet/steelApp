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

This is **NOT** a marketing website.

Avoid flashy designs, excessive animations, gradients, glassmorphism, or unnecessary decorative elements.

The application should feel similar to modern enterprise applications like:

- Microsoft Teams
- Notion
- Linear
- Stripe Dashboard
- Google Workspace
- Odoo Mobile

The UI should prioritize usability over visual effects.

---

# Design Philosophy

The UI should always be:

- Clean
- Spacious
- Professional
- Minimal
- Consistent
- Mobile First

Every screen should focus on helping users complete their task quickly.

Avoid visual clutter.

Whitespace is encouraged.

---

# Color Palette

The color palette should be derived from the company logo.

## Primary

Deep Navy

```
#0A2E63
```

Used for:

- Primary Buttons
- Headers
- Navigation
- Active Icons
- Links
- Selected States

---

## Accent

Corporate Red

```
#C8102E
```

Used sparingly for:

- Important Actions
- Notifications
- Badges
- Delete Buttons
- Error Indicators

Do NOT overuse red.

---

## Background

```
#F8FAFC
```

Very light gray.

Avoid pure white backgrounds everywhere.

---

## Surface

```
#FFFFFF
```

Cards

Dialogs

Sheets

Inputs

---

## Primary Text

```
#1F2937
```

---

## Secondary Text

```
#6B7280
```

---

## Borders

```
#E5E7EB
```

---

## Success

```
#22C55E
```

---

## Warning

```
#F59E0B
```

---

## Error

```
#DC2626
```

---

# Typography

Use:

Inter

Fallback:

System Fonts

Hierarchy:

Title

32px

Bold

---

Section Title

24px

Semi Bold

---

Card Title

18px

Semi Bold

---

Body

16px

Regular

---

Caption

14px

Regular

---

Helper Text

12px

Regular

Never use more than four font sizes on one screen.

---

# Border Radius

Cards

16px

Buttons

12px

Inputs

12px

Bottom Sheets

24px

Dialogs

20px

---

# Elevation

Use soft shadows.

Avoid harsh shadows.

Cards should feel slightly elevated.

Never use excessive blur.

---

# Layout

Spacing system:

4

8

12

16

24

32

48

Use multiples of 8 whenever possible.

Avoid arbitrary spacing.

---

# Mobile First

Design for phones first.

Minimum width:

360px

Maximum content width:

100%

Avoid desktop-specific layouts.

Avoid hover interactions.

Everything should be thumb-friendly.

---

# Safe Areas

Respect:

- Android navigation bar
- Status bar
- Device cutouts

Never allow content underneath system UI.

---

# Navigation

Bottom Navigation

Maximum:

5 Items

Icons should be outlined.

Active tab:

- Navy background
- White icon

Inactive:

Gray icon

---

# App Bar

Height

56px

Contains:

- Screen Title
- Optional Back Button
- Optional Action

Avoid clutter.

---

# Cards

Cards should be the primary layout container.

Cards should have:

- White background
- Soft shadow
- 16px padding
- Rounded corners

Avoid unnecessary borders.

---

# Buttons

Primary

- Navy
- White Text

Secondary

- White
- Navy Border

Danger

- Red

Disabled

- Light Gray

Buttons should be at least:

48px tall

---

# Forms

Forms are the core of this application.

Every input should have:

- Label
- Placeholder
- Helper text (optional)
- Validation message

Never rely only on placeholders.

---

# Inputs

Rounded

Filled white

Subtle border

Focus state:

Navy border

Error state:

Red border

---

# Question Cards

Audit questions should be displayed as cards.

Each card should contain:

Question Number

Question Title

Question Input

Remarks

Attachments

Status

Cards should have generous spacing.

Never crowd questions together.

---

# Icons

Use:

Lucide React

or

Heroicons

Use a single icon library throughout the project.

---

# Animations

Animations should feel subtle.

Allowed:

Fade

Slide

Scale

Duration:

150ms–250ms

Avoid:

Bounce

Elastic

Rotate

Large transitions

Business applications should feel responsive rather than playful.

---

# Loading

Use:

Skeleton loaders

Progress indicators

Avoid blocking the UI whenever possible.

---

# Empty States

Every empty screen should include:

Illustration (optional)

Title

Description

Primary Action

Avoid blank pages.

---

# Error States

Display:

Simple title

Friendly explanation

Retry button

Avoid exposing technical errors.

---

# Toasts

Use toast notifications for:

Save Success

Update Success

Delete Success

Connection Lost

Errors

Keep messages concise.

---

# Dialogs

Dialogs should be used only for:

Delete Confirmation

Critical Actions

Permissions

Avoid excessive confirmation dialogs.

---

# Bottom Sheets

Use bottom sheets for:

Filters

Selection Lists

Quick Actions

They should feel native to Android.

---

# Lists

Lists should:

Have consistent spacing

Support pull-to-refresh

Use lazy loading when appropriate

Support search

Support filtering

---

# Search

Search should always remain accessible.

Large searchable lists should include:

Search Bar

Filters

Sorting

---

# Accessibility

Touch targets

Minimum:

48x48

Text contrast should meet accessibility guidelines.

Never rely on color alone to communicate information.

---

# Consistency Rules

Every screen should use the same:

Spacing

Typography

Button Styles

Card Styles

Input Styles

Navigation

Do not redesign components per page.

---

# Component Reuse

Create reusable components for:

Primary Button

Secondary Button

Input

Card

Modal

Loader

Empty State

Error State

Search Bar

Section Header

Question Card

Avatar

Badge

Chip

Dialog

Bottom Sheet

Do not duplicate UI code.

---

# Business Application Guidelines

The interface should communicate:

Reliability

Efficiency

Professionalism

Users should immediately know where to tap.

Reduce cognitive load.

Keep screens focused on one primary task.

---

# Things to Avoid

❌ Multiple shades of blue

❌ Bright gradients

❌ Glassmorphism

❌ Neon colors

❌ Large floating buttons

❌ Excessive animations

❌ Inconsistent spacing

❌ Random border radius

❌ Different button styles

❌ Decorative UI elements

❌ Unnecessary shadows

❌ Fancy fonts

---

# Overall Experience

Every screen should feel like it belongs to the same design system.

The application should appear polished, modern, and enterprise-ready.

When implementing new features, always reuse existing components and design tokens before creating new styles.

Design decisions should favor clarity, consistency, and usability over visual complexity.