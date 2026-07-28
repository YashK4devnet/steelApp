# React + Capacitor + Odoo Project Guidelines

## Overview

This project is a React + TypeScript application built with Vite and Capacitor.

The backend is Odoo and communicates through REST APIs.

The application should be designed to be:

- Modular
- Scalable
- Type-safe
- Easy to maintain
- Mobile-first
- Reusable

All new code should follow the architecture described below.

---

# General Principles

- Write clean, readable code over clever code.
- Prefer composition over duplication.
- Prefer reusable components over copy-pasted UI.
- Separate UI from business logic.
- Avoid large components.
- Keep functions small and focused.
- Use descriptive variable and function names.
- Every feature should be easy to remove or replace.

---

# Tech Stack

- React
- TypeScript
- Vite
- Capacitor
- React Router
- Axios
- TanStack Query (React Query)
- React Hook Form (where appropriate)

---

# Folder Structure

src/

    app/
        providers/
        guards/
        router/

    api/

    components/

    features/
        auth/
        dashboard/
        reports/
        users/
        settings/

    hooks/

    layouts/

    services/

    types/

    utils/

    assets/

Every feature should contain its own:

- components
- hooks
- services
- types
- pages

Avoid one giant components folder.

---

# TypeScript

Never use:

- any

Prefer:

- interfaces
- enums
- union types
- utility types

Every API response should have proper typing.

Example:

interface User {

    id: number;
    name: string;
    email: string;

}

---

# Authentication

Authentication must be centralized.

Create:

- AuthProvider
- useAuth()

Do not access:

- localStorage
- sessionStorage

directly inside components.

Authentication provider should expose:

- user
- token
- login()
- logout()
- loading
- isAuthenticated

---

# Authorization

Do NOT hardcode role checks.

Avoid:

if(user.role === "admin")

Create reusable guards instead.

Examples:

<RoleGuard />

<Permission />

Support multiple roles.

Support permission-based rendering.

Backend permissions should determine UI visibility whenever possible.

---

# Routing

Use:

ProtectedRoute

PublicRoute

RoleGuard

Authentication logic should never exist inside pages.

Pages should assume authentication has already been handled.

---

# API Layer

All API calls belong inside:

src/api

Never call axios directly from components.

Example:

components

↓

hooks

↓

api

↓

backend

---

# Axios

Create one configured axios instance.

Automatically attach:

- Authorization token

Handle:

- 401
- 403
- 500

globally where possible.

---

# React Query

Use React Query for:

- GET requests

Use mutations for:

- POST
- PATCH
- DELETE

Do not manually duplicate server state inside React state.

---

# Components

Components should be presentational whenever possible.

Avoid placing API logic inside UI components.

Props should be typed.

Keep components focused on one responsibility.

---

# Custom Hooks

Move reusable logic into hooks.

Examples:

useAuth()

usePermissions()

useReports()

useDebounce()

Avoid duplicated useEffect logic.

---

# State Management

Use:

React Context

for:

- authentication
- theme
- app settings

Use React Query for server state.

Avoid unnecessary global state.

---

# Forms

Use React Hook Form.

Validation should be centralized.

Do not duplicate validation logic.

---

# Styling

Keep styling consistent.

Avoid inline styles.

Extract reusable UI patterns.

Use semantic class names.

Mobile-first layout.

---

# Error Handling

Every API request should handle:

- loading
- success
- error

Show user-friendly error messages.

Do not silently ignore failures.

---

# Loading States

Every async operation should expose loading.

Avoid blank screens.

Use loaders or skeletons where appropriate.

---

# Reusability

If code is copied more than twice,

consider extracting:

- component
- hook
- utility

---

# Business Logic

Business logic belongs inside:

hooks

services

utilities

Never inside JSX.

---

# Constants

Avoid magic strings.

Create:

constants/

Example:

Roles

Permissions

Routes

API Endpoints

---

# Environment Variables

Never hardcode:

URLs

API Keys

Tokens

Use:

.env

---

# Logging

Use console.log only during development.

Remove unnecessary logs before production.

---

# Performance

Use:

React.memo

useMemo

useCallback

only when profiling shows benefit.

Do not prematurely optimize.

---

# Naming

Components

PascalCase

Example:

AuditCard.tsx

Hooks

camelCase beginning with use

Example:

useReports.ts

Types

PascalCase

Example:

Report.ts

Constants

UPPER_SNAKE_CASE

Example:

DEFAULT_PAGE_SIZE

---

# Imports

Group imports:

1. React
2. Libraries
3. Internal modules
4. Types
5. Styles

Avoid circular dependencies.

---

# File Size

Try to keep files under:

300 lines

If significantly larger,

consider splitting responsibilities.

---

# Comments

Write code that explains itself.

Use comments only for:

- business rules
- complex algorithms
- important decisions

Do not comment obvious code.

---

# Accessibility

Buttons must have labels.

Inputs must have labels.

Interactive elements should be keyboard accessible where appropriate.

---

# Mobile

Optimize for touch.

Avoid hover-only interactions.

Respect safe areas.

Test on smaller screens.

---

# Odoo Integration

Never assume response shapes.

Always type API responses.

Map backend responses into frontend models when necessary.

Do not expose raw Odoo structures throughout the application.

---

# Error Boundaries

Use React Error Boundaries around major application sections.

Prevent application crashes.

---

# Future Scalability

Design assuming:

- more roles
- more permissions
- more audit forms
- offline support
- notifications
- multiple modules

Avoid architecture that only works for the current requirements.

---

# Code Review Checklist

Before considering work complete:

✓ No TypeScript errors

✓ No ESLint warnings

✓ Components remain small

✓ Proper typing

✓ API separated from UI

✓ Loading states handled

✓ Error states handled

✓ Mobile responsive

✓ No duplicated logic

✓ Authentication respected

✓ Permissions respected

✓ Reusable code extracted

✓ Clean imports

✓ No unnecessary console logs

✓ Project builds successfully

---

# Goal

Every feature added to the application should require minimal changes to existing code.

Prefer extending the architecture rather than modifying existing implementations.