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

### Requirement: FilterBox renders labels above inputs (vertical layout)

Each admin page that uses `FilterBox` wraps it in `<Form layout="vertical">`. This causes Ant Design to render each field label directly above its input, instead of inline.

#### Scenario: Labels appear above inputs

- **WHEN** a FilterBox is rendered on any admin page
- **THEN** each field label is displayed above (not beside) its input control
- **AND** the form uses `Form layout="vertical"` on the host page

### Requirement: FilterBox displays at most 4 inputs per row

Each column inside FilterBox uses `Col span={6}` (out of 24), allowing exactly 4 columns per row. If there are more than 4 inputs, they wrap to the next row.

#### Scenario: Four inputs fill one row

- **WHEN** a FilterBox has exactly 4 fields
- **THEN** all 4 inputs appear on a single horizontal row
- **AND** each input takes up `span={6}` (25% of the row width)

#### Scenario: Five or more inputs wrap to next row

- **WHEN** a FilterBox has 5 or more fields
- **THEN** the first 4 appear on row 1 and the remainder wrap to row 2
- **AND** no row contains more than 4 inputs

#### Scenario: Existing FilterBox pages updated

- **WHEN** any of the following pages is loaded: product-page, brand-page, color-page, material-page, size-page, product-detail-page
- **THEN** the FilterBox on each page uses `Col span={6}` and the wrapping Form uses `layout="vertical"`

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
