import { useEffect, useState } from "react";
import { FEATURE_FLAGS } from "../featureFlags";
import { useFeatureFlags } from "../hooks/useFeatureFlags";
import "./AuthorizationPanel.css";

interface HierarchicalRole {
  name: string;
  level: number;
  parentRole: string | null;
}

interface BetaPolicy {
  name: string;
  description: string;
}

/**
 * `AuthorizationPanel` demonstrates how each feature flag changes the UI
 * available to a university authorization team member.
 *
 * The panel renders different sections depending on which flags are enabled,
 * mirroring the backend `AuthorizationController` behaviour.
 */
export function AuthorizationPanel() {
  const { isEnabled } = useFeatureFlags();

  const enhancedRbac = isEnabled(FEATURE_FLAGS.ENHANCED_RBAC);
  const mfaEnforcement = isEnabled(FEATURE_FLAGS.MFA_ENFORCEMENT);
  const conditionalAccess = isEnabled(
    FEATURE_FLAGS.CONDITIONAL_ACCESS_POLICIES,
  );
  const betaFeatures = isEnabled(FEATURE_FLAGS.BETA_AUTHORIZATION_FEATURES);
  const auditLogging = isEnabled(FEATURE_FLAGS.DETAILED_AUDIT_LOGGING);
  const jitAccess = isEnabled(FEATURE_FLAGS.JIT_ACCESS_PROVISIONING);
  const externalIdP = isEnabled(FEATURE_FLAGS.EXTERNAL_IDENTITY_PROVIDERS);

  const [roles, setRoles] = useState<HierarchicalRole[]>([]);
  const [betaPolicies, setBetaPolicies] = useState<BetaPolicy[]>([]);
  const [mfaStatus, setMfaStatus] = useState<string>("Loading status...");

  // Fetch hierarchical roles if Enhanced RBAC is enabled
  useEffect(() => {
    if (enhancedRbac) {
      fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/authorization/permissions`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.hierarchicalRoles) {
            setRoles(data.hierarchicalRoles);
          }
        })
        .catch((err) => console.error("Failed to fetch roles", err));
    }
  }, [enhancedRbac]);

  // Fetch beta policies if enabled
  useEffect(() => {
    if (betaFeatures) {
      fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/authorization/beta/advanced-policies`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.policies) {
            setBetaPolicies(data.policies);
          }
        })
        .catch((err) => console.error("Failed to fetch beta policies", err));
    }
  }, [betaFeatures]);

  // Fetch MFA status
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/authorization/mfa-status`)
      .then((res) => res.json())
      .then((data) => {
        setMfaStatus(data.complianceStatus);
      })
      .catch((err) => {
        console.error("Failed to fetch MFA status", err);
        setMfaStatus("Unknown");
      });
  }, [mfaEnforcement]);

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
          <p>
            Enhanced RBAC is active. The following role hierarchy is in effect:
          </p>
          {roles.length > 0 ? (
            <ol className="role-list">
              {roles.map((role) => (
                <li key={role.name}>
                  {role.name}{" "}
                  <span className="role-badge">Level {role.level}</span>
                  {role.parentRole && <> — reports to {role.parentRole}</>}
                </li>
              ))}
            </ol>
          ) : (
            <ol className="role-list">
              <li>Loading roles...</li>
            </ol>
          )}
        </div>
      )}

      {/* ── MFA Enforcement ───────────────────────────────── */}
      <div className="auth-card" data-testid="mfa-card">
        <h3>🔐 MFA Status</h3>
        {mfaEnforcement ? (
          <p className="status-on">
            ✅ MFA enforcement is <strong>active</strong>. Status: {mfaStatus}.
            Users must complete multi-factor authentication before accessing
            sensitive resources.
          </p>
        ) : (
          <p className="status-off">
            ⚠️ MFA enforcement is <strong>disabled</strong>. Status: {mfaStatus}
            . Users can access resources without a second authentication factor.
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
        <div
          className="auth-card auth-card--beta"
          data-testid="beta-features-card"
        >
          <h3>🧪 Beta: Advanced Policies</h3>
          <p>
            You have access to the following experimental authorization
            policies:
          </p>
          {betaPolicies.length > 0 ? (
            <ul>
              {betaPolicies.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong> — {p.description}
                </li>
              ))}
            </ul>
          ) : (
            <ul>
              <li>
                <strong>TimeBasedAccess</strong> — Restrict access based on time
                of day
              </li>
              <li>
                <strong>LocationBasedAccess</strong> — Restrict access based on
                geographic location
              </li>
              <li>
                <strong>DeviceCompliance</strong> — Require device compliance
                for access
              </li>
            </ul>
          )}
          <small>
            Available to BetaTester / Admin roles and @university.edu email
            addresses.
          </small>
        </div>
      )}

      {/* ── Detailed Audit Logging ────────────────────────── */}
      {auditLogging && (
        <div className="auth-card" data-testid="audit-logging-card">
          <h3>📋 Detailed Audit Log</h3>
          <p>
            All authorization decisions are being recorded with full context.
          </p>
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
                <td>
                  {new Date().toISOString().replace("T", " ").slice(0, 19)}
                </td>
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
            <button
              type="button"
              className="idp-btn"
              aria-label="Sign in with Google"
            >
              Sign in with Google
            </button>
            <button
              type="button"
              className="idp-btn"
              aria-label="Sign in with GitHub"
            >
              Sign in with GitHub
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

/** Minimal JIT access request form (rendered only when JIT flag is on). */
function JitAccessForm() {
  const [result, setResult] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const resourceId = (
      form.elements.namedItem("jit-resource") as HTMLInputElement
    ).value;
    const durationHours = parseInt(
      (form.elements.namedItem("jit-duration") as HTMLInputElement).value,
    );
    const justification = (
      form.elements.namedItem("jit-justification") as HTMLTextAreaElement
    ).value;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/authorization/elevate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resourceId, durationHours, justification }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data.message);
      } else {
        setResult("Request failed: " + response.statusText);
      }
    } catch (error) {
      setResult("Error submitting request");
      console.error(error);
    }
  };

  return (
    <form
      className="jit-form"
      onSubmit={handleSubmit}
      aria-label="JIT Access Request Form"
    >
      <label htmlFor="jit-resource">Resource ID</label>
      <input
        id="jit-resource"
        name="jit-resource"
        type="text"
        placeholder="e.g. /reports/financials"
        required
      />

      <label htmlFor="jit-duration">Duration (hours)</label>
      <input
        id="jit-duration"
        name="jit-duration"
        type="number"
        min={1}
        max={8}
        defaultValue={1}
        required
      />

      <label htmlFor="jit-justification">Justification</label>
      <textarea
        id="jit-justification"
        name="jit-justification"
        rows={2}
        placeholder="Describe why elevated access is needed"
        required
      />

      <button type="submit" className="jit-submit-btn">
        Request Elevated Access
      </button>
      {result && <p className="jit-result">{result}</p>}
    </form>
  );
}
