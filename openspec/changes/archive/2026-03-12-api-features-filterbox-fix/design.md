## Context

Five new backend API sets are now available (Admin Users, Vouchers, User Profile/Orders, Employee POS) with no corresponding frontend pages. The existing `FilterBox` component also has a UX deficiency: `Form.Item` renders label inline (left of input) by default in Ant Design, but the intended design requires vertical stacking (label above input). Additionally, the current max of 3 inputs per row (`Col span={8}`) needs to change to 4 (`Col span={6}`).

Current state:
- No admin user management UI
- No voucher UI
- No user profile/order history UI  
- No employee in-store sales UI
- `FilterBox` wraps children in `<Row gutter={[16,16]}>` but doesn't enforce vertical label layout — each host page passes `<Col span={8}>` (3 cols)

## Goals / Non-Goals

**Goals:**
- Add 5 new page-level features mapped to the new backend endpoints
- Fix `FilterBox` label layout to vertical (Ant Design `Form.Item` with no `layout` override — set layout at the containing `Form` level to `"vertical"`)
- Update all existing FilterBox usages to `Col span={6}` (4 per row)
- New TypeScript types for all new API response shapes
- Service functions for all new endpoints
- Route registration for all new pages

**Non-Goals:**
- Pagination or server-side sorting for any new list
- Role/permission UI management (roles are string literals, no role editor)
- VNPay integration for employee POS (cash only per API spec)
- Dashboard analytics/charts
- Real-time updates (no WebSocket)

## Decisions

### Decision 1: Vertical label layout via `Form layout="vertical"` on the wrapping Form
**Chosen**: Each page that uses `FilterBox` wraps it in `<Form layout="vertical" form={...}>`. This makes all `Form.Item` labels render above their inputs automatically — no changes needed inside `FilterBox` itself.

**Alternative**: Pass a `labelCol`/`wrapperCol` to each `Form.Item` — rejected, too verbose and easy to miss.

**Rationale**: Ant Design's `Form layout="vertical"` is the canonical way. One prop change per page.

### Decision 2: Max 4 inputs per row via `Col span={6}`
**Chosen**: All host pages pass children wrapped in `<Col span={6}>` (4 per row on a 24-column grid). The `FilterBox` component itself stays unchanged — layout is host-controlled per Decision 4 from the previous change.

**Impact**: Update brand/color/material/size pages (currently `span={8}` → `span={6}`), product page (3 fields → keep existing 3 as `span={6}`), product-detail page (4 fields already at `span={6}` ✅).

### Decision 3: New pages follow existing page patterns (no shared layout abstraction)
**Chosen**: Each new page (`user-page.tsx`, `voucher-page.tsx`, etc.) is a self-contained component following the same pattern as `product-page.tsx` — `useQuery` for list, `useMutation` for CRUD, Ant Design `Modal` + `Form` for create/edit, `Popconfirm` for delete.

**Alternative**: Extract a generic CRUD page HOC — rejected, adds abstraction complexity to pages with different field sets.

### Decision 4: VoucherResponse uses Vietnamese field names as-is
**Chosen**: The `VoucherResponse` type mirrors the backend field names exactly (`ma`, `ten`, `loaiGiam`, `toiDa`, `trangThai`, `ngayBatDau`, `ngayKetThuc`). No field renaming or transformation on the frontend.

**Rationale**: Avoids a mapping layer; consistent with how `ProductResponse` already uses `marterial` (backend typo preserved).

### Decision 5: Employee route guard — reuse `AdminRoute` or add `EmployeeRoute`
**Chosen**: Reuse `AdminRoute` for employee pages for now, since the backend security allows `ROLE_employee OR ROLE_admin` for `/api/employee/**`. Add a comment noting this should be a dedicated `EmployeeRoute` if role separation matters later.

**Rationale**: No `employee` role currently exists in the frontend `UserResponse` type. Extending to support it later is additive.

### Decision 6: OrderResponse extended type with full fields
**Chosen**: Create `OrderDetailResponse` extending existing `OrderResponse` to include `userResponse`, `productDetailResponses`, `shippingFee`, `type`, and `status` as `number` (not `PaymentStatus`) since the employee/user order status domain is `0–3, -1` (broader than the 3-value PaymentStatus).

### Decision 7: New services in dedicated files
**Chosen**:
- `src/services/user.service.ts` — admin user CRUD + profile endpoints
- `src/services/voucher.service.ts` — voucher CRUD
- `src/services/employee.service.ts` — employee order endpoints

**Rationale**: Keeps service files focused. Auth service already exists separately.

## Risks / Trade-offs

- [Risk] `role` field on `UserResponse` currently typed as `'admin' | 'user'` but admin users API returns `role: "employee"` → Mitigation: Widen type to `string` or add `'employee'` to the union in `types/api.types.ts`
- [Risk] `OrderResponse.status` semantics differ between user orders and employee orders (employee uses `0–3, -1`; existing type uses `PaymentStatus = 0|1|3`) → Mitigation: Use `number` for status in new `OrderDetailResponse`
- [Risk] `DatePicker` for voucher date range requires Ant Design `dayjs` adapter to be configured → Mitigation: Use `DatePicker` from `antd` with `dayjs` (already a project dependency via Ant Design)
- [Risk] Changing `Col span` from 8 to 6 on existing FilterBox usages is a visual change — Mitigation: Only affects admin pages, low user-impact, easily reviewable

## Migration Plan

1. Fix `FilterBox` layout: add `layout="vertical"` to all 6 existing FilterBox-using pages; change existing `Col span={8}` → `span={6}`
2. Add new TypeScript types
3. Add new service files
4. Create new page components
5. Register new routes
6. No data migrations needed — all new endpoints, no schema changes
