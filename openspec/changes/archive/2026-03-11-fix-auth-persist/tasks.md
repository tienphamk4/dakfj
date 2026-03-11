## Group 1: Fix `use-auth-store.ts`

- [x] 1.1 In `clearAuth`, add `localStorage.removeItem('user')` after the existing `localStorage.removeItem('refreshToken')` line

## Group 2: Fix `login-page.tsx`

- [x] 2.1 In `onSuccess`, after `localStorage.setItem('refreshToken', refreshToken)`, add `localStorage.setItem('user', JSON.stringify(userResponse))`

## Group 3: Fix `App.tsx` — session restore boot sequence

- [x] 3.1 Change the condition from `if (stored)` to `if (stored && storedUser)` (add `const storedUser = localStorage.getItem('user')` before the condition)
- [x] 3.2 Fix the `.then` callback: replace `setAuth(res.data.accessToken, res.data.user)` with `setAuth(res.data.data, JSON.parse(storedUser))` 
- [x] 3.3 Add an `else` branch for when `stored` exists but `storedUser` is missing: call `clearAuth()` then `setBooting(false)` to handle legacy sessions gracefully
