## 1. AdminLayout Header Enhancement

- [x] 1.1 Add `Tag` import from `antd` to `AdminLayout.tsx`
- [x] 1.2 Add `<Tag color="blue">Admin</Tag>` after `<span>{user?.name}</span>` in the header avatar trigger

## 2. Dashboard — Stat Cards

- [x] 2.1 Replace current placeholder content in `dashboard-page.tsx` with 6 `useQuery` hooks fetching: products, productDetails, brands, colors, materials, sizes
- [x] 2.2 Render Row 1 (3 cols): Tổng sản phẩm, Chi tiết SP, Thương hiệu — each as a `Card` with `Statistic` and icon; show `Skeleton.Button` while loading
- [x] 2.3 Render Row 2 (3 cols): Màu sắc, Chất liệu, Size — each as a `Card` with `Statistic` and icon; show `Skeleton.Button` while loading

## 3. Dashboard — Product Status Chart

- [x] 3.1 Compute `activeCount` and `inactiveCount` from the products query result (`status === 'hoat dong'`)
- [x] 3.2 Render a `Card` "Trạng thái sản phẩm" with `Progress` type="circle" showing active percentage; subtitle shows "Không hoạt động: X sản phẩm"

## 4. Dashboard — Quick Navigation

- [x] 4.1 Render a `Card` "Truy cập nhanh" with a grid of `Button` (type="link") using `useNavigate` for: Sản phẩm, Chi tiết SP, Thương hiệu, Màu sắc, Chất liệu, Size
