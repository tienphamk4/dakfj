## MODIFIED Requirements

### Requirement: Cart page response unwrap is consistent
Cart page queryFn SHALL unwrap `AxiosResponse` via `.then(r => r.data)` and component SHALL access `data?.data ?? []` for the CartItem array.

#### Scenario: Cart page loads items
- **WHEN** cart page mounts and useQuery fires
- **THEN** `getCart().then(r => r.data)` returns `ApiResponse<CartItem[]>`
- **THEN** component accesses `data?.data ?? []` to get the cart items array
