import { useThemeContext } from '../app/providers/ThemeProvider';

/**
 * Custom hook to access theme properties and actions.
 * Complies with AGENT_INSTRUCTIONS.md architecture guidelines.
 */
export function useTheme() {
  return useThemeContext();
}
