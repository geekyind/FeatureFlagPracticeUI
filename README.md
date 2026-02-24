# FeatureFlagPracticeUI

A React + TypeScript UI that implements the authorization feature flags from
[geekyind/FeatureFlagPractice](https://github.com/geekyind/FeatureFlagPractice).

## Overview

This application demonstrates how feature flags change the authorization
experience for a university authorization team. A **Feature Flag Dashboard**
lets administrators toggle flags at runtime; the **Authorization Panel** reacts
immediately to show or hide sections based on the enabled flags.

### Feature Flags

| Flag | Default | Description |
|------|---------|-------------|
| `EnhancedRbac` | off | Hierarchical role-based access control |
| `MfaEnforcement` | **on** | Require MFA for sensitive operations |
| `ConditionalAccessPolicies` | off | Access restrictions based on location / device |
| `BetaAuthorizationFeatures` | off | Experimental policies for BetaTester / Admin roles and `@university.edu` users |
| `DetailedAuditLogging` | **on** | Full audit trail for every authorization decision |
| `JitAccessProvisioning` | off | Just-in-time temporary elevated access |
| `ExternalIdentityProviders` | off | Sign-in with Google, GitHub, etc. |

Default values mirror the backend `appsettings.json` in the companion .NET API.

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install & run

```bash
npm install
npm run dev          # http://localhost:5173
```

### Build for production

```bash
npm run build
npm run preview      # http://localhost:4173
```

---

## Project Structure

```
src/
├── featureFlags.ts              # Flag names, metadata and defaults
├── context/
│   └── FeatureFlagContext.tsx   # React context + provider
├── hooks/
│   └── useFeatureFlags.ts       # useFeatureFlags() hook
└── components/
    ├── FeatureFlagDashboard.tsx  # Toggle panel for admins
    └── AuthorizationPanel.tsx   # Feature-gated authorization UI
```

---

## Architecture

### `featureFlags.ts`

Defines three exports:

- **`FEATURE_FLAGS`** – typed constant object of flag name strings. Always use
  this instead of bare strings so typos are caught at compile time.
- **`FEATURE_FLAG_METADATA`** – human-readable label and description for each
  flag (used by the dashboard).
- **`DEFAULT_FLAG_VALUES`** – initial values that mirror `appsettings.json`.

### `FeatureFlagContext`

A React context that holds the flag state and exposes four operations:

```tsx
const { flags, isEnabled, toggleFlag, setFlag, resetFlags } = useFeatureFlags()
```

| Operation | Signature | Purpose |
|-----------|-----------|---------|
| `flags` | `Record<FeatureFlagName, boolean>` | Raw flag state |
| `isEnabled` | `(flag) => boolean` | Guard helper |
| `toggleFlag` | `(flag) => void` | Flip a flag |
| `setFlag` | `(flag, value) => void` | Set explicit value |
| `resetFlags` | `() => void` | Restore defaults |

Wrap your app (or a subtree) with `<FeatureFlagProvider>`:

```tsx
<FeatureFlagProvider>
  <App />
</FeatureFlagProvider>
```

Pass `initialFlags` to override defaults (useful in tests or Storybook):

```tsx
<FeatureFlagProvider initialFlags={{ EnhancedRbac: true }}>
  ...
</FeatureFlagProvider>
```

### `useFeatureFlags` hook

A thin wrapper around `useContext` that throws a descriptive error when used
outside a provider.

### Components

#### `FeatureFlagDashboard`

Renders a toggle switch for every flag. Clicking a toggle calls `toggleFlag`
from the context; "Reset to Defaults" calls `resetFlags`.

#### `AuthorizationPanel`

Reads the flag state and conditionally renders sections:

- **Enhanced RBAC** → university role hierarchy (Admin → Dept Head → Professor → TA → Student)
- **MFA Enforcement** → active/disabled banner
- **Conditional Access Policies** → list of contextual signals
- **Beta Features** → experimental policy list (gated by role/domain)
- **Detailed Audit Logging** → example audit log table
- **JIT Access Provisioning** → request form for temporary elevated access
- **External Identity Providers** → Google / GitHub sign-in buttons

---

## Testing

Tests use **Vitest** + **@testing-library/react**.

```bash
npm test              # run all tests once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

### Test files

| File | What is tested |
|------|---------------|
| `src/hooks/useFeatureFlags.test.tsx` | Hook behaviour, toggle/set/reset, error outside provider, custom initialFlags |
| `src/components/FeatureFlagDashboard.test.tsx` | Renders all 7 flags, toggle interaction, reset button, accessible landmark |
| `src/components/AuthorizationPanel.test.tsx` | Each section shown/hidden per flag, all-on smoke test |

### Writing a new test

Wrap components in `<FeatureFlagProvider>` and pass `initialFlags` to control
the starting state:

```tsx
import { render, screen } from '@testing-library/react'
import { FeatureFlagProvider } from '../context/FeatureFlagContext'
import { FEATURE_FLAGS } from '../featureFlags'
import { MyComponent } from './MyComponent'

test('shows beta section when flag is on', () => {
  render(
    <FeatureFlagProvider initialFlags={{ [FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES]: true }}>
      <MyComponent />
    </FeatureFlagProvider>
  )
  expect(screen.getByText(/beta/i)).toBeInTheDocument()
})
```

---

## Adding a New Feature Flag

1. **Backend** – add the flag key to `AuthorizationFeatureFlags.cs` and `appsettings.json`.
2. **`featureFlags.ts`** – add the constant, metadata, and default value.
3. **`AuthorizationPanel.tsx`** – add a new conditional section that reacts to the flag.
4. **Tests** – add cases to `AuthorizationPanel.test.tsx` for flag-on and flag-off behaviour.

---

## Connecting to a Live Backend

The default flag values are hard-coded to match the backend defaults. To load
real values from the API on mount, hydrate the context in your root component:

```tsx
const [initialFlags, setInitialFlags] = useState<Partial<Record<FeatureFlagName, boolean>>>()

useEffect(() => {
  fetch('/api/featureflags')
    .then(r => r.json())
    .then(data => setInitialFlags(data))
}, [])

if (!initialFlags) return <LoadingSpinner />

return (
  <FeatureFlagProvider initialFlags={initialFlags}>
    <App />
  </FeatureFlagProvider>
)
```
