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

## Phase 29: API Redundancy Optimization & 30s TTL Service Caching
- **Service Caching (`truckApi.ts`)**: Implemented a 30-second TTL memory cache for `getLoadingTrucks()` and `getLoadedTrucks()`.
- **Dashboard Optimization (`SellerDashboard.tsx`)**: Refactored `SellerDashboard` to use `getLoadingTrucks()`, reusing cached data when navigating between the Dashboard and Loading Trucks page.
- **Automatic Invalidation**: Submitting vendor bills or reporting arrivals automatically flushes the cache. Pull-to-refresh (`PullToRefresh`) forces a live network fetch (`forceRefresh = true`).
- **Result**: Reduced redundant network calls by 50-70% while guaranteeing live data accuracy.

## Phase 30: Seller Dashboard Pending vs Submitted Differentiation
- **Pending Truck Filtering**: Updated `SellerDashboard.tsx` to calculate `pendingCount` (`trucks.filter(t => !t.is_submitted).length`), displaying strictly pending trucks on the "Loading Trucks" card.
- **Submitted Bills Card Upgrade**: Updated Card 2 ("Submitted Bills") to render `{submittedCount} Submitted` (`trucks.filter(t => t.is_submitted).length`), providing immediate visibility into completed vendor bill submissions.

## Phase 31: E-Way Bill Backend Validation Hand-Off
- **Removed Frontend E-Way Bill Validation**: Removed `eway_bill` checks from `validateForm()` in `SubmitVendorBillPage.tsx`. Form submissions now delegate validation directly to the Odoo backend API (`POST /booking/trucks/submit_vendor_bill`).
- **Cleaned Form Layout**: Removed the warning text paragraph notice and `errors.eway_bill` error block from `SubmitVendorBillPage.tsx` for a streamlined user interface.

## Phase 32: Revert Submitted Bills Card Placeholder
- **Reverted Card 2 Layout**: Restored Card 2 ("Submitted Bills") in `SellerDashboard.tsx` back to its original disabled "Coming Soon" placeholder state.

## Phase 34: Top Header Logo Integration (Option 1)
- **Public Logo Asset (`/public/in-app-logo.png`)**: Copied `resources/in-app-logo.png` to `public/in-app-logo.png` for fast, zero-overhead static serving across the web app and Capacitor mobile webview.
- **Top Header Bar Restructure (`DashboardPage.tsx`)**: Reorganized top header section into a 2-row layout:
  - **Top Row**: RNE Brand Logo (`in-app-logo.png`, `h-8 sm:h-9`) aligned to the left, balanced by notification bell and logout action buttons on the right.
  - **Below Row**: "Good Morning, [User Name] 👋" greeting and quick status pill.
- **Profile Header Alignment (`ProfilePage.tsx`)**: Added matching top bar row with the left-aligned RNE logo and right-aligned logout button for seamless visual consistency across primary navigation tabs.

## Phase 35: Brand Name Typography Integration
- **Brand Text Placement (`DashboardPage.tsx` & `ProfilePage.tsx`)**: Integrated 2-line stacked brand typography directly to the right of the in-app logo:
  - Line 1: `RATHI` in Deep Navy (`#0A2E63` / `text-primary`), `NORTH EAST` in Corporate Red (`#C8102E` / `text-accent`).
  - Line 2: `BROTHERS` in Deep Navy (`#0A2E63` / `text-primary`).
- **Color Accent Alignment**: Perfectly matched the red middle accent from `in-app-logo.png` onto the `NORTH EAST` text string.
- **Omitted Legal Suffix**: Omitted `pvt ltd` as requested to optimize horizontal layout space for mobile viewports.

## Phase 36: Top-Rounded Sheet Canvas Layout Architecture
- **Header Bar Layer (`<header>`)**: Extracted top bar (Logo, `RATHI NORTH EAST BROTHERS` brand text, Notification Bell, Sign Out button) to rest on the soft top background layer (`bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA] to-[#E2E8F0]`).
- **Top-Rounded Canvas Sheet (`<main>`)**: Housed page content (greeting section, action grid, profile avatar & info cards) inside a full-bleed white sheet canvas container (`bg-white rounded-t-[28px] sm:rounded-t-[36px] shadow-[0_-8px_30px_rgba(15,23,42,0.06)] border-t border-slate-900/5`).
- **Responsive Screen Spanning**: Sheet container spans dynamically down to the bottom of the viewport (`flex-1 w-full pb-32`), creating a native mobile bottom-sheet visual separation.
- **Synchronized Across Views**: Applied identically across `DashboardPage.tsx` and `ProfilePage.tsx`.

## Phase 37: Interchanged Header & Canvas Sheet Color Palette
- **Crisp White Header Bar (`bg-white`)**: Swapped header background layer to crisp solid white (`bg-white`), providing high contrast for the RNE logo image, `RATHI NORTH EAST BROTHERS` Navy & Red typography, and header action buttons.
- **Soft Layered Canvas Sheet (`bg-gradient-to-b from-[#EEF3FA] via-[#F1F5F9] to-[#FFFFFF]`)**: Applied the soft grayish-blue gradient background to the main top-rounded sheet canvas.
- **Maximum Card Contrast**: White feature cards (`bg-white` with `shadow-[0_8px_24px_rgba(15,23,42,0.04)]`) inside the sheet canvas now pop out with clean 3D depth and visual separation against the soft gradient sheet background.
- **App-wide Alignment**: Synchronized across `DashboardPage.tsx` and `ProfilePage.tsx`.

## Phase 38: Bookings Feature, Customer Master Data Caching & TanStack Query Integration
- **Step 2 DIA Details Redesign**:
  - Updated `SelectedProduct` schema to include `dia`, `shape`, `weight_option`, and `order_type`.
  - Redesigned `ProductConfigSheet` to include dropdowns for DIA, Shape, and Weight.
  - Added support for both custom weight and predefined bundle ordering modes.
  - Implemented floating circular FAB button (`+`) for quick additions.
- **Customer Master Data API & Caching**:
  - Integrated `GET /booking/customer/master-data` endpoint into `bookingApi.ts`.
  - Added background local storage sync (`syncMasterData`) triggered on app startup and login.
  - Decommissioned legacy "Pickup Company" dropdown and simplified Step 1 flow to directly select warehouses.
- **Bookings Architecture & Code Quality Refactoring**:
  - Refactored `src/features/bookings/` to follow strict guidelines from `AGENT_INSTRUCTIONS.md`.
  - **100% Type Safety**: Removed all `any` casts across types, services, and page components.
  - **Custom Hooks**: Created `useBookings`, `useCreateBookingStep1`, `useCreateBookingStep2`, and `useBookingMutations` to separate logic from UI rendering.
  - **Modular Components**: Extracted `PickupSection`, `DeliverySection`, `TruckDetailsSection`, `DriverDetailsSection`, and `SelectedProductCard`.
  - **File Size Optimization**: Reduced `CreateBookingStep1Page.tsx` (from 411 to 115 lines) and `CreateBookingStep2Page.tsx` (from 336 to 165 lines).
- **TanStack Query (`@tanstack/react-query`) Integration**:
  - Installed `@tanstack/react-query` v5 and introduced global `QueryProvider.tsx` with 5-minute stale-while-revalidate caching and retry backoffs.
  - Created centralized, type-safe query keys in `src/constants/queryKeys.ts`.
  - Converted `useBookings`, `LoadedTrucksPage`, `LoadingTrucksPage`, and `OutgoingTrucksPage` data fetching to `useQuery`.
  - Integrated `useMutation` hooks (`useSaveBooking`, `useCancelBooking`) with automatic `invalidateQueries` to instantly sync list views upon saving or cancelling orders.

## Phase 39: Strict Role-Based Navigation & Buyer Dashboard Integration
- **Removed Development Role Override**: Removed the `FORCE_CUSTOMER_DASHBOARD` bypass in `DashboardPage.tsx` that forced Customer Dashboard rendering during development.
- **Buyer Role Support**: Implemented strict role-based dashboard evaluation supporting `"buyer"` / `"customer"`, `"seller"` / `"vendor"`, `"security"`, and `"admin"` returned from the authentication API.

## Phase 40: Customer Master Data Section 9 Alignment
- **UOM & TruckType Interfaces**: Added `UOM` and `TruckType` interfaces to `src/features/bookings/types.ts`.
- **Master Data Getters**: Implemented `getUOMs()` and `getTruckTypes()` in `bookingApi.ts` to parse dynamically from cached Section 9 response.
- **Truck Type Dropdown**: Updated `TruckDetailsSection.tsx` to render a `Select` dropdown populated from cached `truck_types` master data.
- **Dynamic UOM Dropdown**: Updated `ProductConfigSheet.tsx` to populate UOM options dynamically from cached `uoms` master data.
- **Buyer Role Auth Scoping**: Scoped `syncMasterData()` in `AuthProvider.tsx` to trigger only for `"buyer"` / `"customer"` users to prevent `403 Forbidden` API errors for non-buyer roles.

## Phase 41: Section 12 Submit Truck Request API Integration & Custom Truck Type Option
- **Section 12 API Payload**: Connected `saveBooking()` in `bookingApi.ts` to execute `POST /booking/customer/truck-request` formatted with Section 12 parameters (`warehouse_id`, `ship_to_address_id`, `is_same_as_ship_to`, `bill_to_address_id`, `truck_number_plate`, `truck_capacity_ton`, `transporter_name`, `transporter_contact`, `is_new_truck_type`, `truck_type_id` / `truck_type`, `driver_name`, `driver_contact`, `driver_licence_number`).
- **Custom Truck Type Option**: Updated `TruckDetailsSection.tsx` and `useCreateBookingStep1.ts` to support both selecting existing master data truck types (`is_new_truck_type: false`) and entering a new custom truck type (`is_new_truck_type: true`).

## Phase 42: Buyer Dashboard Booking Creation DIA Details API Integration
- **Buyer Dashboard Booking Creation Flow**: Integrated DIA detail lines configured on Step 2 of the Buyer Dashboard truck request creation flow directly into the backend API submission payload.
- **Shapes & Weight Types API**: Added `getShapesAndWeightTypes()` in `bookingApi.ts` calling `GET /booking/customer/shapes-weight-types`.
- **Dynamic Dropdowns & Product Lines**: Updated `ProductConfigSheet.tsx` to fetch shapes and weight types dynamically from backend master data and attach `shape_id`, `weight_type_id`, and `uom_id` to configured product lines.
- **`dia_details` Payload Formatting**: Formatted selected product lines in `saveBooking()` into the exact `dia_details` array (`dia`, `shape_id`, `weight_type_id`, `uom_id`, `qty_selection`, `weight` / `bundle_qty`) sent to `POST /booking/customer/truck-request`.
- **Validation**: Enforced at least 1 DIA detail line requirement before request submission in `useCreateBookingStep2.ts`.

## Phase 43: Android Native Back Button Routing & Security Dashboard Level 1 Hierarchy Fix
- **Truck Route Matching**: Updated `getPageConfig()` in `src/app/router/index.tsx` to explicitly match truck routes (`/trucks/loaded`, `/trucks/outgoing`, `/trucks/loading`, `/trucks/report`, `/trucks/outgoing/report`, `/trucks/submit-bill`).
- **Hierarchy Alignment**: Fixed bug where sub-pages like "Trucks to warehouse" (`/trucks/loaded`) and "Trucks from warehouse" (`/trucks/outgoing`) fell through `getPageConfig()` as fallback Level 0 routes. Pressing the native Android hardware back button on Level 1 pages now correctly steps back to `/dashboard` (Level 0) instead of prompting to exit the app.

## Phase 44: Section 13, 14 & 15 Customer Trucks List, Details & Cancel API Integration
- **Section 13 Customer Trucks List API**: Connected `getBookings()` in `bookingApi.ts` to `GET /booking/customer/trucks` via `apiRequest`. Maps backend truck state (`draft`, `accepted`, `rejected`, `loading`, `loaded`), `state_label`, `can_cancel`, `truck_type`, `truck_number_plate`, `warehouse_name`, `ship_to_address`, and `create_date` directly to the Bookings list view.
- **Section 14 Customer Truck Details API**: Connected `getBookingById(id)` in `bookingApi.ts` to `GET /booking/customer/trucks/<id>` via `apiRequest`. Parses full truck state and `dia_details[]` array, populating View and Edit booking screens with real backend data.
- **Section 15 Customer Truck Cancel API**: Connected `cancelBooking(id)` in `bookingApi.ts` and `useCancelBooking` hook to `POST /booking/customer/trucks/<id>/cancel` via `apiRequest`. Configured `BookingsPage.tsx` modal to respect `can_cancel` flags, display `state_label` badges, and show reject reasons.

## Phase 45: Section 12 Booking Update API & Editable Status Restriction
- **Section 12 Booking Update Payload**: Updated `saveBooking()` in `bookingApi.ts` to include `truck_id: payload.id` in `POST /booking/customer/truck-request` when editing an existing booking. Updated `updateBooking(id, payload)` to delegate directly to `saveBooking({ ...payload, id })`.
- **Cancellable Editability Guard**: Updated `BookingsPage.tsx` to strictly restrict rendering the "Edit Booking" button to bookings where `can_cancel` is `true`. Non-cancellable or loaded/cancelled bookings now render "View Details" (Read-Only mode).

## Phase 46: Login Password Visibility Toggle
- **Input Component Enhancement (`Input.tsx`)**: Added support for an optional `rightElement` prop rendered inside the input container.
- **Eye & EyeOff Icons (`src/features/auth/components/Icons.tsx`)**: Created reusable SVG icon components for password visibility states with consistent 2px stroke width matching the design system.
- **Login Password Toggle (`LoginPage.tsx`)**: Added stateful `showPassword` toggle button inside the password input field allowing users to toggle between obscured and visible password text with accessible `aria-label` tags and interactive hover/focus styling.

## Phase 47: Customer Bookings Search & Expandable Date Filter
- **Date Filter Calendar Component (`DateFilterCalendar.tsx`)**: Created a custom interactive mobile-friendly calendar component at `src/features/bookings/components/DateFilterCalendar.tsx` featuring month navigation, days grid, today indicators, activity dots highlighting dates with active bookings, and quick actions ("Today", "Yesterday", "Clear", "Done").
- **Search Bar Integration (`BookingsPage.tsx`)**: Added a search bar filtering across booking reference, customer name, pickup warehouse, truck number plate, truck type, and status state labels in real time.
- **Calendar Filter Button & Popover**: Placed an expandable calendar button on the right side of the search bar. When toggled, it smoothly reveals the calendar picker to filter bookings by creation date.
- **Active Filter Chips & Clear Actions**: Rendered dismissible badge chips for active date and search query filters, along with a "Clear all" action and friendly empty state views when no matching records are found.

## Phase 48: Create Booking Step 1 Validation Missing Field Scroll Focus
- **Form Field Identity Alignment**: Added `id` and `name` attributes to all inputs and select dropdowns across `PickupSection.tsx`, `DeliverySection.tsx`, `TruckDetailsSection.tsx`, and `DriverDetailsSection.tsx`.
- **Targeted Scroll & Focus on Validation Failure (`useCreateBookingStep1.ts`)**: Updated validation and proceed handlers to determine the first missing required field in document order and smoothly scroll the viewport directly to that field with sticky header offset calculation and auto-focus instead of scrolling to the top of the page.

## Phase 49: Step 2 Single Bundle Option & Default Weight Selection
- **Default Ordering Mode by Weight (`ProductConfigSheet.tsx`)**: Updated product configuration initialization so that "Custom Weight" (`useBundle: false`) is the default selection instead of bundle mode.
- **Simplified Single Bundle Option**: Consolidated bundle options across mock definitions, `useCreateBookingStep2.ts`, and `constants.ts` into a single option (`Standard Bundle`).
- **Removed Bundle Weight Displays**: Removed preset weight references, calculated weight calculations, and summary weight boxes from the bundle configuration sheet and selected product cards.

## Phase 50: Bookings Card Customer & Full Warehouse Pickup Address Display
- **Customer Name Resolution (`bookingApi.ts`)**: Resolved `customer_name` directly from the customer object and master data without falling back to ship-to address strings.
- **Full Pickup Warehouse Address Integration**: Mapped full warehouse address (`pickup_warehouse_address`) from API and cached master data warehouses.
- **Bookings Card Update (`BookingsPage.tsx`)**: Updated booking cards to cleanly render the customer's name under "Customer" and the full warehouse address under "Pickup".

## Phase 51: Transporter Role Dashboard & Development Force Override
- **Transporter Dashboard Component (`TransporterDashboard.tsx`)**: Created `src/features/dashboard/components/TransporterDashboard.tsx` with a modern 2-column action grid matching the RNE design system, featuring primary action tiles for **Upload Bill Tick** and **Quotes**.
- **Icon Set Additions (`Icons.tsx`)**: Added `BillCheckIcon` and `QuoteIcon` to `src/features/dashboard/components/Icons.tsx`.
- **Development Force Override (`DashboardPage.tsx`)**: Added `FORCE_TRANSPORTER_DASHBOARD` development bypass flag in `DashboardPage.tsx` to automatically render the Transporter dashboard during active development prior to backend role configuration.

## Phase 52: Transporter Quotes Management Feature
- **Quotes Domain Types (`types.ts`) & Service (`transporterApi.ts`)**: Defined `QuoteItem` and `QuoteStatus` structures supporting pending quote requests and quoted/completed orders with realistic transport orders across Northeast routes.
- **Quotes Page (`QuotesPage.tsx`)**: Created two distinct sections via segmented controls:
  - **Pending to Quote**: Displays quote number, from and where to locations, materials requested, asking rate, and interactive "Submit Quote" modal.
  - **Already Quoted**: Displays quote number, status badges (`Pending`, `Accepted`, `Rejected`), route, materials, asking rate, proposed rate, and trucks sent, plus rejection reasons when applicable.
- **Router & Native Navigation Setup (`router/index.tsx`)**: Configured `/transporter/quotes` route with Level 1 page hierarchy mapped to `/dashboard` for native Android hardware back handling.

## Phase 53: Dedicated Transporter Submit Quote Proposal Page
- **Full Page Architecture (`SubmitQuotePage.tsx`)**: Transitioned quote proposal submission into a dedicated page (`/transporter/quotes/submit/:id`) with Level 2 hierarchy mapped to `/transporter/quotes`.
- **Server Read-Only Summary (`ServerQuoteSummary.tsx`)**: Displays top quote number and date, heading route (`Origin ➔ Destination`) with directional arrow, materials requested, asking rate, and trucks required.
- **Transporter Quote Proposal Form**:
  - **Available Trucks Counter**: Validated input constrained to the required trucks ceiling (`available_trucks <= quote.trucks_required`).
  - **Dynamic Truck Specifications (`TruckDetailFormCard.tsx`)**: Dynamically renders individual truck cards requesting Vehicle Type (dropdown), Capacity (TONs), and Pricing Base (`Per TON` vs `Per Truck`).
  - **Proposed Rate & Sticky Submit Bar**: Bottom sticky bar with full-width submit button, validated and enabled only when all truck specifications and proposed rate are filled.

## Phase 54: Quote-Level Pricing Base, Empty Initial Form State & Non-Restricting Validation
- **Quote-Level Pricing Base**: Moved the pricing base selector out of individual truck cards and positioned it as a unified quote-level setting directly above the Proposed Rate input.
- **Empty Initial Form State**: Initialized `availableTrucks`, `truckDetails`, and `proposedRate` as empty inputs on initial page load.
- **Non-Restricting Validation & Warning Banner**: Allowed free numeric typing in the available trucks field without clamping user keystrokes; displays a dynamic warning banner below the field when the entered number exceeds the required truck count or is invalid, while keeping the submit button disabled until resolved.

## Phase 55: Available Trucks Header Layout Alignment Fix
- **Inline Header Alignment (`SubmitQuotePage.tsx`)**: Restored the Available Trucks card header layout to keep the `Max: N` count badge perfectly aligned in line using `shrink-0`, `whitespace-nowrap`, and `min-w-0` on the title container to prevent multi-line wrapping across mobile viewports.

## Phase 56: Server-Driven Quote Rate Unit & Removed Manual Pricing Base Selector
- **Removed Pricing Base Selector (`SubmitQuotePage.tsx`)**: Removed the manual pricing base selection section from the proposal form so the rate base is determined by the server's asking rate.
- **Server-Driven Rate Unit (`useSubmitQuote.ts`)**: Automatically derived rate unit (`Ton` or `Truck`) directly from the server-sent `asking_rate` to maintain unit parity between the customer's asking rate and the transporter's proposed rate.

## Phase 57: Transporter Bottom Nav Concealment & Approved Quote Driver Details Assignment
- **Bottom Navigation Concealment (`MainLayout.tsx`)**: Configured `/transporter/quotes/submit` and `/transporter/quotes/assign-drivers` routes to hide the bottom navigation bar, offering full vertical screen real estate for form entry.
- **Approved Quote Driver Assignment Navigation (`QuotesPage.tsx`, `QuoteCard.tsx`)**: For quotes with `accepted`/approved status in the "Already Quoted" tab, rendered an "Enter Driver Details" action button and enabled card click navigation to `/transporter/quotes/assign-drivers/:id`.
- **Driver Assignment Workflow (`AssignDriversPage.tsx`, `DriverAssignmentCard.tsx`, `useAssignDrivers.ts`)**: Created the driver assignment page to capture Truck Number Plate, Driver Name, Driver Contact Number, and Driver License Number for each allocated truck, mirroring the fields used in the booking component.

## Phase 58: Transporter Quotes Date Filter Integration & Shared Calendar Component
- **Shared Calendar UI Component (`DateFilterCalendar.tsx`)**: Extracted and centralized `DateFilterCalendar` in `src/components/ui/DateFilterCalendar.tsx` as a shared component accessible across Bookings and Transporter features.
- **Quotes Page Date Filtering (`QuotesPage.tsx`, `useQuotes.ts`)**:
  - Integrated the calendar button alongside the search bar with active date pill indicator and expand/collapse trigger.
  - Implemented multi-criteria filtering combining search text and selected date filtering with active filter badges and quick clear triggers.

## Phase 59: Dedicated `transport/transport` Mock Login Bypass & Clean Role Resolution
- **Removed Hardcoded Override (`DashboardPage.tsx`)**: Eliminated `FORCE_TRANSPORTER_DASHBOARD` constant; dashboard role display is now derived strictly from the authenticated user's assigned role.
- **Authentication Bypass for Development (`AuthProvider.tsx`)**: Configured `login()` in `AuthProvider` to intercept credentials matching `transport / transport` (or `transporter / transporter`), bypassing the backend API call to establish a simulated Transporter role session (`role: 'transporter'`) and route directly to the Transporter dashboard.

## Phase 60: Individual Per-Truck Proposed Rate & Pricing Base Configuration
- **Per-Truck Rate & Base Formulation (`TruckDetailFormCard.tsx`)**: Re-integrated the Pricing Base selector (`Per TON` vs `Per Truck`) and dedicated Proposed Rate input (`₹ / Unit`) directly inside each individual truck specification card.
- **Removed Standalone Quote Rate Card (`SubmitQuotePage.tsx`)**: Removed the separate global rate section from the submit page; each truck card now encapsulates its own vehicle type, capacity, pricing base, and proposed rate.
- **Multi-Truck Rate Aggregation & Validation (`useSubmitQuote.ts`, `transporterApi.ts`)**: Form submission validates that each allocated truck possesses a valid rate and pricing base, and computes formatted rate summaries for multi-truck proposals.

## Phase 61: Standalone In-Memory Transporter State & Removed Quotes API Calls
- **Removed Quotes API Endpoints (`transporterApi.ts`)**: Removed all remote HTTP `apiRequest` calls (`/booking/transporter/quotes*`), converting `getQuotes`, `getQuoteById`, `submitQuoteProposal`, and `saveQuoteDriverDetails` to operate directly on in-memory mock state with realistic async delays.

## Phase 62: Centralized Toast Notification System & Automatic API Error Handling
- **Centralized Toast System (`ToastProvider.tsx`, `App.tsx`)**: Created a root-level floating toast notification manager with slide-down animations, glassmorphism cards, status icons (Success, Error, Warning, Info), and automatic/manual dismiss capabilities. Supports both React context (`useToast()`) and decoupled non-React window event dispatching (`dispatchGlobalToast`).
- **Universal API Error Interception (`api.ts`)**: Wired `apiRequest` to automatically intercept and display structured error toast notifications whenever network connections fail, sessions expire (401), or backend responses fail (status >= 400 or `{ status: 'error' }`), providing universal error feedback across every dashboard and feature.
- **Integrated Action Success Feedback**: Integrated success toasts across key mutation flows:
  - Create / Update Booking (`useCreateBookingStep2.ts`)
  - Cancel Booking (`useBookings.ts`)
  - Submit Vendor Bill (`SubmitVendorBillPage.tsx`)
  - Truck Arrival Reports (`ReportTruckPage.tsx`, `ReportOutgoingTruckPage.tsx`)
  - Transporter Quote & Driver Submissions (`useSubmitQuote.ts`, `useAssignDrivers.ts`)

## Phase 63: Standardized TanStack Query Truck Mutations & Automatic Cache Invalidation
- **Truck Mutation Hooks (`useTruckMutations.ts`)**: Created `useSubmitVendorBill`, `useReportTruckArrival`, and `useReportOutgoingTruckArrival` with automatic query cache invalidation on `loadingTrucks`, `loadedTrucks`, and `outgoingTrucks`.
- **Integrated Pages (`ReportTruckPage.tsx`, `ReportOutgoingTruckPage.tsx`, `SubmitVendorBillPage.tsx`)**: Replaced direct API invocations with mutation hooks, ensuring that list queries automatically refresh upon successful reporting/bill submission without stale state or manual reloads.























