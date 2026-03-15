## Implemented: Revoke Refresh Token on Logout

Date: 2026-03-15

### What was added

- Backend logout service now revokes the specific refresh token used by the client.
- Backend auth routes now expose `POST /api/auth/logout`.
- Frontend logout now calls backend logout with the stored refresh token before local token cleanup.

### Exact code behavior

1. Frontend reads `refreshToken` from storage.
2. Frontend sends `POST /auth/logout` with `{ refreshToken }`.
3. Backend runs:

```ts
await prisma.refresh_tokens.updateMany({
  where: { token: refreshToken, revoked: false },
  data: { revoked: true },
});
```

4. Frontend always clears `accessToken`, `refreshToken`, and `user` from local storage in `finally`.

### Files changed

- `backend/src/services/auth/auth.service.ts`
  - Added `logoutUser(refreshToken: string)`
- `backend/src/controllers/auth/auth.controller.ts`
  - Imported `logoutUser`
  - Added `logout` controller
- `backend/src/routes/auth/auth.routes.ts`
  - Added `POST /logout` route using `refreshTokenSchema`
- `frontend/src/api/services/auth.service.ts`
  - Updated `logout()` to call backend revoke endpoint before local cleanup

### Result

- A logged-out refresh token is now marked `revoked = true` and should be rejected by `/api/auth/refresh` because refresh already checks:
  - token exists
  - `revoked` is false
  - token is not expired

