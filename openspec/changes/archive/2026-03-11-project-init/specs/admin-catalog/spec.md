## ADDED Requirements

### Requirement: Admin can manage Brands (CRUD)
The system SHALL provide a page at `/admin/thuong-hieu` that lists all brands (`GET /api/admin/thuong-hieu`), allows creating (`POST`), updating (`PUT /{id}`), and deleting (`DELETE /{id}`) brands. All operations require role `ADMIN`.

#### Scenario: Brand list loads on page open
- **WHEN** admin navigates to `/admin/thuong-hieu`
- **THEN** a table shows all brands with Name and Actions columns

#### Scenario: Admin creates a new brand
- **WHEN** admin clicks "Thêm mới", fills `name`, and submits
- **THEN** `POST /api/admin/thuong-hieu` is called, modal closes, and table refreshes

#### Scenario: Admin updates a brand name
- **WHEN** admin clicks the edit action on a brand row and submits the updated name
- **THEN** `PUT /api/admin/thuong-hieu/{id}` is called and table refreshes

#### Scenario: Admin deletes a brand
- **WHEN** admin clicks delete and confirms the Popconfirm dialog
- **THEN** `DELETE /api/admin/thuong-hieu/{id}` is called and the row is removed from the table

### Requirement: Admin can manage Colors (CRUD)
The system SHALL provide identical CRUD functionality at `/admin/mau-sac` using endpoints under `/api/admin/mau-sac`.

#### Scenario: Color CRUD follows same pattern as Brand
- **WHEN** admin performs any CRUD action on colors
- **THEN** the corresponding `/api/admin/mau-sac` endpoint is called

### Requirement: Admin can manage Materials (CRUD)
The system SHALL provide identical CRUD functionality at `/admin/chat-lieu` using endpoints under `/api/admin/chat-lieu`.

#### Scenario: Material CRUD follows same pattern as Brand
- **WHEN** admin performs any CRUD action on materials
- **THEN** the corresponding `/api/admin/chat-lieu` endpoint is called

### Requirement: Admin can manage Sizes (CRUD)
The system SHALL provide identical CRUD functionality at `/admin/size` using endpoints under `/api/admin/size`.

#### Scenario: Size CRUD follows same pattern as Brand
- **WHEN** admin performs any CRUD action on sizes
- **THEN** the corresponding `/api/admin/size` endpoint is called

### Requirement: All admin catalog pages are behind AdminRoute guard
Every admin catalog page SHALL be wrapped in `<AdminRoute>` so non-admin users cannot access them.

#### Scenario: Non-admin access is blocked
- **WHEN** a user with role `'user'` navigates to `/admin/thuong-hieu`
- **THEN** they are redirected to `/`
