## MODIFIED Requirements

### Requirement: Product edit form fetches fresh data before opening
When admin clicks "Sửa" on a product row, the form SHALL call `queryClient.fetchQuery` (with `staleTime: 0`) on the products list before populating the form fields. This ensures the form always shows the latest server data, not cached list data.

#### Scenario: Admin opens edit form for a product
- **WHEN** admin clicks the edit icon on a product row
- **THEN** the products list is re-fetched from `GET /api/admin/san-pham` before the form modal opens
- **AND** the form fields are populated with data from the fresh fetch (not cached data)

#### Scenario: Edit button shows loading while fetching
- **WHEN** the fetch is in-flight after clicking edit
- **THEN** the edit button for that specific row shows a loading spinner
- **AND** other rows' buttons remain interactive

### Requirement: Product page action column order
The product list action column SHALL show actions in order: **Xem chi tiết** (eye) → **Sửa** (edit) → **Xóa** (delete).
