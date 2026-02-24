import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type React from 'react'
import { FeatureFlagProvider } from '../context/FeatureFlagContext'
import { useFeatureFlags } from './useFeatureFlags'
import { FEATURE_FLAGS, DEFAULT_FLAG_VALUES } from '../featureFlags'

function wrapper({ children }: { children: React.ReactNode }) {
  return <FeatureFlagProvider>{children}</FeatureFlagProvider>
}

describe('useFeatureFlags', () => {
  it('returns default flag values on initial render', () => {
    const { result } = renderHook(() => useFeatureFlags(), { wrapper })
    expect(result.current.flags).toEqual(DEFAULT_FLAG_VALUES)
  })

  it('isEnabled returns the correct boolean for each flag', () => {
    const { result } = renderHook(() => useFeatureFlags(), { wrapper })
    // MfaEnforcement defaults to true
    expect(result.current.isEnabled(FEATURE_FLAGS.MFA_ENFORCEMENT)).toBe(true)
    // EnhancedRbac defaults to false
    expect(result.current.isEnabled(FEATURE_FLAGS.ENHANCED_RBAC)).toBe(false)
  })

  it('toggleFlag flips a flag from false to true', () => {
    const { result } = renderHook(() => useFeatureFlags(), { wrapper })
    expect(result.current.isEnabled(FEATURE_FLAGS.ENHANCED_RBAC)).toBe(false)
    act(() => {
      result.current.toggleFlag(FEATURE_FLAGS.ENHANCED_RBAC)
    })
    expect(result.current.isEnabled(FEATURE_FLAGS.ENHANCED_RBAC)).toBe(true)
  })

  it('toggleFlag flips a flag from true to false', () => {
    const { result } = renderHook(() => useFeatureFlags(), { wrapper })
    expect(result.current.isEnabled(FEATURE_FLAGS.MFA_ENFORCEMENT)).toBe(true)
    act(() => {
      result.current.toggleFlag(FEATURE_FLAGS.MFA_ENFORCEMENT)
    })
    expect(result.current.isEnabled(FEATURE_FLAGS.MFA_ENFORCEMENT)).toBe(false)
  })

  it('setFlag sets a flag to an explicit value', () => {
    const { result } = renderHook(() => useFeatureFlags(), { wrapper })
    act(() => {
      result.current.setFlag(FEATURE_FLAGS.JIT_ACCESS_PROVISIONING, true)
    })
    expect(result.current.isEnabled(FEATURE_FLAGS.JIT_ACCESS_PROVISIONING)).toBe(true)

    act(() => {
      result.current.setFlag(FEATURE_FLAGS.JIT_ACCESS_PROVISIONING, false)
    })
    expect(result.current.isEnabled(FEATURE_FLAGS.JIT_ACCESS_PROVISIONING)).toBe(false)
  })

  it('resetFlags restores all flags to their defaults', () => {
    const { result } = renderHook(() => useFeatureFlags(), { wrapper })
    // Change several flags
    act(() => {
      result.current.toggleFlag(FEATURE_FLAGS.ENHANCED_RBAC)
      result.current.toggleFlag(FEATURE_FLAGS.MFA_ENFORCEMENT)
      result.current.setFlag(FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES, true)
    })
    // Now reset
    act(() => {
      result.current.resetFlags()
    })
    expect(result.current.flags).toEqual(DEFAULT_FLAG_VALUES)
  })

  it('throws when used outside FeatureFlagProvider', () => {
    expect(() => renderHook(() => useFeatureFlags())).toThrow(
      'useFeatureFlags must be used within a FeatureFlagProvider'
    )
  })

  it('accepts custom initialFlags via the provider', () => {
    const customWrapper = ({ children }: { children: React.ReactNode }) => (
      <FeatureFlagProvider
        initialFlags={{ [FEATURE_FLAGS.ENHANCED_RBAC]: true }}
      >
        {children}
      </FeatureFlagProvider>
    )
    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: customWrapper,
    })
    expect(result.current.isEnabled(FEATURE_FLAGS.ENHANCED_RBAC)).toBe(true)
    // Other defaults unchanged
    expect(result.current.isEnabled(FEATURE_FLAGS.MFA_ENFORCEMENT)).toBe(true)
  })
})
