# Spec: ui-standards (delta)

## Change

Three UI standards are introduced/enforced across all table pages:

---

## 1. No-Cache Policy

**File**: `src/App.tsx`

React Query `QueryClient` default config:

```ts
queries: {
  retry: 1,
  staleTime: 0,
  gcTime: 0,
}
```

- `staleTime: 0`: every mounted query is immediately stale and refetches from the API
- `gcTime: 0`: unused cache is garbage-collected immediately

No per-query overrides are needed or allowed. The backend handles caching.

---

## 2. STT Column

All tables that previously showed an ID column must display a sequential row number instead.

### Column definition

```ts
{
  title: 'STT',
  key: 'stt',
  width: 60,
  render: (_: unknown, __: unknown, index: number) => index + 1,
}
```

### Affected files

| File | Replaced column |
|------|----------------|
| `src/components/admin/catalog-table.tsx` | `{ title: 'ID', dataIndex: 'id', width: 80 }` |
| `src/pages/admin/user-page.tsx` | `{ title: 'ID', dataIndex: 'id', ellipsis: true, width: 100 }` |
| `src/pages/employee/orders-page.tsx` | `{ title: 'ID', dataIndex: 'id', ellipsis: true, width: 120 }` |
| `src/pages/user/orders-page.tsx` | `{ title: 'ID', dataIndex: 'id', ... }` |

---

## 3. Icon-Only Action Buttons

All "Thao tác" columns must use icon-only `Button` components.

### Standard pattern

```tsx
<Button size="small" icon={<EditOutlined />} onClick={...} />
<Button size="small" danger icon={<DeleteOutlined />} onClick={...} />
```

No text children inside action buttons. `danger` prop is allowed.

### Icon semantics

| Action | Icon |
|--------|------|
| Edit / Update | `EditOutlined` |
| Delete / Remove | `DeleteOutlined` |
| View detail | `EyeOutlined` |
| Reset password | `KeyOutlined` |
| Deactivate / Disable | `StopOutlined` |

### Fixes required

| File | Button before | Button after |
|------|--------------|--------------|
| `src/pages/admin/user-page.tsx` | `<Button>Reset MK</Button>` | `<Button icon={<KeyOutlined />} />` |
| `src/pages/admin/user-page.tsx` | `<Button danger>Xóa</Button>` | `<Button danger icon={<DeleteOutlined />} />` |
| `src/pages/admin/voucher-page.tsx` | `<Button danger>Vô hiệu</Button>` | `<Button danger icon={<StopOutlined />} />` |

Files already compliant (no change needed): `catalog-table.tsx`, `product-page.tsx`, `product-detail-page.tsx`.
