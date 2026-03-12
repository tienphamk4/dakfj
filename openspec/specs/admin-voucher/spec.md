### Requirement: Admin can list vouchers

Admin accesses `/admin/vouchers` page. The page calls `GET /api/admin/vouchers` and renders a table of all vouchers.

#### Scenario: List loads successfully

- **WHEN** admin navigates to the vouchers page
- **THEN** a table is rendered with columns: id, ma, ten, loaiGiam, toiDa, trangThai, ngayBatDau, ngayKetThuc
- **AND** all vouchers from the API response are displayed

#### Scenario: loaiGiam displays as label

- **WHEN** a voucher has `loaiGiam: 0`
- **THEN** the column displays "Phần trăm (%)"
- **WHEN** a voucher has `loaiGiam: 1`
- **THEN** the column displays "Cố định (VNĐ)"

#### Scenario: trangThai displays as badge

- **WHEN** a voucher has `trangThai: 1`
- **THEN** the status column shows a green "Hoạt động" badge
- **WHEN** a voucher has `trangThai: 0`
- **THEN** the status column shows a red "Vô hiệu" badge

---

### Requirement: Admin can create a voucher

Admin clicks "Thêm mới" and fills in a modal form. On submit, calls `POST /api/admin/vouchers`.

#### Scenario: Create succeeds

- **WHEN** admin submits the form with all required fields (ma, ten, loaiGiam, toiDa, ngayBatDau, ngayKetThuc)
- **THEN** `POST /api/admin/vouchers` is called with the form data
- **AND** the modal closes and the table refreshes

#### Scenario: Date fields use date picker

- **WHEN** admin opens the create form
- **THEN** ngayBatDau and ngayKetThuc use DatePicker components
- **AND** dates are submitted as ISO 8601 strings

---

### Requirement: Admin can update a voucher

Admin clicks the edit button on a row. A modal pre-filled with voucher data appears. On submit, calls `PUT /api/admin/vouchers/{id}`.

#### Scenario: Edit modal pre-fills data

- **WHEN** admin clicks edit on a voucher row
- **THEN** the modal opens with all fields pre-filled from the voucher

#### Scenario: Update succeeds

- **WHEN** admin modifies fields and clicks save
- **THEN** `PUT /api/admin/vouchers/{id}` is called
- **AND** the table refreshes with updated data

---

### Requirement: Admin can deactivate a voucher

Admin clicks the delete/deactivate button on a row. On confirm, calls `DELETE /api/admin/vouchers/{id}` which sets `trangThai = 0` server-side (soft deactivate, not a hard delete).

#### Scenario: Deactivate with confirmation

- **WHEN** admin clicks deactivate and confirms the dialog
- **THEN** `DELETE /api/admin/vouchers/{id}` is called
- **AND** the voucher's trangThai updates to 0 in the table

#### Scenario: Deactivate is cancelled

- **WHEN** admin cancels the confirmation dialog
- **THEN** no API call is made
