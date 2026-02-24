import { FEATURE_FLAGS, FEATURE_FLAG_METADATA, type FeatureFlagName } from '../featureFlags'
import { useFeatureFlags } from '../hooks/useFeatureFlags'
import './FeatureFlagDashboard.css'

/**
 * `FeatureFlagDashboard` displays every authorization feature flag with a
 * toggle control.  Administrators can use this panel to enable/disable flags
 * at runtime without redeploying the application.
 *
 * In a production environment the toggle would call the backend API to
 * persist the change.  Here the state is kept in memory via `FeatureFlagContext`.
 */
export function FeatureFlagDashboard() {
  const { flags, toggleFlag, resetFlags } = useFeatureFlags()
  const flagNames = Object.values(FEATURE_FLAGS) as FeatureFlagName[]

  return (
    <section className="ffd-container" aria-label="Feature Flag Dashboard">
      <header className="ffd-header">
        <h2>Feature Flag Dashboard</h2>
        <button
          className="ffd-reset-btn"
          onClick={resetFlags}
          type="button"
          aria-label="Reset all flags to defaults"
        >
          Reset to Defaults
        </button>
      </header>

      <ul className="ffd-list" role="list">
        {flagNames.map((name) => {
          const { label, description } = FEATURE_FLAG_METADATA[name]
          const enabled = flags[name]

          return (
            <li key={name} className="ffd-item">
              <div className="ffd-info">
                <span className="ffd-label">{label}</span>
                <span className="ffd-description">{description}</span>
              </div>
              <label className="ffd-toggle" htmlFor={`flag-${name}`}>
                <input
                  id={`flag-${name}`}
                  type="checkbox"
                  role="switch"
                  checked={enabled}
                  onChange={() => toggleFlag(name)}
                  aria-label={`Toggle ${label}`}
                />
                <span className="ffd-slider" />
                <span className="ffd-status">{enabled ? 'ON' : 'OFF'}</span>
              </label>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
