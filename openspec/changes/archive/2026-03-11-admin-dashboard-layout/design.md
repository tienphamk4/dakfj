## Context

`AdminLayout` with a collapsible Ant Design `Sider` already exists and works correctly — sidebar menu, header with user avatar/dropdown, and `<Outlet>` content area are all in place.

The `DashboardPage` at `/admin` is a bare placeholder: 3 static icon+title cards with no real data, no counts, no charts.

The `AdminRoute` guard already enforces `role === 'admin'` redirect. No auth changes needed.

## Goals / Non-Goals

**Goals:**
- Replace the placeholder `DashboardPage` with a data-rich summary page using real API data
- Show 6 stat cards: total products, total product details, total brands, total colors, total materials, total sizes
- Show a Products status breakdown (active vs inactive) using `Ant Design Progress` (circle type)
- Show quick-nav action cards linking to each admin CRUD section
- Add a role badge (`<Tag>`) to the `AdminLayout` header next to the user's name

**Non-Goals:**
- No new backend endpoints — all data is fetched from existing `GET /api/admin/*` list endpoints
- No order management page (no admin order list API available)
- No real-time updates / WebSocket
- No charts library installation — use Ant Design components only (`Statistic`, `Progress`, `Tag`, `Card`)

## Decisions

### Data fetching strategy
- Use `useQuery` with `staleTime: 60_000` for all 6 stat queries — counts change infrequently
- Each query calls the existing list endpoint and counts `res.data.data.length`
- Product active/inactive split: filter `status === 'hoat dong'` vs `'khong hoat dong'` from the products list — no extra API call

### Layout structure (Dashboard)
```
Row gutter={16} — 3 cols per row (span=8 each)
  Card: Tổng sản phẩm      (Statistic + ShopOutlined)
  Card: Chi tiết SP        (Statistic + AppstoreOutlined)
  Card: Thương hiệu        (Statistic + TagOutlined)

Row gutter={16} — 3 cols per row
  Card: Màu sắc            (Statistic + BgColorsOutlined)
  Card: Chất liệu          (Statistic + FontColorsOutlined)
  Card: Size               (Statistic + ScissorOutlined)

Row gutter={16} — 2 cols
  Col span=12: Card "Trạng thái sản phẩm" — Progress circle (active%), inactive count/total
  Col span=12: Card "Truy cập nhanh" — 6 Button.Link navigating to each admin route
```

### AdminLayout header change
- Append `<Tag color="blue">Admin</Tag>` after `<span>{user?.name}</span>` in the avatar dropdown trigger — minimal, no layout shift

### Skeleton loading state
- Each stat card shows `<Skeleton.Button active />` while its query is loading — avoids layout shift

## Risks / Trade-offs

- **6 parallel queries on dashboard load**: minor — all are small list responses, `staleTime` prevents re-fetching on tab refocus
- **Counting via `.length`**: accurate as long as backend doesn't paginate these endpoints (confirmed: all admin list endpoints return full arrays, no pagination)
- **No Recharts/Chart.js added**: Progress circle is a simpler visual, keeps zero new dependencies
