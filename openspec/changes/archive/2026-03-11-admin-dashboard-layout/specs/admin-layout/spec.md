## MODIFIED Requirements

### Requirement: AdminLayout header displays user name with role badge
The AdminLayout header SHALL display the logged-in user's name alongside a `<Tag color="blue">Admin</Tag>` badge so the role is visually confirmed at all times. Previously the header showed name only.

#### Scenario: Admin views the header
- **WHEN** an admin user is logged in and views any `/admin/*` page
- **THEN** the header shows `<Avatar> <name> <Tag>Admin</Tag>` in the top-right corner
