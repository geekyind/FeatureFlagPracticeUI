import { FeatureFlagProvider } from './context/FeatureFlagContext'
import { FeatureFlagDashboard } from './components/FeatureFlagDashboard'
import { AuthorizationPanel } from './components/AuthorizationPanel'
import './App.css'

function App() {
  return (
    <FeatureFlagProvider>
      <div className="app-layout">
        <header className="app-header">
          <h1>University Authorization — Feature Flags</h1>
          <p className="app-tagline">
            Toggle feature flags below to see how authorization behaviour changes
            across the platform.
          </p>
        </header>

        <main className="app-main">
          <FeatureFlagDashboard />
          <div className="app-divider" />
          <AuthorizationPanel />
        </main>
      </div>
    </FeatureFlagProvider>
  )
}

export default App
