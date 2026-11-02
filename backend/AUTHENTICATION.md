# Lorvens Authentication API Documentation (Security Enhancement Phase)

## 1. Authentication Architecture

The Lorvens authentication subsystem provides a hardened, passwordless, admin-only authentication backend built with FastAPI, PostgreSQL, SQLAlchemy 2.0 ORM, Alembic migrations, PyJWT, and asynchronous SMTP delivery (`aiosmtplib`).

### Core Design Principles

1. **Passwordless, Admin-Only Access**:
   - There is no public user registration and no password authentication.
   - The backend bootstraps an administrator account using the `ADMIN_EMAIL` configured in `.env`.
   - All authentication flows authenticate against the authorized administrator email only.

2. **Defense-in-Depth Cryptography**:
   - OTP codes are 6-digit numeric sequences generated using Python's cryptographically secure pseudo-random number generator (`secrets.randbelow(10)`).
   - OTPs are never stored in plaintext. They are hashed using `HMAC-SHA256` keyed with `JWT_SECRET_KEY` and verified with constant-time equality comparisons (`hmac.compare_digest`) to prevent timing side-channel attacks.
   - Access tokens are signed JWTs containing unique identifiers (`jti`), subject (`sub`), issued-at (`iat`), expiration (`exp`), and explicit token type verification (`type="access"`).

3. **Concurrency-Safe State Management**:
   - Critical operations (`send-otp`, `verify-otp`) utilize PostgreSQL row-level exclusive locks (`SELECT ... FOR UPDATE`) on the administrator account.
   - Concurrent requests are serialized, preventing race conditions, dual-active OTP generation, and cooldown/rate limit bypassing.

4. **Revocable JWT Architecture**:
   - Rather than storing raw JWT access tokens in the database, the system stores only the unique token identifier (`jti`) upon logout in the `revoked_tokens` table.
   - Every protected request checks the token `jti` against revoked records before granting access.
   - Already expired tokens do not create unnecessary database records upon logout.
   - Automatic cleanup utilities purge expired revocation records to minimize database storage overhead.

---

## 2. OTP Login Workflow

```
Administrator                   FastAPI Backend               PostgreSQL DB               SMTP Server
      |                               |                             |                          |
      | 1. POST /auth/send-otp        |                             |                          |
      |------------------------------>|                             |                          |
      |                               | 2. Lock admin row           |                          |
      |                               |---------------------------->|                          |
      |                               | 3. Check cooldown & hourly  |                          |
      |                               | 4. Invalidate previous OTPs |                          |
      |                               | 5. Persist hashed OTP       |                          |
      |                               |<----------------------------|                          |
      |                               | 6. Send OTP email (async)   |                          |
      |                               |------------------------------------------------------->|
      | 7. 200 OTP Sent               |                             |                          |
      |<------------------------------|                             |                          |
      |                               |                             |                          |
      | 8. POST /auth/verify-otp      |                             |                          |
      |------------------------------>|                             |                          |
      |                               | 9. Lock admin row & OTP     |                          |
      |                               |---------------------------->|                          |
      |                               | 10. Check expiry & attempts |                          |
      |                               | 11. Compare HMAC hash       |                          |
      |                               | 12. Mark OTP consumed       |                          |
      |                               |<----------------------------|                          |
      |                               | 13. Issue JWT with jti      |                          |
      | 14. 200 TokenResponse         |                             |                          |
      |<------------------------------|                             |                          |
```

### Steps in Detail:
1. **Request Dispatch**:
   - Client sends `{"email": "<admin_email>"}` to `/api/v1/auth/send-otp`.
   - The endpoint performs constant-time validation (`hmac.compare_digest`) against the configured `ADMIN_EMAIL`.
   - Non-matching or unauthorized emails are immediately rejected with `403 Forbidden`.
2. **Rate Limit & Invalidation**:
   - An exclusive row lock (`with_for_update()`) is acquired on the admin user row.
   - Cooldown limit (default 60 seconds) and hourly request limit (default 5 requests/hour) are checked atomically.
   - Any previously unconsumed active OTPs for the user are immediately marked consumed (`consumed_at = now`).
3. **Creation & SMTP Dispatch**:
   - A new cryptographically secure 6-digit OTP is generated.
   - The OTP hash is stored in `email_otps` with an expiration timestamp (`OTP_EXPIRE_MINUTES`).
   - The OTP is emailed via SMTP. If delivery fails, the OTP record is consumed immediately and `503 Service Unavailable` is returned.
4. **Verification**:
   - Client sends `{"email": "<admin_email>", "otp": "123456"}` to `/api/v1/auth/verify-otp`.
   - The backend locks the user and active OTP record.
   - If the OTP is expired, `consumed_at` is updated and `400 Bad Request` ("OTP has expired.") is returned.
   - If attempts exceed `OTP_MAX_ATTEMPTS` (5), the OTP is consumed and `400 Bad Request` ("Maximum OTP verification attempts exceeded.") is returned.
   - If the code is incorrect, `attempts` is incremented, the transaction commits, and `400 Bad Request` ("Invalid OTP.") is returned.
   - Upon successful verification, `consumed_at` is set to `now` (single-use guarantee), and a signed JWT access token containing a unique `jti` is issued.

---

## 3. JWT Security & Token Revocation Workflow

### JWT Payload Structure
Every generated access token contains the following claims:
```json
{
  "sub": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "iat": 1730538000,
  "exp": 1730539800,
  "jti": "e67a0cf7-5e92-4f01-9f9b-640a233b8214",
  "type": "access"
}
```

### Token Validation Pipeline (`get_current_user_and_token`)
Whenever a request is sent to a protected endpoint:
1. **Bearer Header Extraction**: Validates `Authorization: Bearer <token>`. Returns `401 Unauthorized` ("Authentication required.") if missing.
2. **Signature & Expiration Check**:
   - Validates secret key and algorithm (`HS256`).
   - Validates required claims: `["sub", "exp", "iat", "jti"]`.
   - If expired, returns `401 Unauthorized` ("Access token has expired.").
   - If invalid format, tampered signature, or missing claims, returns `401 Unauthorized` ("Invalid access token.").
3. **Token Type Check**:
   - Ensures `payload.get("type") == "access"`. Invalid types return `401 Unauthorized` ("Invalid access token.").
4. **Revocation Check**:
   - Queries `revoked_tokens` table for the token's `jti`.
   - If present, returns `401 Unauthorized` ("Token has been revoked.").
5. **Admin Account Status Check**:
   - Looks up admin user in PostgreSQL.
   - If inactive, returns `403 Forbidden` ("Admin account is inactive.").
   - If not admin or email unverified, returns `403 Forbidden` ("Admin access required.").

### Logout & Revocation Endpoint (`POST /api/v1/auth/logout`)
- Requires a valid Bearer token for an active admin.
- Extracts `jti` and expiration (`exp`) from decoded claims.
- If the token is already expired naturally, no record is added (saving storage).
- Otherwise, inserts `RevokedToken(jti, user_id, expires_at)` into PostgreSQL.
- Returns `{"message": "Logged out successfully."}`.
- Subsequent calls with the revoked token are immediately rejected.

---

## 4. API Endpoints Reference

### 1. Request Admin Login OTP
- **Method / Path**: `POST /api/v1/auth/send-otp`
- **Authentication**: None (Public endpoint with strict admin email restriction)
- **Request Body**:
  ```json
  {
    "email": "admin@lorvens.com"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "OTP sent successfully to the authorized admin email."
    }
    ```
  - `403 Forbidden`: Email unauthorized or admin inactive.
  - `429 Too Many Requests`: Cooldown active or hourly request limit exceeded.
  - `503 Service Unavailable`: SMTP provider failure.

### 2. Verify Admin OTP & Login
- **Method / Path**: `POST /api/v1/auth/verify-otp`
- **Authentication**: None
- **Request Body**:
  ```json
  {
    "email": "admin@lorvens.com",
    "otp": "123456"
  }
  ```
- **Responses**:
  - `200 OK`:
    ```json
    {
      "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
      "token_type": "bearer",
      "expires_in": 1800
    }
    ```
  - `400 Bad Request`:
    - `"Invalid OTP."`
    - `"OTP has expired."`
    - `"Maximum OTP verification attempts exceeded."`
    - `"Invalid or expired OTP."`
  - `403 Forbidden`: Unauthorized email or inactive admin.

### 3. Admin Logout (Token Revocation)
- **Method / Path**: `POST /api/v1/auth/logout`
- **Authentication**: `Bearer <admin_jwt>`
- **Request Headers**:
  `Authorization: Bearer <access_token>`
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Logged out successfully."
    }
    ```
  - `401 Unauthorized`: Missing, expired, invalid, or already-revoked token.
  - `403 Forbidden`: Inactive admin.

### 4. Admin Dashboard (Protected Route)
- **Method / Path**: `GET /api/v1/admin/dashboard`
- **Authentication**: `Bearer <admin_jwt>`
- **Dependency**: `Depends(get_admin_user)`
- **Responses**:
  - `200 OK`:
    ```json
    {
      "message": "Welcome to Lorvens Admin Dashboard",
      "admin_email": "admin@lorvens.com",
      "role": "admin"
    }
    ```
  - `401 Unauthorized`: Missing, expired, invalid, or revoked token.
  - `403 Forbidden`: Inactive admin or non-admin user.

---

## 5. Configuration & Environment Variables

All settings are configured via `backend/.env`:

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | string | `Lorvens API` | Application title |
| `DATABASE_URL` | string | *Required* | PostgreSQL connection string (`postgresql+psycopg://...`) |
| `ADMIN_EMAIL` | string | *Required* | The sole authorized administrator email address |
| `JWT_SECRET_KEY` | string | *Required* | Cryptographic secret for signing JWTs and hashing OTPs |
| `JWT_ALGORITHM` | string | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | int | `30` | JWT access token validity duration |
| `OTP_LENGTH` | int | `6` | Length of numeric OTP code |
| `OTP_EXPIRE_MINUTES` | int | `5` | Minutes until an OTP expires |
| `OTP_MAX_ATTEMPTS` | int | `5` | Maximum failed verification attempts before invalidation |
| `OTP_RESEND_COOLDOWN_SECONDS` | int | `60` | Cooldown period between OTP requests |
| `OTP_MAX_REQUESTS_PER_HOUR` | int | `5` | Maximum OTP requests allowed per hour |
| `SMTP_HOST` | string | `smtp.gmail.com` | SMTP server hostname |
| `SMTP_PORT` | int | `587` | SMTP server port |
| `SMTP_USERNAME` | string | `""` | SMTP authentication username |
| `SMTP_PASSWORD` | string | `""` | SMTP authentication app password |
| `SMTP_FROM_EMAIL` | string | `""` | Outgoing sender email address |
| `SMTP_USE_TLS` | bool | `true` | Enable STARTTLS for SMTP connections |

---

## 6. Error Responses Reference

| Status Code | Detail Message | Cause |
| :--- | :--- | :--- |
| **400 Bad Request** | `"Invalid OTP."` | Incorrect 6-digit code entered |
| **400 Bad Request** | `"OTP has expired."` | OTP lifetime exceeded `OTP_EXPIRE_MINUTES` |
| **400 Bad Request** | `"Maximum OTP verification attempts exceeded."` | 5 failed attempts reached; OTP invalidated |
| **400 Bad Request** | `"Invalid or expired OTP."` | OTP already consumed, invalidated, or not found |
| **401 Unauthorized** | `"Authentication required."` | Missing `Authorization` header |
| **401 Unauthorized** | `"Access token has expired."` | Token timestamp exceeds `exp` |
| **401 Unauthorized** | `"Token has been revoked."` | Token `jti` is listed in `revoked_tokens` table |
| **401 Unauthorized** | `"Invalid access token."` | Tampered signature, malformed token, or wrong type |
| **401 Unauthorized** | `"User not found."` | Subject in token does not match any database user |
| **403 Forbidden** | `"This email is not authorized for admin access."` | Attempted login with non-admin email |
| **403 Forbidden** | `"Admin account is inactive."` | Admin user has `is_active=False` in DB |
| **403 Forbidden** | `"Admin access required."` | User is not admin or email unverified |
| **422 Unprocessable** | Pydantic validation errors | Invalid email format or non-6-digit OTP |
| **429 Too Many Requests**| `"Please wait X seconds before requesting another OTP."` | Resend cooldown violated |
| **429 Too Many Requests**| `"OTP request limit reached. Try again after one hour."` | More than 5 requests in last 60 minutes |
| **503 Unavailable** | `"Unable to send OTP. Please try again later."` | SMTP delivery error / socket timeout |
