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

## Phase 11: Submit Vendor Bill Workflow & Strict Document Restrictions
- **Document Upload Component**:
  - Built `DocumentUpload.tsx` at `src/features/trucks/components/DocumentUpload.tsx` supporting PDF and Image files only (`application/pdf`, `image/jpeg`, `image/png`, `image/webp`).
  - Implemented strict MIME-type and extension validation to reject all non-PDF/Image formats (e.g. DOCX, XLSX, TXT, ZIP) with clear inline error messages.
  - Added live file previews: image thumbnail preview for image files, and PDF badge with file size for PDF files.
- **Submit Vendor Bill Page**:
  - Created `SubmitVendorBillPage.tsx` at `src/features/trucks/pages/SubmitVendorBillPage.tsx`.
  - Added form fields mirroring `.agents/README.md` API spec (`bill_number`, `bill_date`, `bill_document`, `eway_bill_attached_with_bill`, `eway_bill_number`, `eway_bill_document`).
  - Automatically populated `bill_document_name` and `eway_bill_document_name` from uploaded file objects.
  - Enforced E-Way bill backend validation rules (requiring number or document when not attached with bill).
  - **Fixed Bottom Button**: Made the "Submit Vendor Bill" action bar fixed at the bottom (`fixed bottom-0 left-0 right-0 z-50`), ensuring instant visibility without requiring page scrolling.
  - **Feedback & Error Messaging**: Added full-screen success confirmation view ("Vendor Bill Submitted!") and prominent error alert banners for network failures/request errors.
- **Navigation & Layout**:
  - Connected `LoadingTrucksPage` "Submit Vendor Bill" buttons to `/trucks/submit-bill/:id`.
  - Registered `/trucks/submit-bill/:id` route in `src/app/router/index.tsx`.
  - Updated `MainLayout.tsx` to hide bottom navigation on the submit bill screen.

## Phase 12: Real API Integration for Vendor/Seller Flow
- **Loading Trucks API Integration (`GET /booking/trucks/loading`)**:
  - Integrated real HTTP endpoint in `LoadingTrucksPage.tsx` using `apiRequest('GET', '/booking/trucks/loading')`.
  - Removed all hardcoded mock data and mock fallbacks (`MOCK_LOADING_TRUCKS`).
  - Implemented a custom animated pulse skeleton loading component (`LoadingTruckSkeleton`) for a premium mobile loading experience.
  - Added an error container with a "Try Again" retry action for network failures.
  - Dynamically fetched loading truck count on `SellerDashboard.tsx`.
- **Submit Vendor Bill API Integration (`POST /booking/trucks/submit_vendor_bill`)**:
  - Integrated real POST endpoint in `SubmitVendorBillPage.tsx` using `apiRequest('POST', '/booking/trucks/submit_vendor_bill', payload)`.
  - Added `fileToBase64` helper to encode PDF and Image documents into base64 Data-URIs for JSON payload transmission.
  - Included `bill_document_name` and `eway_bill_document_name` parameters matching Odoo mobile backend requirements.

## Phase 13: Vendor Bill Submitted Flag Handling
- **Data Model Update**: Added `is_submitted?: boolean` to `LoadingTruck` interface in `src/features/trucks/types.ts`.
- **UI State & Action Guarding**:
  - Updated `LoadingTrucksPage.tsx` to render a green `BILL SUBMITTED` badge when `truck.is_submitted` is true.
  - Disabled the action button ("Bill Submitted") and blocked navigation for submitted trucks.
  - Added an `useEffect` guard in `SubmitVendorBillPage.tsx` that redirects users back to `/trucks/loading` if they attempt to open the submission form for an already submitted truck.

## Phase 14: History Stack Navigation & Native Back Button Alignment
- **Native Android Back Button**:
  - Verified `@capacitor/app` `backButton` handler in `AppRouter` (`src/app/router/index.tsx`), which delegates directly to `navigate(-1)` on browser history or exits app if at stack root.
- **Form Submission Stack Removal**:
  - Updated `SubmitVendorBillPage.tsx` to call `navigate(-1)` upon successful submission, cleanly popping the submission form entry off the browser history stack.
  - Guarantees the user cannot press the Android native back button to return to the submit page once a bill is submitted.
- **Header Back Buttons**:
  - Standardized all sub-page header back buttons (`SubmitVendorBillPage.tsx`, `LoadingTrucksPage.tsx`, `LoadedTrucksPage.tsx`) to pop history entries using `navigate(-1)` with fallback replacing routes.

## Phase 15: Native Pull-to-Refresh Mechanic
- **Reusable UI Component**: Created `src/components/ui/PullToRefresh.tsx` matching the application's clean design system, featuring touch gesture tracking, rubberband dampening, rotational arrow scaling, and CSS spinners.
- **Seller Flow (`LoadingTrucksPage.tsx`)**: Removed the static "Refresh" button from the header and wrapped the list in `PullToRefresh` to refresh seller loading trucks on pull-down.
- **Security Flow (`LoadedTrucksPage.tsx`)**: Wrapped loaded trucks list in `PullToRefresh` to allow security personnel to seamlessly refresh inbound truck data via pull-down gestures.

## Phase 16: Pull-to-Refresh Clipping & Animation Duration Polish
- **Z-Index Overlay & Clipping Fix**: Re-positioned the floating refresh indicator in `PullToRefresh.tsx` to `fixed top-[calc(env(safe-area-inset-top,1rem)+0.5rem)] z-50`. Prevents the floating indicator from clipping behind sticky headers (`z-20`) or page containers.
- **Minimum Visible Animation Duration**: Enforced a minimum visible spinning duration (`minDurationMs = 800`) using `Promise.all([onRefresh(), minTimer])`. Guarantees a smooth, non-jarring feedback animation even on instant API responses, while extending dynamically if network requests take longer.

## Phase 17: Selective List Pull-to-Refresh
- **Selective Layout Wrapping**: Updated `LoadingTrucksPage.tsx` and `LoadedTrucksPage.tsx` so `<PullToRefresh>` wraps only the `<main>` list content container.
- **Static Header & Search Bar**: Kept top navigation header, back buttons, and search inputs static at the top of the viewport when dragging.
- **Inline Floating Refresh Badge**: Rendered the floating spinner indicator right above the list cards (between search bar and list items), translating only the list elements during pull gestures.

## Phase 18: Page Level Navigation & Double-Back-to-Exit Toast
- **Single Source Changelog**: Locked changelog updates strictly to `.agents/CHANGELOG.md`.
- **Page Level Hierarchy (`PAGE_LEVEL_MAP`)**:
  - Established strict page hierarchy levels: Level 0 (`/dashboard`, `/profile`, `/login`), Level 1 (`/trucks/loading`, `/trucks/loaded`), Level 2 (`/trucks/submit-bill/:id`, `/trucks/report/:id`).
  - Configured strict parent navigation so going back on sub-pages steps directly to the parent level with `{ replace: true }`, preventing history stack accumulation or returning to stale pages.
- **Double-Back-to-Exit on Dashboard**:
  - Configured Android hardware back button handler in `CapacitorNativeSetup`.
  - Pressing back once on Level 0 (`/dashboard`) shows a floating toast: `"Press back again to exit"`.
  - Pressing back a second time within 2000ms triggers `CapacitorApp.minimizeApp()`, natively minimizing the app.
- **Bottom Navigation Alignment**: Added `replace` prop to `NavLink` elements in `BottomNav.tsx` so tab switching between Home and Profile maintains a clean stack.

## Phase 19: Custom Logout Confirmation Modal & Strict API Validation
- **Custom UI Modal (`LogoutModal.tsx`)**: Replaced default browser/android `window.confirm` popups with a custom modal matching the design system (`bg-white rounded-[24px] shadow-[0_20px_50px_rgba(15,23,42,0.18)]`).
- **Loading Animation State**: Added an active spinning loader ("Signing out...") inside the action button while the API request is in progress.
- **Strict API Success Requirement**: Updated `logout` in `AuthProvider.tsx` to throw an error if `POST /booking/auth/logout` fails. Local session (`user`, `token`, `localStorage`) is strictly preserved unless the API returns success.
- **Error Handling**: Displays an inline red alert banner inside `LogoutModal` if the API request fails, keeping the user securely logged in.
- **App-wide Integration**: Connected `LogoutModal` across both `DashboardPage.tsx` and `ProfilePage.tsx`.

## Phase 20: Comprehensive Application UI Animations
- **Sign In Button Spring Dots Loader**: Replaced text loading string on `LoginPage.tsx` button with a 3-dot spring bouncing animation (`animate-spring-dot-1`, `2`, `3`) when authenticating.
- **Logout Modal Bottom Sheet Animations**: Styled `LogoutModal.tsx` as a mobile bottom sheet featuring slide-up (`animate-slide-up-bottom`) opening and slide-down (`animate-slide-down-bottom`) dismissal.
- **Navbar Hiding on Logout Modal**: Added `toggle-logout-modal` event listener in `MainLayout.tsx` to automatically hide `BottomNav.tsx` whenever the logout confirmation modal is open.
- **Fluid Page Transitions**: Applied `.animate-page-transition` keyframe animation (`translateY(10px)` fade-in blend) across route switches in `MainLayout.tsx`.

## Phase 21: Fixed Bottom Submit Action Bar CSS Isolation
- **Root Cause Fix**: Resolved CSS spec behavior where parent `transform` properties in `.animate-page-transition` created containing blocks for `position: fixed` child elements.
- **Keyframe Cleanup**: Updated `pageTransition` keyframes in `src/index.css` to clear transforms upon animation completion (`100% { transform: none; }`), ensuring fixed elements pin directly to the browser viewport.
- **Layout Placement**: Moved the fixed bottom submit button bar in `SubmitVendorBillPage.tsx` outside the `<main>` element to the root layout container (`fixed bottom-0 left-0 right-0 z-50`).

## Phase 22: Opacity-Only Page Transitions for Fixed Element Viewport Pinning
- **Permanent Fixed Positioning Fix**: Switched `.animate-page-transition` keyframes in `src/index.css` to an opacity-only fade transition (`opacity: 0` -> `opacity: 1`).
- **Eliminated Containing Block Context**: Removed `transform` properties from the global page transition wrapper, preventing browser layout engines from scoping `position: fixed` elements to wrapper boundaries.
- **Always Visible Viewport Pinning**: Confirmed the "Submit Vendor Bill" action bar in `SubmitVendorBillPage.tsx` and "Submit Report" button in `ReportTruckPage.tsx` remain **always visible** and pinned 100% permanently to the bottom of the screen regardless of form length or scroll position.

## Phase 23: Profile Header Centering & Seller/Vendor Profile Layout Handling
- **Header Alignment**: Centered the user's name (`text-center w-full`) and role subtitle in `ProfilePage.tsx`.
- **Seller/Vendor Non-Employee Handling**:
  - Employee ID: Displays `• #<id>` only when `employee_id` exists, removing `#N/A` for external sellers.
  - Company: Shows company name or falls back to "External Vendor Partner" for sellers.
  - Work Location / Vendor Status: Displays "Work Location" for internal employees and a green pulsing "Verified Vendor Partner" badge for sellers without employee address IDs/names.

## Phase 24: Dashboard Header Responsiveness & Profile Card Cleanup
- **Vendor Status Removal**: Removed the unnecessary Vendor Status card section from `ProfilePage.tsx`.
- **Lower Dashboard Top Margin**: Increased top padding in `DashboardPage.tsx` to `pt-[calc(env(safe-area-inset-top,2rem)+2rem)]` for clean top edge breathing room.
- **Long Name Responsive Flexbox**: Restructured header in `DashboardPage.tsx` using `min-w-0 flex-1` text box and `flex-shrink-0` button container, ensuring long names wrap naturally (`break-words`) without overlapping top notification & logout icons.

## Phase 25: Premium Glass Action Pill Buttons & Profile Logout Button Alignment
- **Profile Logout Button Alignment**: Synchronized `ProfilePage.tsx` top logout button positioning (`top-[calc(env(safe-area-inset-top,2rem)+2rem)] pt-0.5 right-4 sm:right-6 lg:right-8`) to align 1:1 with `DashboardPage.tsx` header action buttons.
- **Frosted Glass Pill Buttons**: Upgraded top notification and sign-out buttons to 42x42px frosted glass surfaces (`bg-white/90 backdrop-blur-md shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-slate-900/10`).
- **Interactive Unread Notification Indicator**: Added an active pulsing status dot (`w-2 h-2 rounded-full bg-accent ring-2 ring-white animate-pulse`) on the notification bell icon.
- **Red Soft Tint Hover on Logout**: Applied a subtle red hover tint (`text-red-500 hover:text-red-600 hover:bg-red-50/80 hover:border-red-200/80`) to the sign-out action button.

## Phase 26: Login Screen Splash Logo Centering & Transition Polish
- **Dead-Center Initial Splash Position**: Refactored `LoginPage.tsx` so during initial splash load (`isAppLoading = true`), the form container collapses (`max-h-0 opacity-0`), centering the logo at the **exact 100% dead center** of the viewport screen across all device sizes.
- **Smooth Glide-Up Transition**: When app loading completes, the logo glides smoothly upward into its header slot while the login form card expands (`max-h-[600px] opacity-100 translate-y-0`) beneath it.

## Phase 27: Relaxed Luxury Splash Animation Timing
- **Extended Transition Duration**: Increased transition duration in `LoginPage.tsx` to 1500ms (`duration-[1500ms]`).
- **Smooth Silky Easing Curve**: Replaced aggressive snapping curve with a smooth ease-out curve (`cubic-bezier(0.22, 1, 0.36, 1)`).
- **Splash Display Duration**: Adjusted initial splash display delay to 1400ms, creating a relaxed, unhurried, premium logo presentation as it glides up above the login card.

## Phase 28: Native Android Splash Screen Integration Architecture
- **Capacitor Configuration (`capacitor.config.ts`)**: Added `SplashScreen` plugin settings (`launchAutoHide: false`, `backgroundColor: "#EEF3FA"`, `androidScaleType: "CENTER_INSIDE"`).
- **Seamless Native-to-Web Handoff (`LoginPage.tsx`)**: Configured `LoginPage.tsx` to automatically invoke `SplashScreen.hide({ fadeOutDuration: 300 })` upon mounting, providing a 1:1 flicker-free handoff from the native Android launch screen directly into the React logo glide animation.













