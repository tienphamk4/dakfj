## ADDED Requirements

### Requirement: CatalogTable supports optional name filter
`CatalogTable` SHALL accept an optional `nameFilter?: string` prop. When provided and non-empty, the component SHALL filter the list data client-side using a case-insensitive substring match on the `name` field before rendering the table. When `nameFilter` is empty or undefined the full list SHALL be displayed.

#### Scenario: Name filter narrows the displayed rows
- **WHEN** a `nameFilter` value of `"nike"` is passed to `CatalogTable`
- **THEN** only rows whose `name` contains `"nike"` (case-insensitive) are shown in the table

#### Scenario: Empty nameFilter shows all rows
- **WHEN** `nameFilter` is `""` or `undefined`
- **THEN** all rows from the fetched data are displayed

### Requirement: All catalog pages include a FilterBox with name search
Each catalog page (Brand, Color, Material, Size) SHALL render a `FilterBox` component above the `CatalogTable`. The filter panel SHALL contain one `Input` field labeled "Tên" for name filtering. Clicking "Tìm kiếm" inside the panel SHALL apply the filter. Clicking "Đặt lại" SHALL clear the filter and restore the full list.

#### Scenario: Admin filters brands by name
- **WHEN** admin opens the filter panel on the Brand page, types `"adidas"` in the Tên field, and clicks "Tìm kiếm"
- **THEN** the brand table shows only rows where the name contains `"adidas"` (case-insensitive)

#### Scenario: Admin resets the name filter
- **WHEN** admin clicks "Đặt lại" in the filter panel
- **THEN** the Tên input is cleared and the full brand list is shown again

## MODIFIED Requirements

### Requirement: Admin can manage Brands (CRUD)
The system SHALL provide a page at `/admin/thuong-hieu` that lists all brands (`GET /api/admin/thuong-hieu`), allows creating (`POST`), updating (`PUT /{id}`), and deleting (`DELETE /{id}`) brands. All operations require role `ADMIN`. The page SHALL include a `FilterBox` above the table for name-based filtering.

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

#### Scenario: Admin filters brand list by name
- **WHEN** admin types in the name filter and clicks "Tìm kiếm"
- **THEN** only matching brands are shown in the table (client-side filter)
