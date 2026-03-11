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
