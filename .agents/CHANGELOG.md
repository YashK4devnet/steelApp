# Project Changelog

This document logs the major architectural, feature, and design changes implemented during the development of the RNE Mobile application.

## Phase 1: Foundation & Authentication
- **Routing Setup**: Implemented React Router in `src/app/router/index.tsx` with a structure separating public and protected routes.
- **Authentication**: Built `AuthProvider.tsx` to handle mock login states and manage current user roles (`security`, `manager`, `admin`).
- **Route Guards**: Added `ProtectedRoute.tsx` and `PublicRoute.tsx` to automatically redirect users based on auth status.
- **Base Components**: Created reusable UI components including `Button`, `Input`, and `Card`.

## Phase 2: Feature Development
- **Login Page**: Created `LoginPage.tsx` with form handling, error states, and a smooth initial application loading animation for the RNE logo.
- **Dashboard Implementation**: Built `DashboardPage.tsx` tailored to the `security` role (showing "Trucks to warehouse" and "Trucks from warehouse" actions) and a placeholder for the `manager` role.
- **Bottom Navigation**: Introduced `BottomNav.tsx` alongside a `MainLayout.tsx` wrapper to allow seamless tab switching across protected pages.
- **Sub-pages**: Created `ProfilePage.tsx` (containing the user's details and the Logout button) and a placeholder `SettingsPage.tsx`.

## Phase 3: Premium UI/UX Overhaul
- **Aesthetic Shift**: Transitioned the entire application from a heavy glassmorphism style to a lightweight, premium, flat design (inspired by Linear, Stripe, and Apple HIG) based on constraints in `DASHBOARD_DESIGN.md`.
- **Global Styling**:
  - Implemented a unified background gradient (`#EEF3FA` to `#FFFFFF`).
  - Standardized an 8pt spacing system across all layouts.
  - Replaced heavy blurs and bright gradients with clean white surfaces, ultra-soft drop shadows (`0 8px 24px rgba(15,23,42,0.05)`), and thin slate borders.
- **Animations & Interaction**:
  - Implemented a custom pure-CSS sliding pill animation in the bottom navigation for native-feeling tab switches.
  - Linked router location keys in `MainLayout.tsx` to trigger lightweight fade-in-up animations on every page transition.
  - Added performant `active:scale-[0.98]` interactions to clickable cards.
- **Documentation**: Completely rewrote `.agents/DESIGN_INSTRUCTIONS.md` to lock in the new premium flat aesthetic and prevent future feature sprawl or design inconsistencies.

## Phase 4: Truck Reporting Integration
- **Reporting Workflow**: Added `ReportTruckPage.tsx` to handle the final step of the truck arrival process as defined by the backend API (`/booking/trucks/report`).
- **Capacitor Integrations**:
  - **Camera (`@capacitor/camera`)**: Built `ImageUpload.tsx` to allow security personnel to natively snap photos of the truck and documents using the device camera.
  - **App Lifecycle (`@capacitor/app`)**: Implemented a global `AndroidBackButtonHandler` in the React Router to ensure the hardware back button behaves correctly (popping the web history stack natively).
- **UI Enhancements**:
  - Dynamically hid the bottom navigation bar on the reporting page for maximum screen real estate.
  - Implemented a fixed "Submit" button at the bottom of the reporting form.
  - Handled auto-scrolling to the top of the page when navigating between screens.
  - Added an editable `datetime-local` input preloaded with the exact arrival time.

## Phase 5: Architecture Cleanup & UI Expansions
- **Dashboard Enhancements**: 
  - Restructured the Security Dashboard into a 2-column grid layout for better mobile usability.
  - Added multi-colored demo feature cards (Gate Pass, Inventory, Security Logs, Shift Schedule) with custom iconography.
- **Profile Page Overhaul**:
  - Removed the `SettingsPage` to streamline the bottom navigation.
  - Expanded the `User` mock data model in `AuthProvider` to align with the backend `REPORTING.md` specs (including Phone, Company, Employee ID, and Location).
  - Completely redesigned `ProfilePage.tsx` into a rich, card-based layout displaying all user data.
- **Architecture Refactoring**:
  - Strictly enforced the rules in `PROJECT_STRUCTURE.md`.
  - Extracted inline SVGs from `DashboardPage.tsx` and `ProfilePage.tsx` into dedicated `Icons.tsx` files within their respective feature folders.
  - Split the monolithic `DashboardPage.tsx` by extracting `<SecurityDashboard />` and `<ManagerDashboard />` into their own components.
  - Moved `ImageUpload.tsx` from the global `components/ui/` folder into `features/trucks/components/` where it belongs.
- **Web Camera Support**: Added `@ionic/pwa-elements` and initialized them in `main.tsx` to allow the Capacitor Camera plugin to render natively in the web browser during development.

## Phase 6: Native Mobile Polish & DX Improvements
- **Notch & Safe Area Handling**:
  - Updated `index.html` viewport meta tag to use `viewport-fit=cover`, ensuring the app extends fully underneath the hardware notch/home indicator on iOS and Android.
  - Replaced hardcoded top padding (`pt-8`) with dynamic CSS environment variables (`pt-[calc(env(safe-area-inset-top,2rem)+1rem)]`) across all main layout wrappers (`DashboardPage`, `ProfilePage`, `ReportTruckPage`).
- **Status Bar Integration**:
  - Integrated `@capacitor/status-bar` to take full control of the device's native notification bar.
  - Configured `capacitor.config.ts` to overlay the webview (`overlaysWebView: true`) and use dark icons (`style: 'LIGHT'`), allowing the app's clean white/blue gradient to naturally blend into the top edge of the screen.
- **Developer Experience (DX)**:
  - Relaxed strict Vite TypeScript linting rules in `tsconfig.app.json` (`noUnusedLocals` and `noUnusedParameters` set to `false`) to prevent the build process from crashing during rapid prototyping due to harmless unused imports.

## Phase 7: End-to-End Testing (Playwright)
- **Framework Integration**: Installed and configured `@playwright/test` for robust E2E testing of the web layer before native compilation.
- **Test Configuration**: 
  - Created `playwright.config.ts` to automatically spin up the Vite dev server (`npm run dev`) and run tests concurrently.
  - Hardcoded `webServer` routing to `127.0.0.1` to bypass Chromium IPv6 network resolution hangs on Windows.
  - Switched the Chromium project to use the native `chrome` channel, avoiding crashes caused by the bundled headless-shell binary on specific Windows setups.
- **Test Suites**:
  - `auth.spec.ts`: Validates complete login flow, invalid credentials error states, and the logout workflow. 
  - `reporting.spec.ts`: Validates the end-to-end Truck Arrival workflow from the dashboard to successful submission.
- **Native Bypasses**: Implemented an E2E bypass flag (`window.__E2E_MOCK_IMAGE__`) in `ImageUpload.tsx` to instantly mock native Capacitor Camera plugin responses without triggering the interactive PWA Shadow DOM UI, avoiding test hangs.

## Phase 8: Odoo API Integration
- **Capacitor Native HTTP**: 
  - Enabled `CapacitorHttp` and `CapacitorCookies` in `capacitor.config.ts`.
  - Created `src/lib/api.ts` to wrap `CapacitorHttp`, automatically routing all HTTP requests through the native mobile layer to inherently bypass browser CORS restrictions and correctly manage the Odoo `session_id` cookies.
- **Authentication**: Refactored `AuthProvider.tsx` to replace mock timeouts with real `POST /booking/auth/login` and `POST /booking/auth/logout` API calls, parsing the returned `User` object.
- **Data Fetching**: 
  - Updated `LoadedTrucksPage.tsx` to fetch `GET /booking/trucks/loaded`, displaying a loading state and replacing hardcoded mocks with real truck data.
  - Updated `ReportTruckPage.tsx` to send `POST /booking/trucks/report` utilizing an `application/json` payload structure containing base64 images, streamlining the upload process over `multipart/form-data`.
- **E2E Alignment**: Updated Playwright E2E tests (`auth.spec.ts`, `reporting.spec.ts`) to use real staging credentials (`security@gmail.com`).

## Phase 9: API Alignment & UI Bugfixes
- **Role Synchronization**: Discovered that the real Odoo backend returns `"role": "Security"` instead of boolean flags. Updated `types/index.ts`, `DashboardPage.tsx`, and `ProfilePage.tsx` to handle this string, fixing the blank dashboard rendering issue.
- **Header Enhancements**: Added the `user.login` string to display directly beneath the username in the Dashboard header.
- **Login Improvements**: Softened the login error banner message to a generic "Invalid credentials. Please try again."
- **Logout Confirmation**: Added a native browser `window.confirm` popup to the profile sign out button to prevent accidental logouts.
- **Payload Size Optimization**: Resolved a `413 Payload Too Large` backend error during truck reporting by shrinking the `@capacitor/camera` photo captures (setting `quality: 70` and `width: 1024`), drastically reducing the size of the Base64 JSON payload.
- **Token Auth Alignment**: Updated `AuthProvider.tsx` to persist the returned Bearer token from the backend, and modified `api.ts` to automatically inject the `Authorization: Bearer <token>` header into all requests.
- **Report Page UI**: Passed full truck details via React Router state to display the specific Truck Number Plate and Delivery Address in the `ReportTruckPage` header. Simplified the camera and note form labels.
- **Profile Layout**: Relocated the Logout button to a dedicated floating action icon at the top-right corner of the `ProfilePage` for a cleaner interface.
- **Dashboard Refinements**: 
  - Added a quick-access logout button to the dashboard header.
  - Removed unused mock features (Material Inventory, Shift Schedule) from the security dashboard.
  - Disabled and visually muted incomplete features (Gate Pass, Security Logs, Outbound Trucks), tagging them with "Coming Soon" ribbons to focus the user exclusively on the inbound truck flow.
- **Header Alignment**: Standardized the top padding of `LoadedTrucksPage` to use the dynamic `safe-area-inset-top` calculation, ensuring perfect alignment with the rest of the application headers.

## Phase 10: Seller Dashboard & Loading Trucks Workflow
- **Seller Role Integration**: Added support for Vendor/Seller role users (`group_role_seller`). Updated `DashboardPage.tsx` to conditionally render a dedicated `SellerDashboard` component.
- **Seller Dashboard Component**: Created `SellerDashboard.tsx` with a modern 2-column action grid matching the design system:
  - **Loading Trucks** primary action card displaying the count of pending loading trucks.
  - Secondary feature cards ("Submitted Bills", "E-Way Bills", "Godown Dispatches") tagged with "Coming Soon" ribbons.
- **Icon Set Expansion**: Added `FileTextIcon`, `ReceiptIcon`, and `WarehouseIcon` to `src/features/dashboard/components/Icons.tsx`.
- **Loading Trucks Page**:
  - Created `LoadingTrucksPage.tsx` at `src/features/trucks/pages/LoadingTrucksPage.tsx`.
  - Implemented mock data (`MOCK_LOADING_TRUCKS`) matching the exact schema specified in `.agents/README.md` (`id`, `truck_number_plate`, `driver_name`, `state`, `pickup_location_name`, `delivery_address_name`).
  - Added real-time search filtering across driver name, plate number, truck type, and pickup/delivery locations.
  - Added "Submit Vendor Bill" action buttons per loading truck line.
- **Routing Setup**: Registered the `/trucks/loading` route in `src/app/router/index.tsx` under protected layout routing, resolving route fallback redirects.

