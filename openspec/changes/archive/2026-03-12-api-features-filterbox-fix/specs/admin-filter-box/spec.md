## MODIFIED Requirements

### Requirement: FilterBox renders labels above inputs (vertical layout)

Each admin page that uses `FilterBox` wraps it in `<Form layout="vertical">`. This causes Ant Design to render each field label directly above its input, instead of inline.

#### Scenario: Labels appear above inputs

- **WHEN** a FilterBox is rendered on any admin page
- **THEN** each field label is displayed above (not beside) its input control
- **AND** the form uses `Form layout="vertical"` on the host page

---

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

- **WHEN** any of the following pages is loaded: product-page, brand-page, color-page, material-page, size-page, order admin page
- **THEN** the FilterBox on each page uses `Col span={6}` and the wrapping Form uses `layout="vertical"`
