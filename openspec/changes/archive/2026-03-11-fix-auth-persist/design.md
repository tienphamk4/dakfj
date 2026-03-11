## Context

On page reload, `AppInner` reads `localStorage.refreshToken` and calls `refreshTokenApi`. The API returns `AxiosResponse<ApiResponse<string>>` (just a new token string). The current code destructures `res.data.accessToken` and `res.data.user` — both `undefined` — and passes them to `setAuth`, leaving the store in a broken state. Additionally, the `/api/refresh` endpoint never returns user data, so even with correct unwrapping the `UserResponse` would be missing.

## Goals / Non-Goals

**Goals:**
- Fix session restore so that after F5 the user remains authenticated with correct user info
- Persist `UserResponse` to `localStorage` at login so it survives a page reload
- Correctly unwrap the `/api/refresh` response (`res.data.data` is the new token)
- Remove persisted user from `localStorage` on logout

**Non-Goals:**
- Switching to Zustand `persist` middleware (adds complexity; targeted fix is sufficient)
- Changing the backend `/api/refresh` contract
- Encrypting or obfuscating localStorage values

## Decisions

### 1. Persist `user` to `localStorage` at login
`localStorage.setItem('user', JSON.stringify(userResponse))` alongside `refreshToken`. This keeps the fix minimal — no new dependencies.

### 2. Restore user from `localStorage` in App.tsx boot sequence
```ts
const stored = localStorage.getItem('refreshToken')
const storedUser = localStorage.getItem('user')
if (stored && storedUser) {
  refreshTokenApi(stored)
    .then(res => setAuth(res.data.data, JSON.parse(storedUser)))
    .catch(() => clearAuth())
    .finally(() => setBooting(false))
}
```
If `storedUser` is missing but `refreshToken` exists (edge case for existing sessions before this fix), call `clearAuth()` and force re-login.

### 3. Fix `clearAuth` to remove `"user"` key
```ts
clearAuth: () => {
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  set({ accessToken: null, user: null, isAuthenticated: false })
}
```

## Risks / Trade-offs

- **`UserResponse` in localStorage**: User info (name, email, role) is readable by JS. This is acceptable because it contains no secrets (no tokens). Access token stays in memory only.
- **Stale user data**: If the user's role or profile changes server-side, the cached `user` in localStorage may be stale until next login. Acceptable for this app's use case.
- **Edge case — existing sessions**: Users who logged in before this fix have no `"user"` key in localStorage. The boot sequence handles this by falling through to `clearAuth()`, forcing a fresh login once.
