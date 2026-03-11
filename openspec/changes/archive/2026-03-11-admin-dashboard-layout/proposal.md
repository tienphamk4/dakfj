## Why

The admin panel already has a sidebar layout (`AdminLayout`) and all CRUD pages, but the Dashboard (`/admin`) is a bare placeholder with 3 static icons and no real data. Admins have no at-a-glance visibility into store health (product counts, catalog sizes), and the header shows no user context beyond a name. The reference layout (SB Admin 2) shows the expected level of polish.

## What Changes

- Replace the placeholder `DashboardPage` with a data-driven page: stat cards (total products, total product details, total brands, total catalog items), a product-status donut chart, and quick-link action cards to each admin section.
- Enhance the `AdminLayout` header: show the logged-in user's role badge alongside their name; add a welcome greeting.
- Role guard is already implemented (`AdminRoute` + `PrivateRoute`) — no change needed.

## Capabilities

### New Capabilities
- `admin-dashboard`: Dashboard page with stat cards fetched from existing admin APIs, a products-by-status donut chart (Ant Design's built-in `Progress`/`Statistic`), and quick-nav cards to all admin sections.

### Modified Capabilities
- `admin-layout`: Header gains role badge (`<Tag color="blue">Admin</Tag>`) next to the user's name for visual role confirmation.

## Impact

- **Files changed**: `src/pages/admin/dashboard-page.tsx`, `src/layouts/AdminLayout.tsx`
- **APIs used** (all existing, Admin-only):
  - `GET /api/admin/san-pham` — product list → count + active/inactive split
  - `GET /api/admin/product-detail` — product detail list → count
  - `GET /api/admin/thuong-hieu` — brand list → count
  - `GET /api/admin/mau-sac` — color list → count
  - `GET /api/admin/chat-lieu` — material list → count
  - `GET /api/admin/size` — size list → count
- **No new backend endpoints required**
- **No new dependencies** — uses Ant Design `Statistic`, `Progress`, `Tag`, `Card`, `Row`, `Col` already in the project
- **Role-based access**: all dashboard data endpoints require role `ADMIN` (enforced by `AdminRoute` guard + backend)
