### Requirement: User can view own profile

Authenticated user navigates to `/profile`. The page calls `GET /api/user/profile` (userId resolved from JWT server-side) and displays the user's current information.

#### Scenario: Profile loads successfully

- **WHEN** an authenticated user navigates to the profile page
- **THEN** `GET /api/user/profile` is called
- **AND** the page displays the user's name, email, phone, address, and avatar

#### Scenario: Unauthenticated access redirected

- **WHEN** an unauthenticated user navigates to `/profile`
- **THEN** the page redirects to the login page

---

### Requirement: User can update their profile

User edits fields on the profile page and submits. Calls `PUT /api/user/profile` with only the editable fields: name, phone, address, avatar.

#### Scenario: Update succeeds

- **WHEN** user modifies name, phone, address, or avatar and submits
- **THEN** `PUT /api/user/profile` is called with the updated fields
- **AND** a success notification is shown
- **AND** the displayed data reflects the new values

#### Scenario: Email is read-only

- **WHEN** user views the profile form
- **THEN** the email field is displayed but not editable

---

### Requirement: User can change their password

User fills in current password and new password in the change-password form. Calls `PUT /api/user/change-password`.

#### Scenario: Password change succeeds

- **WHEN** user submits a correct current password and a valid new password
- **THEN** `PUT /api/user/change-password` is called
- **AND** a success notification is shown

#### Scenario: Wrong current password returns 400

- **WHEN** user submits an incorrect current password
- **THEN** the API returns 400
- **AND** an error message is displayed: "Mật khẩu hiện tại không đúng"

#### Scenario: New password confirmation must match

- **WHEN** user enters a new password and a confirmation that do not match
- **THEN** form validation prevents submission and shows an error
