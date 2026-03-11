## MODIFIED Requirements

### Requirement: Login page saves user and refreshToken to localStorage
Login page SHALL save both the `refreshToken` and the `userResponse` (JSON-serialised) to `localStorage` after successful login, so both are available for session restore on page reload.

#### Scenario: Login persists both tokens and user
- **WHEN** login is successful
- **THEN** `localStorage.setItem('refreshToken', refreshToken)` is called with the token from the response
- **THEN** `localStorage.setItem('user', JSON.stringify(userResponse))` is called with the user object from the response

### Requirement: App restores auth session on page reload
At app startup, if `localStorage.refreshToken` AND `localStorage.user` exist, the system SHALL call `POST /api/refresh` to obtain a new `accessToken` (unwrapped from `res.data.data`), then call `setAuth(newToken, parsedUser)` to restore the authenticated state. If either key is missing, or if the refresh call fails, the session SHALL be cleared and the user SHALL see the unauthenticated state.

#### Scenario: Session persists after reload
- **WHEN** user reloads the page while logged in (both `refreshToken` and `user` in localStorage)
- **THEN** app calls `/api/refresh`, receives new token from `res.data.data`, calls `setAuth(token, JSON.parse(localStorage.getItem('user')))`, and user sees authenticated content without re-logging in

#### Scenario: Missing user key forces re-login
- **WHEN** `localStorage.refreshToken` exists but `localStorage.user` is absent (legacy session or cleared entry)
- **THEN** `clearAuth()` is called and user is presented with the unauthenticated state

#### Scenario: Stale refresh token is handled gracefully
- **WHEN** stored refreshToken is expired and `/api/refresh` call fails
- **THEN** `clearAuth()` is called, `localStorage.refreshToken` and `localStorage.user` are both removed, and user is redirected to `/login`

### Requirement: Logout clears both localStorage keys
The `clearAuth` action in `useAuthStore` SHALL remove both `"refreshToken"` and `"user"` from `localStorage` when called, in addition to resetting Zustand state.

#### Scenario: Successful logout clears all persisted auth data
- **WHEN** user clicks logout or the interceptor calls `clearAuth()` after a failed refresh
- **THEN** `localStorage.removeItem('refreshToken')` is called
- **THEN** `localStorage.removeItem('user')` is called
- **THEN** Zustand auth state is reset to `{ accessToken: null, user: null, isAuthenticated: false }`
