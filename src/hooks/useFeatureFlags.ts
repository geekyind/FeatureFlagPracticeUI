import { useContext } from 'react'
import { FeatureFlagContext, type FeatureFlagContextValue } from '../context/FeatureFlagContext'

/**
 * Returns the feature flag context value.
 * Must be used inside a `<FeatureFlagProvider>`.
 *
 * @example
 * ```tsx
 * const { isEnabled } = useFeatureFlags()
 * if (isEnabled(FEATURE_FLAGS.ENHANCED_RBAC)) { ... }
 * ```
 */
export function useFeatureFlags(): FeatureFlagContextValue {
  const ctx = useContext(FeatureFlagContext)
  if (!ctx) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider')
  }
  return ctx
}
