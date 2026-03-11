## ADDED Requirements

### Requirement: User can log in with email and password
The system SHALL submit `POST /api/login` with `{ email, password }` and on success store `accessToken` in Zustand `useAuthStore` (in-memory) and `refreshToken` in `localStorage`, then redirect to the homepage.

#### Scenario: Successful login
- **WHEN** user submits valid email and password
- **THEN** `accessToken` is stored in Zustand, `refreshToken` in localStorage, and user is redirected to `/`

#### Scenario: Login failure shows error message
- **WHEN** credentials are incorrect and backend returns 4xx
- **THEN** an Ant Design `message.error` notification is displayed and the user stays on the login page

#### Scenario: Admin user is redirected to admin panel
- **WHEN** user logs in and `userResponse.role === 'admin'`
- **THEN** user is redirected to `/admin` instead of `/`

### Requirement: User can register a new account
The system SHALL submit `POST /api/register` with `{ name, email, password, phone, address }`, validated by Ant Design Form rules before submission.

#### Scenario: Successful registration
- **WHEN** user fills all required fields and submits
- **THEN** account is created and user is redirected to the login page

#### Scenario: Form validation prevents bad data
- **WHEN** email field contains an invalid format
- **THEN** Ant Design Form shows inline validation error and prevents submission

### Requirement: Access token is auto-refreshed on 401
The Axios response interceptor SHALL intercept 401 responses, call `POST /api/refresh` with the stored `refreshToken`, update the `accessToken` in Zustand, and retry the original failed request. If refresh fails, the user SHALL be logged out.

#### Scenario: Transparent token refresh
- **WHEN** an API call returns 401 and refreshToken is valid
- **THEN** the interceptor refreshes the token and retries the request without user intervention

#### Scenario: Logout on refresh failure
- **WHEN** `POST /api/refresh` returns an error
- **THEN** tokens are cleared, user is redirected to `/login`

#### Scenario: Concurrent 401 requests do not trigger multiple refreshes
- **WHEN** multiple requests return 401 simultaneously
- **THEN** only one refresh call is made; all pending requests are queued and retried after the single refresh

### Requirement: User can log out
The system SHALL call `GET /api/logout` with `{ refreshToken }` in the request body, clear `accessToken` from Zustand and `refreshToken` from localStorage, and redirect to `/login`.

#### Scenario: Successful logout clears session
- **WHEN** user clicks logout
- **THEN** auth state is cleared and user is redirected to `/login`

### Requirement: App restores auth session on page reload
At app startup, if `localStorage.refreshToken` exists, the system SHALL call `POST /api/refresh` to obtain a new `accessToken` and populate Zustand auth state before rendering protected routes.

#### Scenario: Session persists after reload
- **WHEN** user reloads the page while logged in
- **THEN** app silently refreshes the token and user sees authenticated content without re-logging in

#### Scenario: Stale refresh token is handled gracefully
- **WHEN** stored refreshToken is expired and refresh call fails
- **THEN** localStorage is cleared and user is redirected to `/login`

### Requirement: Protected routes redirect unauthenticated users
The `<PrivateRoute>` component SHALL check `isAuthenticated` from Zustand. If false, it SHALL redirect to `/login` with the original path preserved in `state`.

#### Scenario: Unauthenticated access to cart page
- **WHEN** unauthenticated user navigates to `/cart`
- **THEN** they are redirected to `/login`

### Requirement: Admin routes are restricted by role
The `<AdminRoute>` component SHALL additionally check `user.role === 'admin'`. If user is authenticated but not admin, they SHALL be redirected to `/`.

#### Scenario: Non-admin access to admin page
- **WHEN** authenticated user with role `'user'` navigates to `/admin/san-pham`
- **THEN** they are redirected to the homepage `/`

## MODIFIED Requirements

### Requirement: Login page calls loginApi correctly
Login page SHALL call `loginApi(values)` passing the entire `{email, password}` object, NOT individual arguments.

#### Scenario: User submits login form
- **WHEN** user fills email and password and clicks login
- **THEN** `loginApi` is called with a single object `{ email: string, password: string }`

### Requirement: Login page destructures response correctly
Login page SHALL destructure the login response following `AxiosResponse<ApiResponse<LoginResponse>>` chain: `res.data.data` to access `LoginResponse`, then use `userResponse` field (not `user`).

#### Scenario: Login success response handling
- **WHEN** loginApi returns successfully
- **THEN** page accesses `res.data.data.accessToken`, `res.data.data.refreshToken`, and `res.data.data.userResponse`

### Requirement: Login page saves refreshToken to localStorage
Login page SHALL save the `refreshToken` from the login response to `localStorage` so the Axios interceptor can use it for auto-refresh on 401.

#### Scenario: RefreshToken persistence after login
- **WHEN** login is successful
- **THEN** `localStorage.setItem('refreshToken', refreshToken)` is called with the token from the response

### Requirement: Register page calls registerApi correctly
Register page SHALL call `registerApi(values)` passing the entire form object, NOT individual arguments.

#### Scenario: User submits registration form
- **WHEN** user fills all fields and clicks register
- **THEN** `registerApi` is called with a single object `{ name, email, password, phone, address }`


## MODIFIED Requirements

### Requirement: Login page calls loginApi correctly
Login page SHALL call `loginApi(values)` passing the entire `{email, password}` object, NOT individual arguments.

#### Scenario: User submits login form
- **WHEN** user fills email and password and clicks login
- **THEN** `loginApi` is called with a single object `{ email: string, password: string }`

### Requirement: Login page destructures response correctly
Login page SHALL destructure the login response following `AxiosResponse<ApiResponse<LoginResponse>>` chain: `res.data.data` to access `LoginResponse`, then use `userResponse` field (not `user`).

#### Scenario: Login success response handling
- **WHEN** loginApi returns successfully
- **THEN** page accesses `res.data.data.accessToken`, `res.data.data.refreshToken`, and `res.data.data.userResponse`

### Requirement: Login page saves refreshToken to localStorage
Login page SHALL save the `refreshToken` from the login response to `localStorage` so the Axios interceptor can use it for auto-refresh on 401.

#### Scenario: RefreshToken persistence after login
- **WHEN** login is successful
- **THEN** `localStorage.setItem('refreshToken', refreshToken)` is called with the token from the response

### Requirement: Register page calls registerApi correctly
Register page SHALL call `registerApi(values)` passing the entire form object, NOT individual arguments.

#### Scenario: User submits registration form
- **WHEN** user fills all fields and clicks register
- **THEN** `registerApi` is called with a single object `{ name, email, password, phone, address }`

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
