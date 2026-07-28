# Reporting Mobile API

This document describes the REST-style HTTP endpoints added to the
`booking_modifier_4devnet` module for the mobile application.

## Authentication

The API uses **Odoo session authentication**. On a successful login the server
returns a `session_id`. The mobile client must send that `session_id` as a
`Cookie: session_id=...` header (or use an HTTP cookie jar) on all subsequent
requests.

All authenticated endpoints require the user to be logged in.

---

## 1. Login

**Endpoint**

```text
POST /booking/auth/login
```

**Authentication**

Public. No session required.

**Request Headers**

| Header     | Type   | Required | Description                                          |
| ---------- | ------ | -------- | ---------------------------------------------------- |
| `Username` | string | Yes      | Odoo login (e-mail or username).                     |
| `Password` | string | Yes      | Odoo password.                                       |
| `db`       | string | No       | Database name. Required only when not auto-detected. |

> **Note:** Header names are case-insensitive. The `login` header is also accepted as an alias for `Username`.

**Example Request**

```bash
curl -X POST "http://<odoo-host>/booking/auth/login" \
  -H "Username: security.user@example.com" \
  -H "Password: MyPassword"
```

**Example Success Response** (`200 OK`)

```json
{
  "status": "success",
  "session_id": "a1b2c3d4...",
  "user": {
    "id": 23,
    "name": "Security User",
    "login": "security.user@example.com",
    "email": "security.user@example.com",
    "phone": "+91 12345 67890",
    "company_id": 1,
    "company_name": "My Company",
    "is_admin": false,
    "is_security": true,
    "employee_id": 15,
    "employee_address_id": 45,
    "employee_address_name": "Main Warehouse"
  }
}
```

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

Session cookie (sent automatically when the user is logged in).

**Description**

Invalidates the current Odoo session.
The mobile client should also clear the session cookie locally.

**Example Request**

```bash
curl -X POST "http://<odoo-host>/booking/auth/logout" \
  -H "Cookie: session_id=a1b2c3d4..."
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

Session cookie from `login`.

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
  -H "Cookie: session_id=a1b2c3d4..."
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

## 4. Truck Reporting

**Endpoint**

```text
POST /booking/trucks/report
```

**Authentication**

Session cookie from `login`.

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
  -H "Cookie: session_id=a1b2c3d4..." \
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

## HTTP Status Codes

| Code | Meaning                                                            |
| ---- | ------------------------------------------------------------------ |
| 200  | Success.                                                           |
| 400  | Bad request / missing or invalid parameters / truck already reported. |
| 401  | Login failed or session is not valid.                              |
| 403  | User is not allowed to access this resource or report this truck.  |
| 500  | Unexpected server error.                                           |

---

## Mobile App Flow

1. Call `POST /booking/auth/login` to obtain a session.
2. Call `GET /booking/trucks/loaded` with the session cookie to list
   the trucks.
3. Show a **Report** button on the app when `is_reported` is `false`.
4. Call `POST /booking/trucks/report` with the selected truck line ID,
   reporting date/time, note and images.
5. Call `POST /booking/auth/logout` when the user signs out.

---
