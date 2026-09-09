# RNE Steel Logistics App — Comprehensive User Guide

Welcome to the **RATHI NORTH EAST (RNE) Steel Logistics Application**. This guide walks through the end-to-end functionality of the platform, from first-time login to role-specific daily operations, security procedures, and document management.

---

## Table of Contents

1. [Platform Overview & System Access](#1-platform-overview--system-access)
2. [Authentication & First-Time Login](#2-authentication--first-time-login)
3. [Global Navigation & Interface Elements](#3-global-navigation--interface-elements)
4. [Role Guide: Security Personnel](#4-role-guide-security-personnel)
5. [Role Guide: PO Approver](#5-role-guide-po-approver)
6. [Role Guide: Transporter Partner](#6-role-guide-transporter-partner)
7. [Role Guide: Seller / Vendor Partner](#7-role-guide-seller--vendor-partner)
8. [Role Guide: Customer / Buyer](#8-role-guide-customer--buyer)
9. [Role Guide: Management / Admin](#9-role-guide-management--admin)
10. [Core Mobile Features & Capabilities](#10-core-mobile-features--capabilities)
11. [Profile & Account Settings](#11-profile--account-settings)
12. [Troubleshooting & Frequently Asked Questions](#12-troubleshooting--frequently-asked-questions)

---

## 1. Platform Overview & System Access

The RNE Steel Logistics platform connects plant security, dispatch coordinators, purchase managers, vendors, transporters, and buyers in a real-time ecosystem.

### Supported Environments
* **Mobile Application:** Accessible on smartphones and tablets for on-the-go operations.
* **Desktop Portal:** Accessible via web browsers (Chrome, Safari, Edge) on your computer.

### Device Requirements
* **Camera Access:** Required for gate photo checks, weighment slips, bill uploads, and Bilty documents.
* **Internet Connection:** 3G, 4G, 5G, or Wi-Fi.

---

## 2. Authentication & First-Time Login

Every user accesses the application with credentials provisioned by the system administrator.

[INSERT SCREENSHOT HERE: Login Screen]

### Step-by-Step Sign In Flow
1. **Launch the App:** Open the RNE Steel app on your device or visit the web portal.
2. **Enter Credentials:**
   * **Login / Email:** Your registered company username or corporate email.
   * **Password:** Your assigned secure password.
3. **Submit:** Tap **Sign In**.
4. **Automatic Role Routing:** The system verifies your credentials and automatically directs you to your customized role dashboard (e.g., Security, PO Approver, Transporter).
5. **Persistent Session:** You will stay signed in until you explicitly log out.

### Permissions Request Prompt
Upon first launch on mobile devices, you may be asked to grant the following permissions:
* **Camera Permission:** Select **"Allow"** (needed to snap photos of trucks, drivers, and delivery notes).
* **Notification Permission:** Select **"Allow"** (needed for alerts when POs require approval or trucks arrive at the gate).

---

## 3. Global Navigation & Interface Elements

Regardless of your assigned role, the top header and bottom bar provide consistent controls.

[INSERT SCREENSHOT HERE: Main Dashboard showing Header and Bottom Navigation]

### 1. Top Header Bar
* **Theme Switcher (`Sun / Moon` icon):** Toggle between Light Mode and Dark Mode. 
* **Notification Center (`Bell` icon):**
  * Displays an unread badge counter.
  * Tapping the bell opens the Notification list.
  * Tapping any notification opens the relevant PO, truck, or booking immediately.
* **Sign Out Button (`Red Exit` icon):** Safely ends your session.

### 2. Time-Aware Dynamic Greeting
The greeting automatically updates based on your local device clock (Good Morning, Good Afternoon, or Good Evening).

### 3. Bottom Navigation Bar
* **Dashboard Tab:** Returns to your primary action tiles and live lists.
* **Profile Tab:** Shows your account information, company, and work location.

---

## 4. Role Guide: Security Personnel

Security officers at plant gates manage inward truck arrivals, weighing verifications, and outward gate passes.

[INSERT SCREENSHOT HERE: Security Dashboard]

### Workflow A: Inward Truck Arrival (Loading Trucks)
1. Tap the **Loading Trucks** tile on the dashboard.
2. The list displays all scheduled or arriving vehicles.
3. Tap **Report Ingoing Truck** on the target vehicle.
4. Complete the entry form:
   * Verify **Vehicle Registration Number**.
   * Confirm **Driver Name** and **Mobile Number**.
   * Record the initial **Tare Weight** (empty weight) if required.
   * Tap the **Camera** button to take photos of the truck front, license plate, and driver identity.
5. Tap **Submit Entry**. The truck status is updated to *"At Gate / Loading"*.

[INSERT SCREENSHOT HERE: Inward Truck Entry Form & Camera screen]

### Workflow B: Outward Gate Pass Verification (Loaded Trucks)
1. When a loaded truck arrives at the exit gate, tap **Loaded Trucks**.
2. Select the truck from the list and tap **Report Outgoing Truck**.
3. Conduct gate verification:
   * Verify physical goods against the gross weighment slip.
   * Confirm **Gross Weight** and **Net Weight** values.
   * Capture a photo of the loaded cargo bed and the stamped weighment slip.
   * Verify driver license and vehicle seals.
4. Tap **Authorize Gate Exit**. The truck moves to the *"Outgoing / In Transit"* state.

### Workflow C: Outgoing Trucks Archive
* Tap **Outgoing Trucks** to view past cleared vehicles, departure timestamps, and security officer logs.

---

## 5. Role Guide: PO Approver

Purchase order approvers review vendor bookings, verify product line items, inspect financial values, review internal notes, and authorize or reject orders.

[INSERT SCREENSHOT HERE: PO Approver Dashboard]

### Step 1: Open the PO Approval Queue
1. Tap the **PO Approval** tile (displays the number of pending orders).
2. The pending list appears, showing:
   * **PO Number** and **Date Requested**.
   * **Vendor Name** and **Full Address**.
   * **Total Amount** (including applicable taxes).
3. **Filter & Search:** Use the search bar to find orders by PO number, vendor name, or location.

[INSERT SCREENSHOT HERE: PO Approval List View]

### Step 2: Review PO Detailed View
Tap any card to open the **PO Details Page**:

* **PO Header:** Displays PO number, date, vendor info, and requestor details.
* **PDF Download:** Tap the **PDF** button to view or download the official PO document.
* **Sequential Notes:** Important internal remarks displayed sequentially exactly as they appear in the main system.
* **Product Lines:** Continuous numbering, material type, description, and quantity.
* **Line Amount:** Labeled **`Amount Without Tax`** to clearly distinguish pre-tax base cost.
* **Total Valuation:** Summary card displaying Amount Without Tax, Applicable Taxes, and Grand Total.

[INSERT SCREENSHOT HERE: PO Details Page showing Notes and Amount Without Tax]

### Step 3: Taking Action (Approve vs Reject)

#### To Approve the Purchase Order:
1. Tap the green **Approve** button.
2. A confirmation prompt will appear.
3. Tap **Confirm**. The order is approved and removed from your pending queue.

#### To Reject the Purchase Order:
1. Tap the red **Reject** button.
2. Enter a mandatory **Rejection Reason** (e.g., "Price variance exceeds limit").
3. Tap **Confirm Rejection**. The order is rejected, and the requestor is notified.

---

## 6. Role Guide: Transporter Partner

Transporters submit freight rates, win delivery tenders, assign drivers, and upload signed delivery receipts (Bilty).

[INSERT SCREENSHOT HERE: Transporter Dashboard]

### Step 1: Freight Quotations
1. Tap **Quotes** on your dashboard.
2. Review available quote requests.
3. Tap **Submit Quote**:
   * Enter your freight quote.
   * Specify vehicle type and quote validity.
   * Tap **Send Quotation**.

### Step 2: Driver & Vehicle Allocation
1. When a quotation is awarded, navigate to **Assign Drivers**.
2. Select the winning booking and enter the **Driver Name, Mobile Number**, and **Vehicle Registration**.
3. Tap **Confirm Assignment**.

### Step 3: Bilty (LR) Submission
1. Tap **Upload Bilty** after loading is complete.
2. Use the **Camera** to capture a photo of the physical signed Bilty, or select a document from your device.
3. Tap **Upload**.

[INSERT SCREENSHOT HERE: Bilty Upload Screen]

---

## 7. Role Guide: Seller / Vendor Partner

Sellers and suppliers create advance dispatch bookings and upload vendor bills.

[INSERT SCREENSHOT HERE: Seller Dashboard]

### Step 1: Create a Booking
1. Tap **Booking -> Manage & Add** on your dashboard.
2. Tap **Create New Booking (+)**:
   * Select Buyer / Destination, Material Category, and Expected Dispatch Date.
   * Add line items, specify quantity, base unit rate, and remarks.
3. Tap **Submit Booking**.

[INSERT SCREENSHOT HERE: Create Booking Screen]

### Step 2: Submit Vendor Bills
1. Once cargo is delivered, open **Submit Vendor Bill**.
2. Select the corresponding booking reference.
3. Input the **Invoice Number**, **Invoice Date**, and **Amount**.
4. Capture or attach a photo of the tax invoice and tap **Submit Bill**.

---

## 8. Role Guide: Customer / Buyer

Customers and buyers monitor their shipments and order progression.

[INSERT SCREENSHOT HERE: Customer Dashboard]

* **Dashboard View:** Shows active bookings and current shipping phases.
* **Order Tracking:** Follows the flow: `Order Placed` ➔ `Approved` ➔ `Driver Assigned` ➔ `Loaded at Plant` ➔ `In Transit` ➔ `Delivered`.
* **Delivery Confirmation:** Check expected arrival time and view driver contact details.

---

## 9. Role Guide: Management / Admin

Managers and administrators have comprehensive oversight across all logistics operations.

[INSERT SCREENSHOT HERE: Admin Dashboard]

* Access to operational summaries and active gate throughput.
* Visibility into pending PO queues, transporter bidding logs, and gate clearance times.
* Ability to review past records and verify compliance.

---

## 10. Core Mobile Features & Capabilities

### 1. Pull-to-Refresh Gesture
On any list screen (PO Approvals, Trucks, Quotes, etc.):
* Drag your finger downwards from the top of the screen to refresh the page and view the latest updates.

[INSERT SCREENSHOT HERE: Pull to refresh action]

### 2. Built-In Camera
* Camera capture works directly within the app.
* Images are automatically optimized for fast uploading.

### 3. Push Notifications
* Receive alerts for newly assigned bookings, approved POs, and gate arrivals.
* Tap the notification to jump straight to the relevant record.

---

## 11. Profile & Account Settings

Tap the **Profile** icon in the bottom navigation bar to access account settings:

[INSERT SCREENSHOT HERE: Profile Screen]

* **Account Details:** View your Role, Company, and Work Location.
* **Theme Preference:** Switch between Light and Dark themes.
* **Sign Out:** Securely sign out of your account.

---

## 12. Troubleshooting & Frequently Asked Questions

**Q1: I cannot log in. It says "Invalid Credentials".**
* Double-check your username/email for extra spaces or typos.
* Ensure your password is correct.
* Contact your system administrator if the issue persists.

**Q2: Why is the camera not opening?**
* Open your device's Settings ➔ Apps ➔ RNE Steel App ➔ Permissions ➔ Camera.
* Ensure the permission is set to "Allow".

**Q3: An item disappeared from my list.**
* Another authorized user may have already reviewed or processed it.
* Use the **Pull-to-Refresh** gesture to see the latest list.

**Q4: The app is having trouble loading data.**
* Check your internet connection (Wi-Fi or cellular).
* Pull down on the screen to retry once you have a better signal.

**Q5: How do I view notes for a Purchase Order?**
* Open the PO Details page. Important notes are highlighted in distinct sections labeled **Notes**, shown exactly where they apply to the order.

---

*Documentation maintained by RNE Steel Logistics.*
