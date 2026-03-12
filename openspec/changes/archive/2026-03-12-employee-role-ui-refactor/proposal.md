## Why

Employee-role users currently share the Admin layout and see admin-only menu items they should not access. Additionally, all tables show raw UUID IDs (unreadable), action buttons are inconsistent (some icon-only, some text), and React Query's 5-minute global staleTime causes stale data to be displayed when the backend is already the source of truth for caching.

## What Changes

- **Add dedicated `EmployeeLayout` and `EmployeeRoute`**: employees see only "Bán tại quầy" and "Đơn hàng" (view-only); no admin menu items
- **Remove "Nhân viên" group from `AdminLayout` sidebar**: admin and employee roles navigate separately
- **Disable React Query client-side cache globally**: set `staleTime: 0` and `gcTime: 0` so every page visit triggers a fresh API call
- **Replace ID columns with STT (số thứ tự)**: all tables replace the UUID ID column with a sequential row number (1, 2, 3…)
- **Standardize action column buttons to icon-only**: every table's action column uses icon-only `Button` components (`EditOutlined`, `DeleteOutlined`, `KeyOutlined`, `StopOutlined`) — no text labels

## Capabilities

### New Capabilities
- `employee-layout`: Dedicated layout and route guard for `role=employee` users, with sidebar showing only POS and orders pages

### Modified Capabilities
- `admin-layout`: Remove "Nhân viên" submenu group from sidebar
- `ui-standards`: Replace ID columns with STT; standardize all action buttons to icon-only; disable React Query stale cache globally

## Impact

- **Files modified**: `src/App.tsx` (QueryClient config), `src/layouts/AdminLayout.tsx`, `src/routes/index.tsx`
- **Files created**: `src/layouts/EmployeeLayout.tsx`, `src/routes/EmployeeRoute.tsx`
- **Pages modified**: all admin/employee/user pages that have tables — ID column replaced, action buttons standardized
- **Affected pages**: `catalog-table.tsx`, `user-page.tsx`, `voucher-page.tsx`, `product-page.tsx`, `product-detail-page.tsx`, `employee/orders-page.tsx`, `user/orders-page.tsx`
- **APIs affected**: none; same endpoints, just no FE caching
- **Access control**: `EmployeeRoute` guards `role=employee`; `AdminRoute` remains for `role=admin` only
