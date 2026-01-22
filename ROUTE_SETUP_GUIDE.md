# Route Structure Guide - React + Vite + TanStack Query + TanStack Router

## Project Structure

```
src/
├── routes/
│   ├── __root.tsx                 # Root layout - wraps ENTIRE app
│   ├── index.tsx                  # GET / - Home page
│   ├── login.tsx                  # GET /login
│   ├── register.tsx               # GET /register
│   ├── profile.tsx                # GET /profile
│   ├── my-study-sets.tsx          # GET /my-study-sets
│   ├── debug.tsx                  # GET /debug
│   ├── admin/
│   │   ├── index.tsx              # GET /admin/ - Dashboard
│   │   ├── users.tsx              # GET /admin/users - User management
│   │   ├── study-sets.tsx         # GET /admin/study-sets - Study set management
│   │   └── flashcards.tsx         # GET /admin/flashcards - Flashcard management
│   └── study-sets/
│       ├── index.tsx              # GET /study-sets/ - List
│       └── $studySetId.tsx        # GET /study-sets/$studySetId - Detail/Learn/Test
├── components/
│   ├── StudySetList.tsx
│   ├── StudySetForm.tsx
│   ├── StudySetDetail.tsx
│   ├── FlashcardLearner.tsx
│   ├── TestMode.tsx
│   └── ...
├── services/
│   ├── studySetService.ts
│   └── ...
├── types/
│   └── index.ts
├── App.tsx                        # RouterProvider wrapper
└── main.tsx
```

## Key Rules for TanStack Router

### 1. File Naming Conventions

| File Name | Route | Purpose |
|-----------|-------|---------|
| `index.tsx` | `/` or `/folder/` | Entry point for that path |
| `$param.tsx` | `/:param` | Dynamic segment |
| `_layout.tsx` | N/A | Layout wrapper (children render in `<Outlet />`) |
| `__root.tsx` | N/A | Root layout wrapping entire app |
| `--segment.tsx` | N/A | Ignored by router (helper files) |

### 2. Dynamic Routes - CRITICAL

```
study-sets/
├── index.tsx          # Route: /study-sets/
└── $studySetId.tsx    # Route: /study-sets/$studySetId
```

**This creates TWO separate routes:**
- `/study-sets/` → renders `index.tsx`
- `/study-sets/123` → renders `$studySetId.tsx`

### 3. Layout Files - CRITICAL

```
routes/
├── __root.tsx              # Wraps everything
├── study-sets/
│   ├── _layout.tsx         # ❌ DO NOT USE - confuses router
│   ├── index.tsx
│   └── $studySetId.tsx
```

**Problem:** `_layout.tsx` at folder level doesn't work in TanStack Router v1.
**Solution:** Use only `__root.tsx` for global layout, or use layout within the same level folder.

### 4. Correct Route Definitions

```typescript
// ✅ CORRECT: $studySetId.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/study-sets/$studySetId")({
  component: StudySetDetailPage,
});

function StudySetDetailPage() {
  const { studySetId } = Route.useParams();
  
  return <div>Study Set: {studySetId}</div>;
}
```

### 5. Navigation - CORRECT

```typescript
import { useNavigate } from "@tanstack/react-router";

function MyComponent() {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate({
      to: "/study-sets/$studySetId",
      params: { studySetId: "123" }
    });
  };
  
  return <button onClick={handleClick}>View Study Set</button>;
}
```

### 6. TanStack Query Integration

```typescript
import { useQuery } from "@tanstack/react-query";
import { useRoute } from "@tanstack/react-router";

function StudySetDetailPage() {
  const { studySetId } = Route.useParams();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["studySet", studySetId],  // ⭐ Include param in key
    queryFn: () => studySetService.getById(studySetId),
    enabled: !!studySetId,                // ⭐ Only fetch when param exists
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>{data?.title}</div>;
}
```

## Common Mistakes

### ❌ Mistake 1: Using `_layout.tsx` in nested folders
```
study-sets/
├── _layout.tsx  # ❌ WRONG - router won't recognize it correctly
├── index.tsx
└── $studySetId.tsx
```

### ❌ Mistake 2: Wrong navigation path
```typescript
// ❌ WRONG - missing $
navigate({ to: "/study-sets/studySetId", params: { studySetId: "123" } })

// ✅ CORRECT
navigate({ to: "/study-sets/$studySetId", params: { studySetId: "123" } })
```

### ❌ Mistake 3: Not including param in query key
```typescript
// ❌ WRONG - won't refetch when param changes
const { data } = useQuery({
  queryKey: ["studySet"],
  queryFn: () => studySetService.getById(studySetId),
});

// ✅ CORRECT
const { data } = useQuery({
  queryKey: ["studySet", studySetId],
  queryFn: () => studySetService.getById(studySetId),
});
```

### ❌ Mistake 4: Not enabling query based on param
```typescript
// ❌ WRONG - fetches even if param is undefined
const { data } = useQuery({
  queryKey: ["studySet", studySetId],
  queryFn: () => studySetService.getById(studySetId),
});

// ✅ CORRECT
const { data } = useQuery({
  queryKey: ["studySet", studySetId],
  queryFn: () => studySetService.getById(studySetId),
  enabled: !!studySetId,
});
```

## App.tsx Setup

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider, createRouter, RootRoute, Route } from "@tanstack/react-router";
import RootLayout from "./routes/__root";

const queryClient = new QueryClient();

const rootRoute = new RootRoute({
  component: RootLayout,
});

const router = createRouter({
  routeTree: rootRoute,
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
```

## File-Based Router Setup (Recommended)

TanStack Router supports file-based routing with code generation:

1. Install: `npm install -D @tanstack/react-router-cli`
2. Add to `package.json`:
```json
{
  "scripts": {
    "tsr": "tsr"
  }
}
```
3. Run: `npm run tsr`
4. This auto-generates route tree from file structure

## Best Practices for Route Creation and Debugging

### 1. Always Create Parent Route Index File for Nested Routes
- When creating a folder route (e.g., `routes/feature/` with `$id.tsx`), always include `index.tsx` in the folder:
  ```tsx
  import { createFileRoute, Outlet } from "@tanstack/react-router";
  export const Route = createFileRoute("/feature")({
    component: () => <Outlet />,
  });
  ```
- This defines the parent route and allows child routes to render via `<Outlet />`.

### 2. Use Relative Paths for Child Routes
- In child components (e.g., `$id.tsx`), use relative paths:
  ```tsx
  export const Route = createFileRoute("/$id")({ ... });
  ```
- TanStack Router will auto-combine with parent path (e.g., `/feature/$id`).

### 3. Ensure Parent Components Include `<Outlet />` for Nested Rendering
- If the parent route needs to render its own content + child components, import `Outlet` and add `<Outlet />` in the JSX:
  ```tsx
  import { Outlet } from "@tanstack/react-router";
  // In component return: <div>{/* parent content */}<Outlet /></div>
  ```
- For full-page replacement (child replaces parent), use full paths and avoid `<Outlet />`.

### 4. Avoid Route Structure Conflicts
- Decide clearly: use a file route (e.g., `feature.tsx`) for flat routes, or a folder with `index.tsx` + children for nested routes.
- Do not mix files and folders with the same base path.

### 5. Regenerate Route Tree After Changes
- After adding/editing routes, regenerate `routeTree.gen.ts`:
  - Run `npx @tanstack/router-cli generate`
  - Or restart dev server
  - Or delete `src/routeTree.gen.ts` to force regeneration

### 6. Debug Routes Effectively
- Add `console.log` at component start and in `useEffect` to verify mounting.
- Check DevTools Console for errors and Network for API failures.
- Verify generated routes in `routeTree.gen.ts`.
- Test navigation manually and inspect route matching.

### 7. Common Issues and Fixes
- **Component not rendering on param routes**: Check for missing parent `index.tsx`, incorrect paths, or missing `<Outlet />`.
- **Route not matching**: Ensure paths are correct, regenerate route tree, and check for conflicts.
- **Nested routes not working**: Parent must have `<Outlet />`, child paths must be relative.

## Summary

✅ **DO:**
- Use `index.tsx` for folder entry points
- Use `$param.tsx` for dynamic segments
- Include params in query keys
- Enable queries only when params exist
- Use `navigate({ to: "/path/$param", params: { param: value } })`
- Create parent index files for nested routes
- Use relative paths in children
- Include `<Outlet />` in parent components for nesting
- Regenerate route tree after changes
- Add debug logs for troubleshooting

❌ **DON'T:**
- Use `_layout.tsx` in nested folders
- Forget `$` in route definitions
- Forget to include params in query keys
- Forget `enabled: !!param` for dependent queries
- Mix file and folder routes with same paths
- Skip regenerating route tree
- Forget `<Outlet />` for nested rendering
