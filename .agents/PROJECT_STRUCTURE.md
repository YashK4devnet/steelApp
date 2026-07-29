# Project Structure & Architecture Guidelines

## Core Principle

Organize the project for developer readability and maintainability.

The codebase must be organized by **feature and responsibility**, not by randomly accumulating files into global folders.

A developer should be able to locate all code related to a feature without searching the entire repository.

---

# Required Project Structure

Use the following structure:

src/
    app/
    features/
    components/
    api/
    hooks/
    services/
    lib/
    types/
    constants/
    styles/

---

# app/

The `app/` directory contains application-level configuration.

It must contain:

- Application entry configuration
- Router configuration
- Global providers
- Authentication providers
- Route guards

Example:

app/
    App.tsx
    router.tsx
    providers/
    guards/

Do NOT put feature-specific logic here.

---

# features/

Features are the primary organizational unit.

Every major business feature should have its own directory.

Example:

features/
    auth/
    dashboard/
    audits/
    reports/
    users/
    settings/

Feature-specific code must remain inside its feature directory.

---

# Feature Structure

A feature may contain:

feature/
    components/
    hooks/
    pages/
    services/
    types.ts
    index.ts

Only create directories that are actually needed.

Do NOT create empty folders simply because the structure allows them.

---

# Feature Components

Components that are only useful for one feature must remain inside that feature.

Example:

features/
    audits/
        components/
            QuestionCard.tsx
            AuditHeader.tsx
            AuditProgress.tsx

Do NOT move these into:

components/

unless they are genuinely shared by multiple features.

---

# Shared Components

`src/components/` is only for reusable application-wide UI.

Example:

components/
    ui/
        Button.tsx
        Input.tsx
        Card.tsx
        Modal.tsx

    layout/
        AppHeader.tsx
        BottomNavigation.tsx

    feedback/
        LoadingState.tsx
        ErrorState.tsx
        EmptyState.tsx

Do NOT place feature-specific components here.

---

# API Layer

All backend communication must be separated from UI components.

Use:

src/api/

for the shared API client and common API infrastructure.

Example:

api/
    client.ts
    endpoints.ts
    types.ts

Components must never directly configure Axios or fetch.

---

# Feature API Calls

Feature-specific API functions should live inside the relevant feature.

Example:

features/
    audits/
        services/
            auditApi.ts

features/
    reports/
        services/
            reportApi.ts

Do not put every API function into one giant `api.ts` file.

---

# React Hooks

Hooks that are specific to one feature belong inside that feature.

Example:

features/
    audits/
        hooks/
            useAudit.ts
            useAuditQuestions.ts

Only genuinely reusable hooks belong in:

src/hooks/

Example:

hooks/
    useDebounce.ts
    useMediaQuery.ts

---

# Services

Services contain infrastructure or application-level functionality that isn't tied to a particular UI component.

Examples:

services/
    storage/
    capacitor/

Storage services:

- IndexedDB
- localStorage

Capacitor services:

- Camera
- Geolocation
- Notifications
- Device APIs

Do not place React components inside services.

---

# Business Logic

Business logic must not be embedded directly inside JSX.

Avoid:

```tsx
return (
    <div>
        {user.role === "admin" &&
            report.status === "draft" &&
            !report.isLocked && (
                <Button />
            )}
    </div>
);