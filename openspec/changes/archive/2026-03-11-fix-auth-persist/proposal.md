## Why

After page refresh, the Zustand auth store resets to its initial state (unauthenticated) even though a valid `refreshToken` exists in `localStorage`. The session restore in `App.tsx` calls `setAuth(res.data.accessToken, res.data.user)`, but the `/api/refresh` response is `ApiResponse<string>` (a plain token string), so both fields resolve to `undefined` — the store is populated with `undefined` values and the user is left in a broken half-authenticated state (or fully unauthenticated if components check `user`).

## What Changes

- **`App.tsx`** — Fix refresh response unwrapping from `res.data.accessToken` → `res.data.data` (the actual token string); restore `user` from `localStorage` entry saved at login.
- **`login-page.tsx`** — Also persist `userResponse` to `localStorage` as `"user"` at login time, so it is available after refresh.
- **`use-auth-store.ts`** — Update `clearAuth` to also remove the `"user"` key from `localStorage`.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `auth`: Session restore requirement changes — `user` must be persisted to `localStorage` at login and restored during boot; refresh response must be unwrapped via `res.data.data`.

## Impact

- **Files**: `src/App.tsx`, `src/pages/login-page.tsx`, `src/store/use-auth-store.ts`
- **API**: No change — `/api/refresh` still called the same way
- **Storage**: `localStorage` gains a new `"user"` key (JSON-serialised `UserResponse`) alongside the existing `"refreshToken"` key
- **Security**: `accessToken` remains in-memory only (Zustand); no new token storage introduced
