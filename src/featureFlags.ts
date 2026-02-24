/**
 * Authorization feature flag names.
 * These must match the keys defined in the backend FeatureManagement configuration.
 *
 * @see https://github.com/geekyind/FeatureFlagPractice
 */
export const FEATURE_FLAGS = {
  /** Enables enhanced role-based access control with hierarchical roles. */
  ENHANCED_RBAC: 'EnhancedRbac',

  /** Enables multi-factor authentication enforcement for sensitive operations. */
  MFA_ENFORCEMENT: 'MfaEnforcement',

  /** Enables conditional access policies based on user context (location, device, etc.). */
  CONDITIONAL_ACCESS_POLICIES: 'ConditionalAccessPolicies',

  /** Enables beta features for authorization testing by specific user groups. */
  BETA_AUTHORIZATION_FEATURES: 'BetaAuthorizationFeatures',

  /** Enables detailed audit logging for all authorization decisions. */
  DETAILED_AUDIT_LOGGING: 'DetailedAuditLogging',

  /** Enables just-in-time (JIT) access provisioning for elevated permissions. */
  JIT_ACCESS_PROVISIONING: 'JitAccessProvisioning',

  /** Enables integration with external identity providers beyond MS Identity. */
  EXTERNAL_IDENTITY_PROVIDERS: 'ExternalIdentityProviders',
} as const

export type FeatureFlagName = (typeof FEATURE_FLAGS)[keyof typeof FEATURE_FLAGS]

/** Human-readable labels and descriptions for each feature flag. */
export const FEATURE_FLAG_METADATA: Record<
  FeatureFlagName,
  { label: string; description: string }
> = {
  [FEATURE_FLAGS.ENHANCED_RBAC]: {
    label: 'Enhanced RBAC',
    description:
      'Enables hierarchical role-based access control with parent–child role relationships.',
  },
  [FEATURE_FLAGS.MFA_ENFORCEMENT]: {
    label: 'MFA Enforcement',
    description:
      'Requires multi-factor authentication for sensitive operations.',
  },
  [FEATURE_FLAGS.CONDITIONAL_ACCESS_POLICIES]: {
    label: 'Conditional Access Policies',
    description:
      'Restricts access based on user context such as location, device, or network.',
  },
  [FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES]: {
    label: 'Beta Authorization Features',
    description:
      'Unlocks beta authorization features for BetaTester / Admin roles and @university.edu addresses.',
  },
  [FEATURE_FLAGS.DETAILED_AUDIT_LOGGING]: {
    label: 'Detailed Audit Logging',
    description:
      'Records every authorization decision with full context for compliance reporting.',
  },
  [FEATURE_FLAGS.JIT_ACCESS_PROVISIONING]: {
    label: 'JIT Access Provisioning',
    description:
      'Allows users to request temporary elevated access on a just-in-time basis.',
  },
  [FEATURE_FLAGS.EXTERNAL_IDENTITY_PROVIDERS]: {
    label: 'External Identity Providers',
    description:
      'Enables sign-in through external IdPs (e.g., Google, GitHub) in addition to MS Identity.',
  },
}

/** Default flag values that mirror the backend appsettings.json defaults. */
export const DEFAULT_FLAG_VALUES: Record<FeatureFlagName, boolean> = {
  [FEATURE_FLAGS.ENHANCED_RBAC]: false,
  [FEATURE_FLAGS.MFA_ENFORCEMENT]: true,
  [FEATURE_FLAGS.CONDITIONAL_ACCESS_POLICIES]: false,
  [FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES]: false,
  [FEATURE_FLAGS.DETAILED_AUDIT_LOGGING]: true,
  [FEATURE_FLAGS.JIT_ACCESS_PROVISIONING]: false,
  [FEATURE_FLAGS.EXTERNAL_IDENTITY_PROVIDERS]: false,
}
