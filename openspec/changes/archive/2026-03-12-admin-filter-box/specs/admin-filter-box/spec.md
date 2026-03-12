## ADDED Requirements

### Requirement: FilterBox component toggles visibility
The system SHALL provide a `FilterBox` component at `src/components/admin/filter-box.tsx` that renders a toggle button labeled "Tìm kiếm" (with filter icon). Clicking the button SHALL expand or collapse the filter panel below it. The panel SHALL be collapsed by default.

#### Scenario: Filter panel is collapsed on initial render
- **WHEN** a page renders `FilterBox`
- **THEN** the filter fields area is hidden and only the toggle button row is visible

#### Scenario: Admin expands the filter panel
- **WHEN** admin clicks the "Tìm kiếm" toggle button
- **THEN** the filter panel expands and all filter fields become visible

#### Scenario: Admin collapses the filter panel
- **WHEN** the panel is open and admin clicks the toggle button again
- **THEN** the filter panel collapses and the fields are hidden

### Requirement: FilterBox renders children in a responsive grid
The `FilterBox` component SHALL render its `children` inside an Ant Design `Row` with `gutter={[16, 16]}`. Each child is expected to be wrapped in `<Col span={8}>` by the host page. The layout SHALL place up to 3 fields per row on desktop screens.

#### Scenario: Three filter fields appear in one row
- **WHEN** a page passes three `<Col span={8}>` children to `FilterBox`
- **THEN** all three fields appear side by side in a single horizontal row

#### Scenario: Six filter fields appear in two rows
- **WHEN** a page passes six `<Col span={8}>` children
- **THEN** fields are distributed across two rows of three

### Requirement: FilterBox exposes search and reset actions
The `FilterBox` component SHALL render a "Tìm kiếm" (search) submit button and a "Đặt lại" (reset) button in the bottom-right of the filter panel. Clicking "Tìm kiếm" SHALL call the `onSearch` prop. Clicking "Đặt lại" SHALL call the optional `onReset` prop if provided.

#### Scenario: Admin clicks the search button inside the filter panel
- **WHEN** admin clicks the "Tìm kiếm" button inside the open filter panel
- **THEN** the `onSearch` callback is invoked

#### Scenario: Admin clicks the reset button
- **WHEN** admin clicks "Đặt lại"
- **THEN** the `onReset` callback is invoked (if provided) and filter fields are cleared by the host page

### Requirement: FilterBox component API
The `FilterBox` component SHALL accept the following TypeScript props:
- `children: React.ReactNode` — the filter field elements
- `onSearch: () => void` — called when "Tìm kiếm" button is clicked
- `onReset?: () => void` — called when "Đặt lại" button is clicked
- `defaultOpen?: boolean` — initial open state (defaults to `false`)

#### Scenario: Default open state is closed
- **WHEN** `FilterBox` is rendered without `defaultOpen`
- **THEN** the panel is collapsed

#### Scenario: Host can pre-open the panel
- **WHEN** `FilterBox` is rendered with `defaultOpen={true}`
- **THEN** the panel is expanded on initial render
