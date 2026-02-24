import { FEATURE_FLAGS } from '../featureFlags'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import './AuthorizationPanel.css'

/**
 * `AuthorizationPanel` demonstrates how each feature flag changes the UI
 * available to a university authorization team member.
 *
 * The panel renders different sections depending on which flags are enabled,
 * mirroring the backend `AuthorizationController` behaviour.
 */
export function AuthorizationPanel() {
  const { isEnabled } = useFeatureFlags()

  const enhancedRbac = isEnabled(FEATURE_FLAGS.ENHANCED_RBAC)
  const mfaEnforcement = isEnabled(FEATURE_FLAGS.MFA_ENFORCEMENT)
  const conditionalAccess = isEnabled(FEATURE_FLAGS.CONDITIONAL_ACCESS_POLICIES)
  const betaFeatures = isEnabled(FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES)
  const auditLogging = isEnabled(FEATURE_FLAGS.DETAILED_AUDIT_LOGGING)
  const jitAccess = isEnabled(FEATURE_FLAGS.JIT_ACCESS_PROVISIONING)
  const externalIdP = isEnabled(FEATURE_FLAGS.EXTERNAL_IDENTITY_PROVIDERS)

  return (
    <section className="auth-panel" aria-label="Authorization Panel">
      <h2>Authorization Panel</h2>
      <p className="auth-subtitle">
        The sections below reflect which feature flags are currently enabled.
      </p>

      {/* ── Enhanced RBAC ─────────────────────────────────── */}
      {enhancedRbac && (
        <div className="auth-card" data-testid="enhanced-rbac-card">
          <h3>🏛️ Hierarchical Roles</h3>
          <p>Enhanced RBAC is active. The following role hierarchy is in effect:</p>
          <ol className="role-list">
            <li>University Admin <span className="role-badge">Level 1</span></li>
            <li>Department Head <span className="role-badge">Level 2</span> — reports to University Admin</li>
            <li>Professor <span className="role-badge">Level 3</span> — reports to Department Head</li>
            <li>Teaching Assistant <span className="role-badge">Level 4</span> — reports to Professor</li>
            <li>Student <span className="role-badge">Level 5</span></li>
          </ol>
        </div>
      )}

      {/* ── MFA Enforcement ───────────────────────────────── */}
      <div className="auth-card" data-testid="mfa-card">
        <h3>🔐 MFA Status</h3>
        {mfaEnforcement ? (
          <p className="status-on">
            ✅ MFA enforcement is <strong>active</strong>. Users must complete
            multi-factor authentication before accessing sensitive resources.
          </p>
        ) : (
          <p className="status-off">
            ⚠️ MFA enforcement is <strong>disabled</strong>. Users can access
            resources without a second authentication factor.
          </p>
        )}
      </div>

      {/* ── Conditional Access ────────────────────────────── */}
      {conditionalAccess && (
        <div className="auth-card" data-testid="conditional-access-card">
          <h3>🌐 Conditional Access Policies</h3>
          <p>Access decisions now consider contextual signals:</p>
          <ul>
            <li>📍 Geographic location</li>
            <li>💻 Device compliance status</li>
            <li>🕐 Time-of-day restrictions</li>
            <li>🔒 Network trust level</li>
          </ul>
        </div>
      )}

      {/* ── Beta Features ─────────────────────────────────── */}
      {betaFeatures && (
        <div className="auth-card auth-card--beta" data-testid="beta-features-card">
          <h3>🧪 Beta: Advanced Policies</h3>
          <p>You have access to the following experimental authorization policies:</p>
          <ul>
            <li><strong>TimeBasedAccess</strong> — Restrict access based on time of day</li>
            <li><strong>LocationBasedAccess</strong> — Restrict access based on geographic location</li>
            <li><strong>DeviceCompliance</strong> — Require device compliance for access</li>
          </ul>
          <small>Available to BetaTester / Admin roles and @university.edu email addresses.</small>
        </div>
      )}

      {/* ── Detailed Audit Logging ────────────────────────── */}
      {auditLogging && (
        <div className="auth-card" data-testid="audit-logging-card">
          <h3>📋 Detailed Audit Log</h3>
          <p>All authorization decisions are being recorded with full context.</p>
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Resource</th>
                <th>Decision</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{new Date().toISOString().replace('T', ' ').slice(0, 19)}</td>
                <td>demo@university.edu</td>
                <td>/api/authorization/permissions</td>
                <td className="decision-allow">ALLOW</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ── JIT Access Provisioning ───────────────────────── */}
      {jitAccess && (
        <div className="auth-card" data-testid="jit-access-card">
          <h3>⏱️ JIT Access Request</h3>
          <p>
            Just-in-time provisioning is enabled. Use the form below to request
            temporary elevated access to a protected resource.
          </p>
          <JitAccessForm />
        </div>
      )}

      {/* ── External Identity Providers ───────────────────── */}
      {externalIdP && (
        <div className="auth-card" data-testid="external-idp-card">
          <h3>🔗 External Identity Providers</h3>
          <p>Additional sign-in methods are available:</p>
          <div className="idp-buttons">
            <button type="button" className="idp-btn" aria-label="Sign in with Google">
              Sign in with Google
            </button>
            <button type="button" className="idp-btn" aria-label="Sign in with GitHub">
              Sign in with GitHub
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

/** Minimal JIT access request form (rendered only when JIT flag is on). */
function JitAccessForm() {
  return (
    <form
      className="jit-form"
      onSubmit={(e) => e.preventDefault()}
      aria-label="JIT Access Request Form"
    >
      <label htmlFor="jit-resource">Resource ID</label>
      <input id="jit-resource" type="text" placeholder="e.g. /reports/financials" />

      <label htmlFor="jit-duration">Duration (hours)</label>
      <input id="jit-duration" type="number" min={1} max={8} defaultValue={1} />

      <label htmlFor="jit-justification">Justification</label>
      <textarea
        id="jit-justification"
        rows={2}
        placeholder="Describe why elevated access is needed"
      />

      <button type="submit" className="jit-submit-btn">
        Request Elevated Access
      </button>
    </form>
  )
}
