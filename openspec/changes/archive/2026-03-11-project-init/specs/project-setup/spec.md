## ADDED Requirements

### Requirement: Vite + React + TypeScript project scaffold
The system SHALL be initialized as a Vite project with React and TypeScript template, with path alias `@/` pointing to `src/`, and environment variable `VITE_API_BASE_URL` for backend base URL.

#### Scenario: Path alias resolves correctly
- **WHEN** a file imports `@/services/auth.service`
- **THEN** TypeScript and Vite both resolve to `src/services/auth.service.ts` without errors

#### Scenario: Environment variable is available at runtime
- **WHEN** `import.meta.env.VITE_API_BASE_URL` is read
- **THEN** it returns `http://localhost:8080` in development

### Requirement: Clean architecture folder structure
The project SHALL have the following `src/` directories: `pages/`, `components/`, `features/`, `services/`, `hooks/`, `store/`, `utils/`, `types/`, `layouts/`, `routes/`.

#### Scenario: Feature modules are domain-isolated
- **WHEN** a developer adds a new feature
- **THEN** they create a folder under `src/features/<domain>/` containing its components, hooks, and logic

### Requirement: Global providers wired in App entry point
The app SHALL wrap the component tree with `QueryClientProvider` (React Query), `ConfigProvider` (Ant Design locale), and `BrowserRouter` (React Router) at the `src/main.tsx` / `src/App.tsx` level.

#### Scenario: React Query client is accessible anywhere
- **WHEN** any component calls `useQuery` or `useMutation`
- **THEN** it accesses the shared `QueryClient` without additional context setup

### Requirement: Docker + Nginx production setup
The project SHALL include a multi-stage `Dockerfile` (Node build → nginx:alpine) and `nginx.conf` that serves the Vite build output, handles SPA fallback (`try_files $uri /index.html`), and proxies `/api`, `/`, `/cart`, `/add-product-to-cart`, and `/images` to the backend.

#### Scenario: SPA routing works on direct URL access
- **WHEN** user navigates directly to `/admin/san-pham`
- **THEN** Nginx serves `index.html` and React Router handles the route client-side

#### Scenario: API proxy forwards requests to backend
- **WHEN** frontend calls `POST /api/login`
- **THEN** Nginx forwards the request to `http://backend:8080/api/login`
