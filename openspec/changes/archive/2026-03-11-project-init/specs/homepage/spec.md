## ADDED Requirements

### Requirement: Homepage displays list of active products
The system SHALL fetch all active `ProductDetail` items from `GET /` (public, no auth required) using React Query `useQuery`, and display them as product cards with image, name, price, color, and size information.

#### Scenario: Products load on initial visit
- **WHEN** any user (logged in or not) visits `/`
- **THEN** a grid of product cards is displayed using data from `GET /`

#### Scenario: Only active products are shown
- **WHEN** the backend returns products
- **THEN** only items with `deleteFlag = false` appear (backend already filters this)

#### Scenario: Loading state is shown while fetching
- **WHEN** the page is loading products
- **THEN** Ant Design `Skeleton` or `Spin` is shown in place of product cards

### Requirement: User can search and filter products client-side
The homepage SHALL provide a search input to filter displayed products by name, and optional filters by color and size, all applied client-side without additional API calls.

#### Scenario: Search filters product list by name
- **WHEN** user types in the search input
- **THEN** only products whose name contains the search term (case-insensitive) are shown

### Requirement: Product card links to add-to-cart action
Each product card SHALL show an "Add to Cart" button. Clicking it SHALL call `GET /add-product-to-cart/{productDetailId}` (requires auth). If the user is not authenticated, they SHALL be redirected to `/login`.

#### Scenario: Unauthenticated add to cart redirects to login
- **WHEN** unauthenticated user clicks "Add to Cart"
- **THEN** user is redirected to `/login`

#### Scenario: Authenticated add to cart shows success message
- **WHEN** authenticated user clicks "Add to Cart"
- **THEN** `GET /add-product-to-cart/{id}` is called and Ant Design `message.success` is shown
