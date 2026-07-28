# Task

Redesign this mobile dashboard while keeping the same functionality and layout hierarchy. The goal is NOT to completely redesign the application, but to elevate it into a modern, premium enterprise mobile app similar to Linear, Stripe Dashboard, Notion Mobile, Apple's Human Interface Guidelines, and Microsoft's Fluent 2.

The application is used daily by warehouse security guards, so readability, speed, and professionalism are more important than flashy visuals.

---

# Design Goals

- Modern
- Professional
- Minimal
- Enterprise
- Clean
- Spacious
- Premium
- Mobile-first
- Fast feeling

Avoid anything playful or consumer-app styled.

---

# General Style

Use a soft layered interface rather than flat gray backgrounds.

Replace the solid background with a very subtle gradient:

Top:
#EEF3FA

Bottom:
#FFFFFF

or similar.

The interface should feel light and airy.

---

# Spacing

Increase whitespace throughout the screen.

Use an 8pt spacing system.

Suggested spacing:

Top padding: 32px

Section spacing: 24px

Card spacing: 16px

Internal card padding: 20px

Do not make components larger—make them breathe.

---

# Header

Replace the current header with a more modern one.

Instead of

WELCOME BACK

Security Guard

Use

Good Morning,

Security Guard 👋

Below that add a subtle subtitle:

"What would you like to do today?"

Place a notification bell on the right.

Optionally include a small circular profile avatar.

The header should feel balanced instead of left-heavy.

---

# Cards

Keep the two action cards.

Improve them by:

• Larger rounded corners (20-24px)

• Softer shadows

Example:

0 8px 24px rgba(15,23,42,.05)

• Thin border

rgba(15,23,42,.05)

Increase internal padding.

Increase title size slightly.

Increase description line height.

Cards should feel touchable.

---

# Icon Area

Redesign the left icon area.

Instead of a large colored rectangle,
use either

Option A (preferred)

A circular colored icon container

or

Option B

A softly tinted rounded square.

Increase icon size to around 30-32px.

Icons should use slightly thicker strokes.

---

# Card Interaction

Cards should clearly look interactive.

Add a chevron arrow on the right side.

Example

Truck to Warehouse                 →

The arrow should be subtle.

---

# Animations

Use lightweight animations.

Card press:

scale: 0.98

Duration:

150ms

Release:

spring animation

Cards should slightly lift on touch.

Avoid heavy animations.

---

# Typography

Use a modern hierarchy.

Greeting:
16 Medium

Name:
32 Bold

Card Title:
18 SemiBold

Description:
14 Regular

Reduce the use of ALL CAPS.

Avoid excessive font weights.

---

# Colors

Keep the existing brand navy.

Use it intentionally.

Primary:
Current navy

Accent:
Current red

Neutral background:
#F8FAFC

Cards:
White

Text:
Dark slate

Secondary text:
Gray-500

Avoid excessive saturation.

---

# Bottom Navigation

Redesign the bottom navigation.

Instead of only changing icon color,
use a modern active pill.

Selected tab:

Rounded pill

Light blue background

Icon + text

Inactive tabs:

Gray icons

Gray labels

Navigation should feel elevated from the page.

Optionally give it a slight shadow.

---

# Visual Hierarchy

The page should have clear depth.

Layer order:

Background

↓

Header

↓

Action Cards

↓

Floating Bottom Navigation

Avoid making everything appear on the same plane.

---

# Optional Dashboard Summary

If space allows, add a compact summary card below the greeting.

Example

Today's Activity

8 Incoming Trucks

3 Outgoing Trucks

1 Pending Approval

This should remain compact and not dominate the page.

---

# Accessibility

Minimum touch target:
48px

High text contrast.

Readable outdoors.

Do not rely solely on color.

---

# Keep

DO NOT change:

- Navigation structure
- User flow
- Card functionality
- Screen purpose

Only improve the visual design.

---

# Inspiration

Use design cues from:

- Apple Human Interface Guidelines
- Linear
- Stripe Dashboard
- Microsoft Fluent 2
- Notion Mobile
- Arc Browser

Avoid:

- Material Design 2 look
- Skeuomorphism
- Glassmorphism
- Neumorphism
- Bright gradients
- Heavy shadows

---

# Final Goal

The finished dashboard should feel like a polished enterprise application that employees use every day. It should look premium, trustworthy, fast, and effortless while maintaining excellent usability for warehouse security personnel.

# Implementation Constraints

- Mobile-first (360–430px widths)
- Optimize for React + Tailwind CSS
- Maintain an 8pt spacing system
- Reuse existing color tokens where possible
- Use Tailwind utility classes instead of custom CSS when practical
- Keep animations lightweight (Framer Motion only where they add value)
- Prioritize performance on mid-range Android devices (avoid expensive blurs, large shadows, and unnecessary re-renders)