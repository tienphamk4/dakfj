## Why

Admin management pages (Brand, Color, Material, Size, Product, Product Detail) currently have no filtering or search functionality — admins must scroll through entire lists to find items. A reusable, toggleable `FilterBox` component will allow each page to expose relevant filters without cluttering the UI when filters are not needed.

## What Changes

- Introduce a new reusable `FilterBox` component (`components/admin/filter-box.tsx`) that toggles open/closed via a "Tìm kiếm" button
- The component accepts a generic set of filter field children (inputs, selects, date pickers) and renders them in a responsive grid layout
- Add a "Tìm kiếm" (search/submit) button inside the box to trigger the filter action
- Integrate `FilterBox` into `CatalogTable` (for Brand, Color, Material, Size pages) with a name text filter
- Integrate `FilterBox` into `product-page.tsx` with name, brand, and material text/select filters
- Integrate `FilterBox` into `product-detail-page.tsx` with name, color, size, and price range filters (maps to `GET /api/admin/product-detail/search`)

## Capabilities

### New Capabilities
- `admin-filter-box`: Reusable toggleable filter panel component for admin management pages; renders filter fields in a responsive grid, collapses/expands on button click, and exposes an `onSearch` / `onReset` callback

### Modified Capabilities
- `admin-catalog`: `CatalogTable` gains optional `filterFields` prop and name-filter support (client-side filtering on the already-fetched list)
- `admin-product`: Product page gains server-aware filter fields (brand, material, name) rendered inside `FilterBox`
- `admin-detail-view`: Product Detail page gains filter fields (name, color, size, salePrice) that map to `GET /api/admin/product-detail/search` query params

## Impact

- **New file**: `src/components/admin/filter-box.tsx`
- **Modified**: `src/components/admin/catalog-table.tsx` — optional name filter prop
- **Modified**: `src/pages/admin/product-page.tsx` — FilterBox with brand/material selects
- **Modified**: `src/pages/admin/product-detail-page.tsx` — FilterBox wired to search endpoint
- **APIs used**:
  - `GET /api/admin/product-detail/search` (Admin) — query: `name`, `color` (UUID), `size` (UUID), `salePrice`
  - All catalog GET endpoints already return full lists; client-side filtering is used for Brand/Color/Material/Size
- **Dependencies**: Ant Design (already present), React Query (already present)
- No breaking changes; `filterFields` prop is optional and backward-compatible
