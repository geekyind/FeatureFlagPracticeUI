import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FeatureFlagProvider } from '../context/FeatureFlagContext'
import { AuthorizationPanel } from './AuthorizationPanel'
import { FEATURE_FLAGS } from '../featureFlags'

type FlagMap = Partial<Record<string, boolean>>

function renderPanel(flags: FlagMap = {}) {
  // Start with ALL flags off so tests are deterministic, then apply overrides
  const allOff: FlagMap = Object.fromEntries(
    Object.values(FEATURE_FLAGS).map((f) => [f, false])
  )
  return render(
    <FeatureFlagProvider initialFlags={{ ...allOff, ...flags }}>
      <AuthorizationPanel />
    </FeatureFlagProvider>
  )
}

describe('AuthorizationPanel', () => {
  // ── Enhanced RBAC ──────────────────────────────────────────
  it('does NOT show the Hierarchical Roles card when EnhancedRbac is off', () => {
    renderPanel()
    expect(screen.queryByTestId('enhanced-rbac-card')).not.toBeInTheDocument()
  })

  it('shows the Hierarchical Roles card when EnhancedRbac is on', () => {
    renderPanel({ [FEATURE_FLAGS.ENHANCED_RBAC]: true })
    expect(screen.getByTestId('enhanced-rbac-card')).toBeInTheDocument()
    expect(screen.getByText('University Admin')).toBeInTheDocument()
    expect(screen.getByText('Student')).toBeInTheDocument()
  })

  // ── MFA Enforcement ────────────────────────────────────────
  it('shows MFA disabled message when MfaEnforcement is off', () => {
    renderPanel()
    expect(screen.getByTestId('mfa-card')).toBeInTheDocument()
    expect(screen.getByText(/MFA enforcement is/)).toBeInTheDocument()
    expect(screen.getByText(/disabled/i)).toBeInTheDocument()
  })

  it('shows MFA active message when MfaEnforcement is on', () => {
    renderPanel({ [FEATURE_FLAGS.MFA_ENFORCEMENT]: true })
    expect(screen.getByText(/active/i)).toBeInTheDocument()
  })

  // ── Conditional Access ─────────────────────────────────────
  it('does NOT show Conditional Access card when flag is off', () => {
    renderPanel()
    expect(
      screen.queryByTestId('conditional-access-card')
    ).not.toBeInTheDocument()
  })

  it('shows Conditional Access card when flag is on', () => {
    renderPanel({ [FEATURE_FLAGS.CONDITIONAL_ACCESS_POLICIES]: true })
    expect(screen.getByTestId('conditional-access-card')).toBeInTheDocument()
    expect(screen.getByText(/Geographic location/i)).toBeInTheDocument()
  })

  // ── Beta Features ──────────────────────────────────────────
  it('does NOT show Beta Features card when flag is off', () => {
    renderPanel()
    expect(screen.queryByTestId('beta-features-card')).not.toBeInTheDocument()
  })

  it('shows Beta Features card when flag is on', () => {
    renderPanel({ [FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES]: true })
    expect(screen.getByTestId('beta-features-card')).toBeInTheDocument()
    expect(screen.getByText(/TimeBasedAccess/i)).toBeInTheDocument()
  })

  // ── Detailed Audit Logging ─────────────────────────────────
  it('does NOT show Audit Log card when flag is off', () => {
    renderPanel()
    expect(screen.queryByTestId('audit-logging-card')).not.toBeInTheDocument()
  })

  it('shows Audit Log card when DetailedAuditLogging is on', () => {
    renderPanel({ [FEATURE_FLAGS.DETAILED_AUDIT_LOGGING]: true })
    expect(screen.getByTestId('audit-logging-card')).toBeInTheDocument()
    expect(screen.getByText(/demo@university.edu/i)).toBeInTheDocument()
  })

  // ── JIT Access ─────────────────────────────────────────────
  it('does NOT show JIT Access card when flag is off', () => {
    renderPanel()
    expect(screen.queryByTestId('jit-access-card')).not.toBeInTheDocument()
  })

  it('shows JIT Access card with form when JitAccessProvisioning is on', () => {
    renderPanel({ [FEATURE_FLAGS.JIT_ACCESS_PROVISIONING]: true })
    expect(screen.getByTestId('jit-access-card')).toBeInTheDocument()
    expect(
      screen.getByRole('form', { name: /JIT Access Request Form/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /request elevated access/i })
    ).toBeInTheDocument()
  })

  // ── External IdP ───────────────────────────────────────────
  it('does NOT show External IdP card when flag is off', () => {
    renderPanel()
    expect(screen.queryByTestId('external-idp-card')).not.toBeInTheDocument()
  })

  it('shows External IdP card when ExternalIdentityProviders is on', () => {
    renderPanel({ [FEATURE_FLAGS.EXTERNAL_IDENTITY_PROVIDERS]: true })
    expect(screen.getByTestId('external-idp-card')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign in with google/i })
    ).toBeInTheDocument()
  })

  // ── All flags on ───────────────────────────────────────────
  it('shows all sections when every flag is enabled', () => {
    const allOn: FlagMap = Object.fromEntries(
      Object.values(FEATURE_FLAGS).map((f) => [f, true])
    )
    renderPanel(allOn)
    expect(screen.getByTestId('enhanced-rbac-card')).toBeInTheDocument()
    expect(screen.getByTestId('mfa-card')).toBeInTheDocument()
    expect(screen.getByTestId('conditional-access-card')).toBeInTheDocument()
    expect(screen.getByTestId('beta-features-card')).toBeInTheDocument()
    expect(screen.getByTestId('audit-logging-card')).toBeInTheDocument()
    expect(screen.getByTestId('jit-access-card')).toBeInTheDocument()
    expect(screen.getByTestId('external-idp-card')).toBeInTheDocument()
  })
})
