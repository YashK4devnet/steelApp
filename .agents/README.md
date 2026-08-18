# Mobile API

This document describes the REST-style HTTP endpoints added to the
`booking_modifier_4devnet` module for the mobile application.

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

## 7. Outgoing Trucks

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

## 8. Outgoing Truck Reporting

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
4. Call `POST /booking/auth/logout` with the token header when the user signs
   out, then discard the token locally. The token itself remains valid on the
   server and will be returned again on the next login.

---
