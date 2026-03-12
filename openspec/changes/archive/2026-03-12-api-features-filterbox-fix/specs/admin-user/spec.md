## ADDED Requirements

### Requirement: Admin can list users

Admin accesses `/admin/users` page. The page calls `GET /api/admin/users` and renders a table showing all users including employees.

#### Scenario: List loads successfully

- **WHEN** admin navigates to the users page
- **THEN** a table is rendered with columns: id, name, email, role, phone, address
- **AND** all rows from the API response are displayed

#### Scenario: Table shows employee role

- **WHEN** a user has `role: "employee"` in the response
- **THEN** the table row displays "employee" in the role column

---

### Requirement: Admin can create a user

Admin clicks "Thêm mới" and fills in a modal form. On submit, calls `POST /api/admin/users`.

#### Scenario: Create succeeds

- **WHEN** admin submits the form with valid email, phone, password, name
- **THEN** `POST /api/admin/users` is called with the form data
- **AND** the modal closes and the table refreshes

#### Scenario: Role defaults to employee

- **WHEN** admin opens the create form
- **THEN** the role field defaults to `"employee"`
- **AND** admin can optionally change it to `"admin"` or `"user"`

#### Scenario: Required fields validation

- **WHEN** admin submits the form with email, phone, or password missing
- **THEN** the form shows validation errors and does not call the API

---

### Requirement: Admin can update a user

Admin clicks the edit button on a row. A modal pre-filled with the user's data appears. On submit, calls `PUT /api/admin/users/{id}`.

#### Scenario: Edit modal pre-fills data

- **WHEN** admin clicks edit on a user row
- **THEN** the modal opens with name, email, role, phone, address pre-filled

#### Scenario: Update succeeds

- **WHEN** admin modifies fields and clicks save
- **THEN** `PUT /api/admin/users/{id}` is called
- **AND** the table refreshes with updated data

---

### Requirement: Admin can soft-delete a user

Admin clicks the delete button on a row. A confirmation dialog appears. On confirm, calls `DELETE /api/admin/users/{id}` which sets `deleteFlag = true` server-side.

#### Scenario: Delete with confirmation

- **WHEN** admin clicks delete and confirms the dialog
- **THEN** `DELETE /api/admin/users/{id}` is called
- **AND** the user row disappears from the table

#### Scenario: Delete is cancelled

- **WHEN** admin clicks delete but cancels the confirmation dialog
- **THEN** no API call is made

---

### Requirement: Admin can reset a user's password

Admin clicks the "Reset mật khẩu" action on a row. On confirm, calls `PUT /api/admin/users/{id}/reset-password` which resets the password to `"123456"`.

#### Scenario: Reset password succeeds

- **WHEN** admin confirms the reset action
- **THEN** `PUT /api/admin/users/{id}/reset-password` is called
- **AND** a success notification is shown

#### Scenario: Reset password shows confirmation

- **WHEN** admin clicks "Reset mật khẩu"
- **THEN** a confirmation dialog appears before the API call is made
