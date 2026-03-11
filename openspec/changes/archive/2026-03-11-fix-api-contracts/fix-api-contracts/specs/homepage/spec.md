## MODIFIED Requirements

### Requirement: Homepage response unwrap is consistent
Homepage queryFn SHALL unwrap the response to return `ApiResponse<T>` directly (via `.then(r => r.data)`), and page code SHALL access `data?.data` to get the actual payload array. The current double-data access works but the unwrap chain must be explicit and documented.

#### Scenario: Homepage loads product list
- **WHEN** homepage mounts and useQuery fires
- **THEN** `getHomepageProducts().then(r => r.data)` returns `ApiResponse<ProductDetailResponse[]>`
- **THEN** component accesses `data?.data ?? []` to get the product array
