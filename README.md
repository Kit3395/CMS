# CMS Backend

Implements super-user (SU) admin management routes with audit logging.

## Endpoints
- `POST /admins`
- `GET /admins`
- `PATCH /admins/{id}`
- `DELETE /admins/{id}`

All endpoints require `X-User-Role: SU`.
