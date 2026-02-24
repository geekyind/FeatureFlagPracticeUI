import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FeatureFlagProvider } from '../context/FeatureFlagContext'
import { FeatureFlagDashboard } from './FeatureFlagDashboard'
import { FEATURE_FLAGS, FEATURE_FLAG_METADATA } from '../featureFlags'

function renderDashboard(
  initialFlags?: Partial<Record<string, boolean>>
) {
  return render(
    <FeatureFlagProvider initialFlags={initialFlags}>
      <FeatureFlagDashboard />
    </FeatureFlagProvider>
  )
}

describe('FeatureFlagDashboard', () => {
  it('renders a toggle for every feature flag', () => {
    renderDashboard()
    const allFlags = Object.values(FEATURE_FLAGS)
    allFlags.forEach((flag) => {
      const { label } = FEATURE_FLAG_METADATA[flag]
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  it('shows ON for flags that default to true', () => {
    renderDashboard()
    // MfaEnforcement and DetailedAuditLogging default to true
    const onBadges = screen.getAllByText('ON')
    expect(onBadges.length).toBeGreaterThanOrEqual(2)
  })

  it('shows OFF for flags that default to false', () => {
    renderDashboard()
    const offBadges = screen.getAllByText('OFF')
    expect(offBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('toggling a flag changes its status label', async () => {
    const user = userEvent.setup()
    renderDashboard({ [FEATURE_FLAGS.ENHANCED_RBAC]: false })

    const toggle = screen.getByRole('switch', {
      name: `Toggle ${FEATURE_FLAG_METADATA[FEATURE_FLAGS.ENHANCED_RBAC].label}`,
    })
    // Before toggle: checkbox is unchecked
    expect(toggle).not.toBeChecked()

    await user.click(toggle)

    expect(toggle).toBeChecked()
  })

  it('"Reset to Defaults" button restores all flags', async () => {
    const user = userEvent.setup()
    // Start with Enhanced RBAC enabled (non-default)
    renderDashboard({ [FEATURE_FLAGS.ENHANCED_RBAC]: true })

    const rbacToggle = screen.getByRole('switch', {
      name: `Toggle ${FEATURE_FLAG_METADATA[FEATURE_FLAGS.ENHANCED_RBAC].label}`,
    })
    expect(rbacToggle).toBeChecked()

    await user.click(screen.getByRole('button', { name: /reset all flags to defaults/i }))

    // After reset, Enhanced RBAC should be unchecked (default is false)
    expect(rbacToggle).not.toBeChecked()
  })

  it('renders an accessible landmark', () => {
    renderDashboard()
    expect(
      screen.getByRole('region', { name: /feature flag dashboard/i })
    ).toBeInTheDocument()
  })
})
