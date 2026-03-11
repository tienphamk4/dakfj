## MODIFIED Requirements

### Requirement: CatalogTable edit form fetches fresh data before opening
When admin clicks "Sửa" on a catalog item row (thuong-hieu, mau-sac, chat-lieu, size), `CatalogTable` SHALL call `queryClient.fetchQuery` (with `staleTime: 0`) before populating the edit form. The `fetchFn` prop already provided to `CatalogTable` will be used for this fetch.

#### Scenario: Admin opens edit form for a catalog item
- **WHEN** admin clicks the edit icon on any row in a CatalogTable
- **THEN** the list is re-fetched (ignoring cache) before the modal opens
- **AND** the form is populated from the fresh response

#### Scenario: Edit button shows loading while fetching
- **WHEN** the fetch is in-flight
- **THEN** only the edit button on that specific row shows loading
- **AND** other buttons (add, other rows) remain interactive

### Requirement: CatalogTable action column order
The CatalogTable action column SHALL show: **Xem chi tiết** (eye) → **Sửa** (edit) → **Xóa** (delete).
