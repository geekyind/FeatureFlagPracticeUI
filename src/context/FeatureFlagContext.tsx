/* eslint-disable react-refresh/only-export-components -- context and provider are intentionally co-located */
import React, { createContext, useCallback, useEffect, useState } from "react";
import { DEFAULT_FLAG_VALUES, type FeatureFlagName } from "../featureFlags";

export interface FeatureFlagContextValue {
  /** Current state of every feature flag. */
  flags: Record<FeatureFlagName, boolean>;
  /** Returns true when the named flag is enabled. */
  isEnabled: (flag: FeatureFlagName) => boolean;
  /** Toggle a single flag on/off. */
  toggleFlag: (flag: FeatureFlagName) => void;
  /** Set a flag to an explicit value. */
  setFlag: (flag: FeatureFlagName, enabled: boolean) => void;
  /** Reset all flags to the default values. */
  resetFlags: () => void;
}

export const FeatureFlagContext = createContext<FeatureFlagContextValue | null>(
  null,
);

interface FeatureFlagProviderProps {
  children: React.ReactNode;
  /** Override initial flag values (useful in tests or Storybook). */
  initialFlags?: Partial<Record<FeatureFlagName, boolean>>;
}

/**
 * `FeatureFlagProvider` wraps the application and makes feature flag state
 * available to every child component via `useFeatureFlags`.
 *
 * The initial values mirror the backend `appsettings.json` defaults.
 * In a production application you would hydrate these values from an API call
 * to `GET /api/featureflags` on mount.
 */
export function FeatureFlagProvider({
  children,
  initialFlags,
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<Record<FeatureFlagName, boolean>>({
    ...DEFAULT_FLAG_VALUES,
    ...initialFlags,
  });

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/featureflags`,
        );
        if (response.ok) {
          const data: Record<string, boolean> = await response.json();

          // Map backend camelCase keys to frontend PascalCase keys if necessary
          // or just assume the backend returns what we expect if we configured it so.
          // However, assuming standard .NET camelCase response:
          // We need to map 'enhancedRbac' -> 'EnhancedRbac'

          const mappedFlags: Partial<Record<FeatureFlagName, boolean>> = {};

          // Helper to capitalize first letter
          const capitalize = (s: string) =>
            s.charAt(0).toUpperCase() + s.slice(1);

          Object.entries(data).forEach(([key, value]) => {
            // If the key is already PascalCase (unlikely with default .NET), use it.
            // If it is camelCase, convert to PascalCase to match our constants.
            const pascalKey = capitalize(key) as FeatureFlagName;
            mappedFlags[pascalKey] = value;
          });

          setFlags((prev) => ({ ...prev, ...mappedFlags }));
        } else {
          console.error("Failed to fetch feature flags:", response.statusText);
        }
      } catch (error) {
        console.error("Failed to fetch feature flags", error);
      }
    };

    fetchFlags();
  }, []);

  const isEnabled = useCallback(
    (flag: FeatureFlagName) => flags[flag] ?? false,
    [flags],
  );

  const toggleFlag = useCallback((flag: FeatureFlagName) => {
    setFlags((prev) => ({ ...prev, [flag]: !prev[flag] }));
  }, []);

  const setFlag = useCallback((flag: FeatureFlagName, enabled: boolean) => {
    setFlags((prev) => ({ ...prev, [flag]: enabled }));
  }, []);

  const resetFlags = useCallback(() => {
    setFlags({ ...DEFAULT_FLAG_VALUES });
  }, []);

  return (
    <FeatureFlagContext.Provider
      value={{ flags, isEnabled, toggleFlag, setFlag, resetFlags }}
    >
      {children}
    </FeatureFlagContext.Provider>
  );
}
