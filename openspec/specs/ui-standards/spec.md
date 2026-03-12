# Spec: ui-standards

## Overview

Global UI standards enforced across all table pages in the application.

---

## Requirements

### Requirement: No client-side caching — always fetch from API

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
- `gcTime: 0`: unused cache is garbage-collected immediately when no observers remain

The backend is the source of truth for caching. No per-query `staleTime` overrides are needed or allowed.

#### Scenario: User navigates back to a list page
- **WHEN** a user navigates away from a list page and returns
- **THEN** a fresh API call is made and the latest data is displayed

---

### Requirement: Tables display STT (sequential row number) instead of ID

All tables MUST replace the UUID/ID column with a sequential row number column (STT).

**Column definition:**

```ts
{
  title: 'STT',
  key: 'stt',
  width: 60,
  render: (_: unknown, __: unknown, index: number) => index + 1,
}
```

**Applies to:**
- `src/components/admin/catalog-table.tsx`
- `src/pages/admin/user-page.tsx`
- `src/pages/employee/orders-page.tsx`
- `src/pages/user/orders-page.tsx`

#### Scenario: User views a list table
- **WHEN** a user views any admin, employee, or user-side table
- **THEN** the first column shows 1, 2, 3… instead of UUID values

---

### Requirement: Action column buttons are icon-only

All "Hành động" / "Thao tác" columns MUST use icon-only `Button` components. No text labels inside action buttons.

**Standard pattern:**

```tsx
<Button size="small" icon={<EditOutlined />} onClick={...} />
<Button size="small" danger icon={<DeleteOutlined />} onClick={...} />
```

**Icon semantics:**

| Action | Icon |
|---|---|
| Edit / Update | `EditOutlined` |
| Delete / Remove | `DeleteOutlined` |
| View detail | `EyeOutlined` |
| Reset password | `KeyOutlined` |
| Deactivate / Disable | `StopOutlined` |

The `danger` prop is allowed. `loading` prop is allowed.

#### Scenario: User views action buttons in a table
- **WHEN** a user views any table with an actions column
- **THEN** all buttons show only an icon with no text label
- **AND** hovering shows a tooltip (Ant Design default behavior for icon-only buttons)
