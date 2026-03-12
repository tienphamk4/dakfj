## Context

Admin management pages (Brand, Color, Material, Size, Product, Product Detail) have no filtering capability. Admins must scroll through full lists to locate items. The solution is a fully reusable `FilterBox` component that collapses/expands on demand, renders arbitrary filter fields inside a responsive grid, and exposes search/reset callbacks to the host page.

Current state:
- `CatalogTable` handles Brand/Color/Material/Size — data is fetched once client-side (no search API)
- `product-page.tsx` manually renders a table with no filters
- `product-detail-page.tsx` has a search endpoint available: `GET /api/admin/product-detail/search`

## Goals / Non-Goals

**Goals:**
- Single reusable `FilterBox` component at `src/components/admin/filter-box.tsx`
- Toggle open/closed via a header button (icon + label "Tìm kiếm")
- Responsive grid layout for filter fields (up to 3 fields per row)
- "Tìm kiếm" submit button in the bottom-right of the panel
- "Đặt lại" (reset) button alongside submit
- Integrate into all 6 admin list pages
- Catalog pages use client-side name filtering (data already in memory)
- Product page uses client-side filtering by name, brand, material (data already fetched)
- Product Detail page uses server-side `GET /api/admin/product-detail/search`

**Non-Goals:**
- Server-side filtering for catalog pages (no API support)
- Pagination or sorting changes
- Saving filter state to URL or localStorage
- Date range filters (no relevant API support in current backend)

## Decisions

### Decision 1: `FilterBox` as a controlled wrapper, not a Form provider
**Chosen**: `FilterBox` is a pure layout/toggle wrapper. It accepts `children` (any React nodes — `Input`, `Select`, etc.) and `onSearch`/`onReset` callbacks. The host page owns the `Form` instance (using Ant Design `Form`) and calls `form.validateFields()` or `form.getFieldsValue()` when "Tìm kiếm" is clicked.

**Alternative**: `FilterBox` owns the `Form` — rejected because each page has different field sets and types; the host-controlled pattern is more explicit and flexible.

**Rationale**: Keeps `FilterBox` lightweight and composable. No magic field registration.

### Decision 2: Client-side filtering for catalog pages; no `CatalogTable` prop change
**Chosen**: Each catalog page wraps `FilterBox` outside of `CatalogTable` and passes a `nameFilter` string down. `CatalogTable` gains one optional `nameFilter?: string` prop; filtering is done with `Array.filter` inside `CatalogTable` on the `data` returned by `useQuery`.

**Alternative**: Extract filtering to a custom hook shared by all pages — rejected as overkill; the filter is a simple `.includes()`.

**Rationale**: Backward-compatible (prop is optional), minimal diff.

### Decision 3: Server-side filtering for Product Detail
**Chosen**: `product-detail-page.tsx` creates a `filterParams` state of type `{ name?: string; color?: string; size?: string; salePrice?: number }`. The `useQuery` key includes `filterParams`, so changing the params triggers a new fetch to `GET /api/admin/product-detail/search`. When `filterParams` is empty the page fetches `GET /api/admin/product-detail` (full list).

**Rationale**: Matches the existing backend API. React Query automatically caches by key, so navigating with the same params doesn't re-fetch.

### Decision 4: Grid layout uses Ant Design `Row`/`Col`
**Chosen**: `FilterBox` renders children inside `<Row gutter={[16, 16]}>`. Each child is expected to be wrapped in `<Col span={8}>` (3 fields per row on desktop). The host page is responsible for the `Col` wrapping — `FilterBox` only provides the outer `Row`.

**Alternative**: `FilterBox` clones children and injects `Col` automatically — rejected because it would leak layout concerns into the component API and breaks with React node types that aren't form items.

**Rationale**: Explicit is better than implicit. Each page can vary column spans if needed.

### Decision 5: Toggle state is local to `FilterBox` via `useState`
Default `open` is `false` (collapsed). Toggle is managed inside `FilterBox` with `useState`. Host pages do not need to manage the open state unless they choose to via an optional `defaultOpen` prop.

## Risks / Trade-offs

- [Risk] Client-side filter on large catalog lists may slow rendering → Mitigation: catalogs (brands/colors/materials/sizes) are small datasets; no pagination needed
- [Risk] `filterParams` state and `Form` instance become coupled in product-detail-page → Mitigation: keep `onSearch` handler co-located with the page; pass `form.getFieldsValue()` result directly to state setter

## Migration Plan

1. Create `FilterBox` component (no side effects)
2. Add optional `nameFilter` to `CatalogTable` props (backward-compatible)
3. Update each catalog page to render `FilterBox` above `CatalogTable`
4. Update `product-page.tsx` to use `FilterBox` with client-side filtering
5. Update `product-detail-page.tsx` to use `FilterBox` wired to the search endpoint

All changes are additive. No existing behavior is removed. Rollback: revert the affected files.

## Open Questions

- None — all design decisions can be made with current information.
