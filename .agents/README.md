# Mobile API

This document describes the REST-style HTTP endpoints for the **RNE
application**. There is one app: screens and data change by the logged-in
user's **role** (for example Security, Seller / Vendor, Transporter, Buyer, Admin).

## Authentication

The API uses **token-based authentication**. Each user has a single persistent
token stored on their `res.users` record (`mobile_token`). On the
first successful login the server generates this token; subsequent logins
return the same token. The mobile client must send that token in the
`Authorization` header on all subsequent requests:

```text
Authorization: Bearer <token>
```

For multi-database Odoo instances, send the target database name in the
`X-Odoo-Database` header with every request.

All authenticated endpoints require a valid token. The token does not expire
and is not rotated on logout — it remains valid until an administrator clears
it from the user's **Security** tab (**Delete** button next to *Reporting
Mobile Token*), at which point a new token is generated on the user's next
login.

---

## 1. Login

**Endpoint**

```text
POST /booking/auth/login
```

**Authentication**

Public. No token required.

**Request Headers**

| Header            | Type   | Required | Description                                              |
| ----------------- | ------ | -------- | -------------------------------------------------------- |
| `Username`        | string | Yes      | Odoo login (e-mail or username).                         |
| `Password`        | string | Yes      | Odoo password.                                           |
| `X-Odoo-Database` | string | No       | Database name. Required for multi-database setups.       |

> **Note:** Header names are case-insensitive. The `login` header is also accepted as an alias for `Username`.

**Example Request**

```bash
curl -X POST "http://<odoo-host>/booking/auth/login" \
  -H "Username: security.user@example.com" \
  -H "Password: MyPassword" \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "token": "a1b2c3d4...",
  "user": {
    "id": 23,
    "name": "Security User",
    "login": "security.user@example.com",
    "email": "security.user@example.com",
    "phone": "+91 12345 67890",
    "company_id": 1,
    "company_name": "My Company",
    "is_admin": false,
    "role": "Security",
    "employee_id": 15,
    "employee_address_id": 45,
    "employee_address_name": "Main Warehouse"
  }
}
```

**Role-based response notes**

* The `employee_*` fields are **only included when the logged-in user is
  linked to an employee record** (`hr.employee.user_id = user.id`).
* If no employee record exists, these keys are omitted from the response
  altogether. This keeps the payload clean and avoids unnecessary empty
  fields for Vendors, Sellers, Admins, and other non-employee users.
* When an employee record exists, `employee_address_id` and
  `employee_address_name` refer to the employee's Work Address.

**Example Error Response** (`401 Unauthorized`)

```json
{
  "status": "error",
  "message": "Invalid credentials."
}
```

---

## 2. Logout

**Endpoint**

```text
POST /booking/auth/logout
```

**Authentication**

Bearer token from `login`.

**Description**

Does not delete or rotate the token — it remains valid on the user's
`res.users` record. This endpoint simply acknowledges sign-out; the mobile
client should clear the token locally to end the local session.

**Example Request**

```bash
curl -X POST "http://<odoo-host>/booking/auth/logout" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

---

## 3. Loaded Trucks Waiting for Unloading

**Endpoint**

```text
GET /booking/trucks/loaded
```

**Authentication**

Bearer token from `login`.

**Behaviour**

Returns Company-delivery truck lines that are currently `loaded` and waiting
for reporting (`transport.booking.truck.line`, `state = 'loaded'`,
`delivery_location_type = 'company'`).

* If the user is in `group_booking_admin` or is a main Odoo administrator,
  all matching records are returned.
* If the user is in the `Security` role (`group_role_security`), only records
  whose `delivery_address_id` matches the employee's `address_id` (Work Address)
  are returned.
* Other users receive a `403 Forbidden` response.

**Response Data**

| Field               | Type    | Description                                              |
| ------------------- | ------- | -------------------------------------------------------- |
| `id`                | integer | Truck line record ID.                                    |
| `truck_type_id`     | integer | ID of the proposed truck type.                           |
| `truck_type`        | string  | Display name of the truck type.                          |
| `truck_number_plate`| string  | Number plate of the truck.                               |
| `driver_name`       | string  | Name of the driver.                                      |
| `is_reported`       | boolean | `true` if the truck was already reported.                |
| `state`             | string  | Current state of the truck line (e.g. `loaded`).         |
| `delivery_address_id`   | integer | ID of the delivery location.                         |
| `delivery_address_name` | string  | Full address / name of the delivery location.          |

**Example Request**

```bash
curl -X GET "http://<odoo-host>/booking/trucks/loaded" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "count": 2,
  "trucks": [
    {
      "id": 101,
      "truck_type_id": 7,
      "truck_type": "20 Ft Container",
      "truck_number_plate": "KA-01-AB-1234",
      "driver_name": "Rajesh Kumar",
      "is_reported": false,
      "state": "loaded",
      "delivery_address_id": 45,
      "delivery_address_name": "Main Warehouse, 123 Industrial Area, Bangalore 560001"
    },
    {
      "id": 102,
      "truck_type_id": 3,
      "truck_type": "Open Body 16 Ton",
      "truck_number_plate": "TN-09-CD-5678",
      "driver_name": "Suresh Singh",
      "is_reported": true,
      "state": "loaded",
      "delivery_address_id": 45,
      "delivery_address_name": "Main Warehouse, 123 Industrial Area, Bangalore 560001"
    }
  ]
}
```

---

## 4. Incoming Truck Reporting

**Endpoint**

```text
POST /booking/trucks/report
```

**Authentication**

Bearer token from `login`.

**Description**

This API reuses the same logic as the existing
`action_report` flow. The logged-in user
is automatically set as `reported_by`, and the same validations and writes that
happen in the Odoo UI are executed.

Only trucks in state `loaded`, with `delivery_location_type = 'company'` and
`is_reported = false`, can be reported. Security users may only report trucks
whose delivery address matches their employee work address; admins may report
all.

**Request Format**

The recommended and most efficient upload format is `multipart/form-data`:

| Field                | Type     | Required | Description                                            |
| -------------------- | -------- | -------- | ------------------------------------------------------ |
| `truck_line_id`      | integer  | Yes      | ID of the `transport.booking.truck.line` record.       |
| `reporting_datetime` | string   | Yes      | UTC datetime. `YYYY-MM-DD HH:MM:SS` or ISO-8601.       |
| `note`               | string   | No       | Free-text note.                                        |
| `image_1`            | file     | Yes*     | First image file.                                      |
| `image_2`            | file     | No       | Second image file.                                     |
| `image_3`            | file     | No       | Third image file.                                      |

\* At least one image is required. `image_2` and `image_3` are optional.

**Image Upload Format**

The backend accepts the image in one of two ways:

1. **Recommended: `multipart/form-data` file upload**
   Send the images as regular file fields. No base64 encoding is required and
   the upload avoids the ~33% size overhead of base64.

2. **JSON with base64 strings** (`application/json`)
   Send the body as JSON and include the images as base64 strings:

   ```json
   {
     "truck_line_id": 101,
     "reporting_datetime": "2026-07-28 12:30:00",
     "note": "Truck arrived at gate",
     "image_1": "/9j/4AAQSkZJRgABAQ..."
   }
   ```

   Data-URIs such as `data:image/jpeg;base64,/9j/...` are also accepted.

**Example Request (multipart)**

```bash
curl -X POST "http://<odoo-host>/booking/trucks/report" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb" \
  -F "truck_line_id=101" \
  -F "reporting_datetime=2026-07-28 12:30:00" \
  -F "note=Truck arrived at gate" \
  -F "image_1=@/path/to/photo1.jpg" \
  -F "image_2=@/path/to/photo2.jpg" \
  -F "image_3=@/path/to/photo3.jpg"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "message": "Truck reported successfully.",
  "truck_line_id": 101
}
```

**Example Error Response** (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "At least one image is required."
}
```

---

## 5. Loading Trucks

**Endpoint**

```text
GET /booking/trucks/loading
```

**Authentication**

Bearer token from `login`.

**Behaviour**

Returns truck lines that are currently in the `loading` state
(`transport.booking.truck.line`, `state = 'loading'`).

* **Admin users** (or `group_booking_admin` / `base.group_system` /
  `base.group_erp_manager`) receive **all** loading trucks.
* **Seller / Vendor users** (`group_role_seller`) receive only trucks whose
  `pickup_location_id` matches the logged-in user's `partner_id`.
* Other roles receive an empty list (`count: 0, trucks: []`) because the
  endpoint is intended for the Vendor app and Admin dashboard.

**Response Data**

| Field                    | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| `id`                     | integer | Truck line record ID.                                    |
| `truck_type_id`          | integer | ID of the proposed truck type.                           |
| `truck_type`             | string  | Display name of the truck type.                          |
| `truck_number_plate`     | string  | Number plate of the truck.                               |
| `driver_name`            | string  | Name of the driver.                                      |
| `state`                  | string  | Current state of the truck line (`loading`).             |
| `is_submitted`           | boolean | `true` if the vendor bill (and E-Way Bill) details have already been submitted for this truck. |
| `pickup_location_id`     | integer | ID of the pickup location.                               |
| `pickup_location_name`   | string  | Full contact address of the pickup location.             |
| `delivery_address_id`    | integer | ID of the delivery location.                             |
| `delivery_address_name`  | string  | Full contact address of the delivery location.           |

**Example Request**

```bash
curl -X GET "http://<odoo-host>/booking/trucks/loading" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "count": 1,
  "trucks": [
    {
      "id": 201,
      "truck_type_id": 7,
      "truck_type": "20 Ft Container",
      "truck_number_plate": "KA-01-AB-1234",
      "driver_name": "Rajesh Kumar",
      "state": "loading",
      "is_submitted": false,
      "pickup_location_id": 32,
      "pickup_location_name": "Vendor Godown, 123 Industrial Area, Bangalore 560001",
      "delivery_address_id": 45,
      "delivery_address_name": "Main Warehouse, 123 Industrial Area, Bangalore 560001"
    }
  ]
}
```

---

## 6. Submit Vendor Bill Details

**Endpoint**

```text
POST /booking/trucks/submit_vendor_bill
```

**Authentication**

Bearer token from `login`.

**Description**

Allows a Vendor / Seller to upload the vendor bill and optional E-Way Bill
for a loading truck. The data is written into the existing
`transport.loading` record (the same fields used by the Odoo UI) and the
same validation rules that apply on **Finish Loading** are run.

**Authorisation**

* **Admin users** can submit for any truck in `loading` state.
* **Seller users** can submit only for trucks whose `pickup_location_id`
  matches their own `partner_id`.

**Request Format**

The recommended upload format is `multipart/form-data`:

| Field                        | Type     | Required | Description                                                            |
| ---------------------------- | -------- | -------- | ---------------------------------------------------------------------- |
| `truck_line_id`              | integer  | Yes      | ID of the `transport.booking.truck.line` record.                       |
| `bill_number`                | string   | Yes      | Vendor Bill Number (maps to `bill_reference`).                         |
| `bill_date`                  | string   | Yes      | Bill date. `YYYY-MM-DD` or ISO-8601.                                   |
| `bill_document`              | file     | Yes      | Bill PDF or image (maps to `bill_document`).                           |
| `bill_document_name`         | string   | No       | Optional file name. Defaults to the uploaded file name or `bill.pdf`.  |
| `eway_bill_attached_with_bill` | boolean | No       | `true` if E-Way Bill is already attached with the Bill. Default `false`. |
| `eway_bill_number`           | string   | No*      | E-Way Bill Number. Required unless `eway_bill_attached_with_bill` is `true`. |
| `eway_bill_document`         | file     | No*      | E-Way Bill document. Required unless `eway_bill_attached_with_bill` is `true`. |
| `eway_bill_document_name`    | string   | No       | Optional file name. Defaults to the uploaded file name or `eway_bill.pdf`. |

\* When `eway_bill_attached_with_bill` is `true`, `eway_bill_number` and
`eway_bill_document` are **not** mandatory. Otherwise, one of them must be
provided. This matches the validation in the existing Loading flow.

Files can also be sent as base64 strings in JSON.

**Example Request (multipart)**

```bash
curl -X POST "http://<odoo-host>/booking/trucks/submit_vendor_bill" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb" \
  -F "truck_line_id=201" \
  -F "bill_number=INV/2026/0001" \
  -F "bill_date=2026-07-28" \
  -F "bill_document=@/path/to/bill.pdf" \
  -F "eway_bill_attached_with_bill=false" \
  -F "eway_bill_number=123456789012" \
  -F "eway_bill_document=@/path/to/eway_bill.pdf"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "message": "Vendor bill details submitted successfully.",
  "loading_id": 55,
  "truck_line_id": 201
}
```

**Example Error Response** (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "Please fill vendor bill details before finishing loading: E-Way Bill Number or E-Way Bill Document"
}
```

---

## 7. Transporter Loading Trucks

**Endpoint**

```text
GET /booking/trucks/transporter/loading
```

**Authentication**

Bearer token from `login`.

**Authorisation**

* **Transporter users** (`group_role_transporter`) only.
* Other roles receive `403 Forbidden` with `"Not authorized."`.

**Behaviour**

Returns the transporter's truck lines that are currently in `loading` state.

`is_bilty_submitted` is `true` when the related `transport.loading` record
(via vehicle allocation, `state = waiting_for_loading`) already has a
`bilty_document` uploaded.

**Response Data**

| Field                    | Type    | Description                                              |
| ------------------------ | ------- | -------------------------------------------------------- |
| `id`                     | integer | Truck line record ID. Send this as `truck_line_id` when submitting the bilty. |
| `truck_type_id`          | integer | ID of the truck type.                                    |
| `truck_type`             | string  | Display name of the truck type.                          |
| `truck_number_plate`     | string  | Number plate of the truck.                               |
| `driver_name`            | string  | Name of the driver.                                      |
| `state`                  | string  | Current state of the truck line (`loading`).             |
| `is_bilty_submitted`     | boolean | `true` if the related loading record already has a bilty document. |
| `pickup_location_id`     | integer | ID of the pickup location.                               |
| `pickup_location_name`   | string  | Full contact address of the pickup location.             |
| `delivery_address_id`    | integer | ID of the delivery location.                             |
| `delivery_address_name`  | string  | Full contact address of the delivery location.           |

**Example Request**

```bash
curl -X GET "http://<odoo-host>/booking/trucks/transporter/loading" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "count": 1,
  "trucks": [
    {
      "id": 201,
      "truck_type_id": 7,
      "truck_type": "20 Ft Container",
      "truck_number_plate": "KA-01-AB-1234",
      "driver_name": "Rajesh Kumar",
      "state": "loading",
      "is_bilty_submitted": false,
      "pickup_location_id": 32,
      "pickup_location_name": "Vendor Godown, 123 Industrial Area, Bangalore 560001",
      "delivery_address_id": 45,
      "delivery_address_name": "Main Warehouse, 123 Industrial Area, Bangalore 560001"
    }
  ]
}
```

**Example Error Response** (`403 Forbidden`)

```json
{
  "status": "error",
  "message": "Not authorized."
}
```

---

## 8. Submit Bilty

**Endpoint**

```text
POST /booking/trucks/submit_bilty
```

**Authentication**

Bearer token from `login`.

**Description**

Allows a Transporter to upload the bilty document for a loading truck. The
file is written to `bilty_document` and `bilty_document_name` on the related
`transport.loading` record (the same fields used by the Odoo UI).

**Authorisation**

* **Transporter users** only. Other roles receive `403 Forbidden`.
* The truck line's `transporter_id` must match the logged-in user's
  `partner_id`. Otherwise the API returns `403` with
  `"This truck is not assigned to you."`.

**Request Format**

The recommended upload format is `multipart/form-data`:

| Field                  | Type    | Required | Description                                                                 |
| ---------------------- | ------- | -------- | --------------------------------------------------------------------------- |
| `truck_line_id`        | integer | Yes      | ID of the `transport.booking.truck.line` record.                            |
| `bilty_document`       | file    | Yes      | Bilty PDF or image (maps to `bilty_document`).                              |
| `bilty_document_name`  | string  | No       | Optional file name. Defaults to the uploaded file name or `bilty.pdf`.      |

The truck must be in `loading` state and must have an active loading record
(`transport.loading` in `waiting_for_loading` via vehicle allocation).

Files can also be sent as base64 strings in JSON.

**Example Request (multipart)**

```bash
curl -X POST "http://<odoo-host>/booking/trucks/submit_bilty" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb" \
  -F "truck_line_id=201" \
  -F "bilty_document=@/path/to/bilty.pdf" \
  -F "bilty_document_name=bilty.pdf"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "message": "Bilty document submitted successfully.",
  "loading_id": 55,
  "truck_line_id": 201
}
```

**Example Error Response** (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "Bilty document is required."
}
```

---

## 9. Outgoing Trucks

**Endpoint**

```text
GET /booking/trucks/outgoing
```

**Authentication**

Bearer token from `login`.

**Description**

Returns outgoing trucks currently in `draft` that are waiting to be reported at the warehouse.

* **Admin users** receive all matching trucks.
* **Security users** receive only trucks whose warehouse / pickup address matches their employee work address.
* Other users receive `403 Forbidden`.
* If a security user has no work address, the list is empty.

**Response fields**

| Field                   | Type    | Description |
| ----------------------- | ------- | ----------- |
| `id`                    | integer | Truck ID. Send this as `truck_id` when reporting. |
| `truck_type_id`         | integer | Truck type ID. |
| `truck_type`            | string  | Truck type name. |
| `truck_number_plate`    | string  | Number plate. |
| `driver_name`           | string  | Driver name. |
| `is_reported`           | boolean | `true` if already reported. |
| `state`                 | string  | Current state (`draft`). |
| `delivery_address_id`   | integer | Delivery location ID. |
| `delivery_address_name` | string  | Delivery address. |

**Example request**

```bash
curl -X GET "http://<odoo-host>/booking/trucks/outgoing" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Success — `200 OK`**

```json
{
  "status": "success",
  "count": 1,
  "trucks": [
    {
      "id": 55,
      "truck_type_id": 7,
      "truck_type": "20 Ft Container",
      "truck_number_plate": "KA-01-AB-1234",
      "driver_name": "Rajesh Kumar",
      "is_reported": false,
      "state": "draft",
      "delivery_address_id": 40,
      "delivery_address_name": "Customer D, Lucknow"
    }
  ]
}
```

---

## 10. Outgoing Truck Reporting

**Endpoint**

```text
POST /booking/trucks/outgoing/report
```

**Authentication**

Bearer token from `login`.

**Description**

Report an outgoing truck arrival at the warehouse. Same auth and reporting rules as incoming truck reporting: admin or security only, at least one image, and the truck must still be `draft` and not already reported. Security users may only report trucks at their work address.

**Request fields**

Recommended format: `multipart/form-data`. JSON with base64 images is also accepted.

| Field                | Type   | Required | Description |
| -------------------- | ------ | -------- | ----------- |
| `truck_id`           | integer | Yes     | `id` from `GET /booking/trucks/outgoing`. `id` is also accepted. |
| `reporting_datetime` | string  | Yes     | UTC datetime. `YYYY-MM-DD HH:MM:SS` or ISO-8601. |
| `note`               | string  | No      | Free-text note. |
| `image_1`            | file    | Yes*    | First image. |
| `image_2`            | file    | No      | Second image. |
| `image_3`            | file    | No      | Third image. |

\* At least one of `image_1`, `image_2`, `image_3` is required.

Images may be uploaded as files or as base64 / data-URI strings.

**Example request (multipart)**

```bash
curl -X POST "http://<odoo-host>/booking/trucks/outgoing/report" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb" \
  -F "truck_id=55" \
  -F "reporting_datetime=2026-07-28 12:30:00" \
  -F "note=Outgoing truck reported at gate" \
  -F "image_1=@/path/to/photo1.jpg"
```

**Success — `200 OK`**

```json
{
  "status": "success",
  "message": "Truck reported successfully.",
  "truck_id": 55
}
```

---

## Customer App APIs

The endpoints in this section (`/booking/customer/...`) are **Buyer-only**.
Admin, Security, Seller, and other roles receive `403 Forbidden`.

---

## 11. Customer Master Data

Use this API to fill the dropdowns on the **create truck request** screen
(warehouse, ship-to, bill-to, UOM, truck type).

**Endpoint**

```text
GET /booking/customer/master-data
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** — warehouses, UOMs, truck types, plus that customer's ship-to and bill-to addresses.
* Other roles (including Admin) receive `403 Forbidden`.

**What it returns**

| Field                 | Type   | Meaning |
| --------------------- | ------ | ------- |
| `customer_id`         | integer or `false` | Logged-in Buyer's customer ID. |
| `customer_name`       | string | Logged-in Buyer's customer name. |
| `warehouses`          | array  | Pickup warehouses for the warehouse dropdown. |
| `ship_to_addresses`   | array  | Addresses for the Ship To dropdown. |
| `bill_to_addresses`   | array  | Addresses for the Bill To dropdown. |
| `uoms`                | array  | Weight units (kg and ton). Use these when the user enters weight. |
| `truck_types`         | array  | Existing truck type names. The app can show them as suggestions and send the matching `id`, or type a name to match later. |

**`warehouses[]`**

| Field             | Type    | Meaning |
| ----------------- | ------- | ------- |
| `id`              | integer | Warehouse ID. Send this when creating the request. |
| `name`            | string  | Warehouse name (dropdown label). |
| `contact_address` | string  | Full address. Show under the name if needed. |

**`ship_to_addresses[]` and `bill_to_addresses[]`**

Show `contact_address` in the dropdown. Send `id` when the user selects one.

| Field             | Type    | Meaning |
| ----------------- | ------- | ------- |
| `id`              | integer | Address ID. |
| `contact_address` | string  | Full address text. |

**`uoms[]` / `truck_types[]`**

| Field  | Type    | Meaning |
| ------ | ------- | ------- |
| `id`   | integer | Record ID. |
| `name` | string  | Display name. |

**Example Request**

```bash
curl -X GET "http://<odoo-host>/booking/customer/master-data" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "customer_id": 40,
  "customer_name": "Customer D",
  "warehouses": [
    {
      "id": 1,
      "name": "Main Warehouse",
      "contact_address": "Main Warehouse, 123 Industrial Area, Bangalore 560001"
    }
  ],
  "ship_to_addresses": [
    {
      "id": 40,
      "contact_address": "Customer D, Lucknow"
    }
  ],
  "bill_to_addresses": [
    {
      "id": 40,
      "contact_address": "Customer D, Lucknow"
    }
  ],
  "uoms": [
    { "id": 1, "name": "kg" },
    { "id": 3, "name": "t" }
  ],
  "truck_types": [
    { "id": 7, "name": "20 Ft Container" }
  ]
}
```

---

## 12. Customer Products

Use this API to list products the customer can pick for DIA / line details
on the truck request screen.

**Endpoint**

```text
GET /booking/customer/products
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** — full product list for the app.
* Other roles (including Admin) receive `403 Forbidden`.

**What it returns**

Top level: `status`, `count`, `products`.

**`products[]`**

| Field              | Type    | Meaning |
| ------------------ | ------- | ------- |
| `id`               | integer | Product ID. Send this when the user selects the product. |
| `name`             | string  | Product name to show in the list. |
| `default_code`     | string  | Internal reference / SKU. |
| `image_128`        | string  | Small product image as **base64**. Empty string if there is no image. Decode and display directly. Do not treat this as a URL. |
| `brand_id`         | integer or `false` | Brand ID. |
| `brand`            | string  | Brand name. |
| `material_type_id` | integer or `false` | Material type ID. |
| `material_type`    | string  | Material type name. |
| `shape_id`         | integer or `false` | Shape ID. |
| `shape`            | string  | Shape name. |
| `weight_type_id`   | integer or `false` | Weight type ID. |
| `weight_type`      | string  | Weight type name. |
| `weight_type_code` | string  | Short code (for example `L`, `SL`). |
| `diameter_id`      | integer or `false` | Diameter ID. |
| `diameter`         | string  | Diameter label (for example `12`). |
| `has_bundles`      | boolean | `true` if this product has bundle options. |
| `bundles`          | array   | Bundle options. Empty when `has_bundles` is `false`. |

**`bundles[]`**

Use this list when `has_bundles` is `true` so the user can pick a bundle and enter quantity.

| Field           | Type    | Meaning |
| --------------- | ------- | ------- |
| `id`            | integer | Bundle ID. Send this when the user selects a bundle. |
| `name`          | string  | Bundle name. |
| `rod_qty`       | integer | Number of rods in the bundle. |
| `rod_length`    | number  | Rod length in meters. |
| `weight`| number  | Bundle weight. |
| `uom_id`        | integer or `false` | UOM ID for the bundle weight. |
| `uom`           | string  | UOM name (usually kg). |

**Example Request**

```bash
curl -X GET "http://<odoo-host>/booking/customer/products" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "count": 1,
  "products": [
    {
      "id": 58,
      "name": "12mm TMT Fe500",
      "default_code": "12/1",
      "image_128": "/9j/4AAQSkZJRgABAQ...",
      "brand_id": 2,
      "brand": "Brand A",
      "material_type_id": 1,
      "material_type": "TMT",
      "shape_id": 1,
      "shape": "Round",
      "weight_type_id": 3,
      "weight_type": "Standard",
      "weight_type_code": "S",
      "diameter_id": 4,
      "diameter": "12",
      "has_bundles": true,
      "bundles": [
        {
          "id": 10,
          "name": "12mm x 12m",
          "rod_qty": 10,
          "rod_length": 12.0,
          "weight": 106.56,
          "uom_id": 1,
          "uom": "kg"
        }
      ]
    }
  ]
}
```

---

## 13. Customer Shapes and Weight Types

Use this API to list product shapes and weight types for filters or DIA
fields on the truck request screen.

**Endpoint**

```text
GET /booking/customer/shapes-weight-types
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** only.
* Other roles (including Admin) receive `403 Forbidden`.

**What it returns**

| Field          | Type  | Meaning |
| -------------- | ----- | ------- |
| `shapes`       | array | Product shapes. |
| `weight_types` | array | Product weight types. |

**`shapes[]`**

| Field  | Type    | Meaning |
| ------ | ------- | ------- |
| `id`   | integer | Shape ID. |
| `name` | string  | Shape name. |

**`weight_types[]`**

| Field  | Type    | Meaning |
| ------ | ------- | ------- |
| `id`   | integer | Weight type ID. |
| `name` | string  | Weight type name. |
| `code` | string  | Short code (for example `L`, `SL`). |

**Example Request**

```bash
curl -X GET "http://<odoo-host>/booking/customer/shapes-weight-types" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "shapes": [
    { "id": 1, "name": "Round" }
  ],
  "weight_types": [
    { "id": 3, "name": "Standard", "code": "S" }
  ]
}
```

---

## 14. Submit Truck Request

Use this API when the customer submits a new **Truck From Warehouse** request, or updates an existing booking in `draft`, `accepted`, or `rejected`.

Send `truck_id` to update. Omit it to create a new booking. The same payload is used for both.

**Endpoint**

```text
POST /booking/customer/truck-request
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** only.
* Other roles (including Admin) receive `403 Forbidden`.

**Request format**

Send JSON (`application/json`) or form fields.

| Field                  | Type    | Required | Description |
| ---------------------- | ------- | -------- | ----------- |
| `truck_id`             | integer | No       | Existing booking `id` from the truck list / detail API. If sent, the same payload **updates** that booking (`draft`, `accepted`, or `rejected`). `id` is also accepted. |
| `is_seller_truck`      | boolean | No       | `true` — seller arranges the truck and driver. Truck Details and Driver Details are **not** required and are stored empty. Default `false`. |
| `warehouse_id`         | integer | Yes      | Selected warehouse `id` from `GET /booking/customer/master-data`. Company and pickup address are taken from this warehouse on the server. |
| `ship_to_address_id`   | integer | Yes      | Selected Ship To address `id` from master data. |
| `is_same_as_ship_to`   | boolean | Yes      | `true` — Bill To is the same as Ship To. `false` — send `bill_to_address_id`. |
| `bill_to_address_id`   | integer | If `is_same_as_ship_to` is `false` | Selected Bill To address `id` from master data. |
| `truck_number_plate`   | string  | If `is_seller_truck` is `false` | Truck number plate. |
| `truck_capacity_ton`   | number  | If `is_seller_truck` is `false` | Truck capacity in ton. Uses the **Product Unit** decimal accuracy. |
| `transporter_name`     | string  | No       | Transporter name. Ignored when `is_seller_truck` is `true`. |
| `transporter_contact`  | string  | No       | Transporter contact. Ignored when `is_seller_truck` is `true`. |
| `is_new_truck_type`    | boolean | If `is_seller_truck` is `false` | `false` — use an existing truck type (`truck_type_id`). `true` — enter a new truck type name. |
| `truck_type_id`        | integer | If `is_seller_truck` is `false` and `is_new_truck_type` is `false` | Truck type `id` from master data. |
| `truck_type`           | string  | If `is_seller_truck` is `false` and `is_new_truck_type` is `true` | New truck type name. `truck_type_name` is also accepted. If the name already exists, the existing record is reused. |
| `driver_name`          | string  | If `is_seller_truck` is `false` | Driver name. |
| `driver_contact`       | string  | If `is_seller_truck` is `false` | Driver contact. |
| `driver_licence_number`| string  | No       | Driver license number. Ignored when `is_seller_truck` is `true`. |
| `dia_details`          | array   | Yes      | List of DIA detail lines. `dia_lines` is also accepted. At least one line is required. |

**`dia_details[]`**

Send these fields in this order. Each object is one DIA line.

| Field            | Type    | Required | Description |
| ---------------- | ------- | -------- | ----------- |
| `dia`            | string  | Yes      | DIA value as text. Send the `mm` prefix from the app (for example `12mm`). Stored as a Char field. |
| `shape_id`       | integer | Yes      | Shape `id` from `GET /booking/customer/shapes-weight-types`. |
| `weight_type_id` | integer | Yes      | Weight type `id` from `GET /booking/customer/shapes-weight-types`. |
| `uom_id`         | integer | Yes      | UOM `id` from `GET /booking/customer/master-data` (`uoms`). |
| `qty_selection`  | string  | Yes      | `by_weight` or `by_bundle`. Stored on the DIA line (not shown in the Odoo form). |
| `weight`         | number  | If `qty_selection` is `by_weight` | Quantity in the selected UOM. Stored in `quantity`. Uses the **Product Unit** decimal accuracy. |
| `bundle_qty`     | number  | If `qty_selection` is `by_bundle` | Bundle quantity. Stored in `bundle_qty`. `weight` is also accepted for this value. Uses the **Product Unit** decimal accuracy. |

**Server-side behaviour (for reference)**

* Customer (`delivery_address_id`) is set from the logged-in Buyer’s partner.
* From `warehouse_id`, the server sets pickup company, warehouse, and warehouse address.
* When `is_same_as_ship_to` is `true`, Bill To is stored as the same address as Ship To.
* When `is_seller_truck` is `true`, Truck Details and Driver Details are cleared and not required.
* Each `dia_details` line is created as a `truck.dia.lines` record on the truck.
* If `qty_selection` is `by_weight`, `weight` is stored in `quantity` and `bundle_qty` is left empty.
* If `qty_selection` is `by_bundle`, the value is stored in `bundle_qty` and `quantity` is left empty.
* If `truck_id` is sent, the booking must belong to the logged-in customer and must be in `draft`, `accepted`, or `rejected`. DIA lines are replaced with the new list.

**Example request**

```bash
curl -X POST "http://<odoo-host>/booking/customer/truck-request" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb" \
  -H "Content-Type: application/json" \
  -d '{
    "is_seller_truck": false,
    "warehouse_id": 1,
    "ship_to_address_id": 40,
    "is_same_as_ship_to": true,
    "truck_number_plate": "KA-01-AB-1234",
    "truck_capacity_ton": 16.5,
    "transporter_name": "ABC Transport",
    "transporter_contact": "+91 98765 43210",
    "is_new_truck_type": false,
    "truck_type_id": 7,
    "driver_name": "Rajesh Kumar",
    "driver_contact": "+91 91234 56789",
    "driver_licence_number": "DL-1234567890",
    "dia_details": [
      {
        "dia": "12mm",
        "shape_id": 1,
        "weight_type_id": 3,
        "uom_id": 1,
        "qty_selection": "by_weight",
        "weight": 10.5
      },
      {
        "dia": "16mm",
        "shape_id": 1,
        "weight_type_id": 3,
        "uom_id": 1,
        "qty_selection": "by_bundle",
        "bundle_qty": 4
      }
    ]
  }'
```

**Example success response** (`200 OK`)

```json
{
  "status": "success",
  "message": "Truck request submitted successfully.",
  "truck_id": 55,
  "state": "draft"
}
```

**Example error response** (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "Truck Capacity is required."
}
```

---

## 15. Customer Trucks List

Returns the logged-in customer's truck bookings for the mobile list screen.

**Endpoint**

```text
GET /booking/customer/trucks
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** only.
* Other roles (including Admin) receive `403 Forbidden`.

**Behaviour**

* Returns `truck.from.warehouse` records where `delivery_address_id` is the logged-in customer's partner.
* Cancelled bookings are excluded (`state != cancelled`).
* No pagination. State filters may be added later.

**`trucks[]`**

| Field                 | Type    | Meaning |
| --------------------- | ------- | ------- |
| `id`                  | integer | Booking ID. Send this to the detail, update, and cancel APIs. |
| `state`               | string  | Booking state (`draft`, `accepted`, `rejected`, `loading`, `loaded`). |
| `state_label`         | string  | Display label for `state`. |
| `is_seller_truck`     | boolean | `true` if the seller arranges the truck. |
| `can_cancel`          | boolean | `true` when the app can show Cancel (`draft`, `accepted`, `rejected`, `loading`). |
| `truck_type_id`       | integer or `false` | Truck type ID. |
| `truck_type`          | string  | Truck type name. Empty for seller trucks. |
| `truck_number_plate`  | string  | Truck number plate. Empty for seller trucks. |
| `warehouse_id`        | integer | Pickup warehouse ID. |
| `warehouse_name`      | string  | Pickup warehouse name. |
| `pickup_address_id`   | integer | Pickup address ID. |
| `pickup_address`      | string  | Pickup contact address. |
| `ship_to_address_id`  | integer | Ship To address ID. |
| `ship_to_address`     | string  | Ship To contact address. |
| `bill_to_address_id`  | integer | Bill To address ID. |
| `bill_to_address`     | string  | Bill To contact address. |
| `driver_name`         | string  | Driver name. Empty for seller trucks. |
| `is_reported`         | boolean | `true` if the truck has been reported. |
| `rejected_reason`     | string  | Reject reason. Empty unless the booking is `rejected`. |
| `create_date`         | string  | Booking create datetime (`YYYY-MM-DD HH:MM:SS`). |

**Example request**

```bash
curl -X GET "http://<odoo-host>/booking/customer/trucks" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example success response** (`200 OK`)

```json
{
  "status": "success",
  "count": 1,
  "trucks": [
    {
      "id": 55,
      "state": "draft",
      "state_label": "Draft",
      "is_seller_truck": false,
      "can_cancel": true,
      "truck_type_id": 7,
      "truck_type": "20 Ft Container",
      "truck_number_plate": "KA-01-AB-1234",
      "warehouse_id": 1,
      "warehouse_name": "Main Warehouse",
      "pickup_address_id": 12,
      "pickup_address": "Main Warehouse, 123 Industrial Area, Bangalore 560001",
      "ship_to_address_id": 40,
      "ship_to_address": "Customer D, Lucknow",
      "bill_to_address_id": 40,
      "bill_to_address": "Customer D, Lucknow",
      "driver_name": "Rajesh Kumar",
      "is_reported": false,
      "rejected_reason": "",
      "create_date": "2026-08-27 10:15:00"
    }
  ]
}
```

---

## 16. Customer Truck Details

Returns the full booking that the customer submitted through `POST /booking/customer/truck-request`, including DIA details.

**Endpoint**

```text
GET /booking/customer/trucks/<truck_id>
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** only, and only for their own bookings.
* Other roles (including Admin) receive `403 Forbidden`.
* A booking that does not belong to the customer returns `404`.

**What it returns**

The list fields from section 13, plus:

| Field                   | Type    | Meaning |
| ----------------------- | ------- | ------- |
| `customer_id`           | integer | Customer partner ID. |
| `customer_name`         | string  | Customer name. |
| `is_same_as_ship_to`    | boolean | Bill To same as Ship To. |
| `truck_capacity_ton`    | number  | Truck capacity. |
| `transporter_name`      | string  | Transporter name. |
| `transporter_contact`   | string  | Transporter contact. |
| `driver_contact`        | string  | Driver contact. |
| `driver_licence_number` | string  | Driver license number. |
| `dia_details`           | array   | DIA lines from the original request. |

**`dia_details[]`**

| Field            | Type    | Meaning |
| ---------------- | ------- | ------- |
| `id`             | integer | DIA line ID. |
| `dia`            | string  | DIA value (for example `12mm`). |
| `shape_id`       | integer | Shape ID. |
| `shape`          | string  | Shape name. |
| `weight_type_id` | integer | Weight type ID. |
| `weight_type`    | string  | Weight type name. |
| `uom_id`         | integer | UOM ID. |
| `uom`            | string  | UOM name. |
| `qty_selection`  | string  | `by_weight` or `by_bundle`. |
| `quantity`       | number  | Stored quantity (used when `by_weight`). |
| `bundle_qty`     | number  | Stored bundle qty (used when `by_bundle`). |
| `weight`         | number or `false` | Same as `quantity` when `qty_selection` is `by_weight`, otherwise `false`. Send this back as `weight` when updating a `by_weight` line. |

Use this payload to fill the edit screen, then POST the same fields to `/booking/customer/truck-request` with `truck_id`.

**Example request**

```bash
curl -X GET "http://<odoo-host>/booking/customer/trucks/55" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example success response** (`200 OK`)

```json
{
  "status": "success",
  "truck": {
    "id": 55,
    "state": "draft",
    "is_seller_truck": false,
    "can_cancel": true,
    "warehouse_id": 1,
    "ship_to_address_id": 40,
    "is_same_as_ship_to": true,
    "truck_type_id": 7,
    "truck_number_plate": "KA-01-AB-1234",
    "truck_capacity_ton": 16.5,
    "driver_name": "Rajesh Kumar",
    "driver_contact": "+91 91234 56789",
    "dia_details": [
      {
        "id": 10,
        "dia": "12mm",
        "shape_id": 1,
        "shape": "Round",
        "weight_type_id": 3,
        "weight_type": "Standard",
        "uom_id": 1,
        "uom": "kg",
        "qty_selection": "by_weight",
        "quantity": 10.5,
        "bundle_qty": 0.0,
        "weight": 10.5
      }
    ]
  }
}
```

---

## 17. Cancel Customer Truck

Cancels the customer's own truck booking.

**Endpoint**

```text
POST /booking/customer/trucks/<truck_id>/cancel
```

**Authentication**

Bearer token from `login`. **Buyer role only.** Other roles receive `403 Forbidden`.

**Who can call it**

* **Buyer** only, and only for their own bookings.
* A booking that does not belong to the customer returns `404`.

**Allowed states**

Cancellation is allowed only when the booking is `draft`, `accepted`, `rejected`, or `loading`.

Use `can_cancel` from the list/detail APIs to show or hide the Cancel button.

**Example request**

```bash
curl -X POST "http://<odoo-host>/booking/customer/trucks/55/cancel" \
  -H "Authorization: Bearer a1b2c3d4..." \
  -H "X-Odoo-Database: mydb"
```

**Example success response** (`200 OK`)

```json
{
  "status": "success",
  "message": "Truck booking cancelled successfully.",
  "truck_id": 55,
  "state": "cancelled"
}
```

**Example error response** (`400 Bad Request`)

```json
{
  "status": "error",
  "message": "This truck cannot be cancelled in the current state (Loaded)."
}
```

---

## HTTP Status Codes

| Code | Meaning                                                            |
| ---- | ------------------------------------------------------------------ |
| 200  | Success.                                                           |
| 400  | Bad request / missing or invalid parameters / truck already reported. |
| 401  | Login failed or the bearer token is missing/invalid.               |
| 403  | User is not allowed to access this resource or report this truck.  |
| 500  | Unexpected server error.                                           |

---

## Mobile App Flow

1. Call `POST /booking/auth/login` with `X-Odoo-Database` to obtain a bearer token.
2. **Security Guard flow**
   - Incoming: `GET /booking/trucks/loaded` → show **Report** when `is_reported` is `false` → `POST /booking/trucks/report` with `truck_line_id`, datetime, note, and images.
   - Outgoing: `GET /booking/trucks/outgoing` → show **Report** when `is_reported` is `false` → `POST /booking/trucks/outgoing/report` with `truck_id`, datetime, note, and images.
3. **Vendor / Seller flow**
   - Call `GET /booking/trucks/loading` with the `Authorization: Bearer <token>`
     header to list trucks in `loading` state assigned to your pickup location.
   - Call `POST /booking/trucks/submit_vendor_bill` with the selected truck line
     ID, bill number, bill date, bill document, and E-Way Bill details.
4. **Transporter flow** (shown when login `role` is Transporter)
   - Call `GET /booking/trucks/transporter/loading` to list the transporter's
     trucks currently in `loading` state. Use `is_bilty_submitted` to show
     whether the bilty is already uploaded.
   - Call `POST /booking/trucks/submit_bilty` with the selected `truck_line_id`
     and `bilty_document`.
5. **Buyer flow** (same RNE app; shown when login `role` is Buyer). Customer App APIs are Buyer-only.
   - Call `GET /booking/customer/master-data` to fill warehouse, ship-to, bill-to, UOM, and truck type dropdowns.
   - Call `GET /booking/customer/products` to list products, images, and bundles for DIA selection (for a later step).
   - Call `GET /booking/customer/shapes-weight-types` for shape and weight-type lists.
   - Call `POST /booking/customer/truck-request` to create a truck request (`is_seller_truck` and `dia_details`). Send `truck_id` on the same API to update a booking in `draft`, `accepted`, or `rejected`.
   - Call `GET /booking/customer/trucks` to list the customer's bookings.
   - Call `GET /booking/customer/trucks/<truck_id>` to show full details (including DIA lines).
   - Call `POST /booking/customer/trucks/<truck_id>/cancel` when `can_cancel` is `true`.
6. Call `POST /booking/auth/logout` with the token header when the user signs
   out, then discard the token locally. The token itself remains valid on the
   server and will be returned again on the next login.

---
