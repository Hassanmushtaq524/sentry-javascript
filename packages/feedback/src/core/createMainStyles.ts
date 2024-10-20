import type { FeedbackInternalOptions } from '@sentry/types';
import { DOCUMENT } from '../constants';

const PURPLE = 'rgba(88, 74, 192, 1)';

interface InternalTheme extends NonNullable<FeedbackInternalOptions['themeLight']> {
  border: string;
  interactiveFilter: string;
}

const GREEN = 'rgba(34, 139, 34, 1)';

const DEFAULT_CUSTOM: InternalTheme = {
  foreground: '#1f2937', // dark navy
  background: '#f9fafb', // off-white
  accentForeground: '#ffffff', // white
  accentBackground: GREEN, // custom green color
  successColor: '#10b981', // light green
  errorColor: '#ef4444', // light red
  border: '2px solid rgba(31, 41, 55, 0.2)', // darker border
  boxShadow: '0px 6px 30px rgba(0, 0, 0, 0.15)', // stronger shadow
  outline: '2px auto var(--accent-background)',
  interactiveFilter: 'brightness(98%)',
};

const DEFAULT_LIGHT: InternalTheme = {
  foreground: '#2b2233',
  background: '#ffffff',
  accentForeground: 'white',
  accentBackground: PURPLE,
  successColor: '#268d75',
  errorColor: '#df3338',
  border: '1.5px solid rgba(41, 35, 47, 0.13)',
  boxShadow: '0px 4px 24px 0px rgba(43, 34, 51, 0.12)',
  outline: '1px auto var(--accent-background)',
  interactiveFilter: 'brightness(95%)',
};
const DEFAULT_DARK: InternalTheme = {
  foreground: '#ebe6ef',
  background: '#29232f',
  accentForeground: 'white',
  accentBackground: PURPLE,
  successColor: '#2da98c',
  errorColor: '#f55459',
  border: '1.5px solid rgba(235, 230, 239, 0.15)',
  boxShadow: '0px 4px 24px 0px rgba(43, 34, 51, 0.12)',
  outline: '1px auto var(--accent-background)',
  interactiveFilter: 'brightness(150%)',
};

function getThemedCssVariables(theme: InternalTheme): string {
  return `
  --foreground: ${theme.foreground};
  --background: ${theme.background};
  --accent-foreground: ${theme.accentForeground};
  --accent-background: ${theme.accentBackground};
  --success-color: ${theme.successColor};
  --error-color: ${theme.errorColor};
  --border: ${theme.border};
  --box-shadow: ${theme.boxShadow};
  --outline: ${theme.outline};
  --interactive-filter: ${theme.interactiveFilter};
  `;
}

/**
 * Creates <style> element for widget actor (button that opens the dialog)
 */
export function createMainStyles({
  colorScheme,
  themeDark,
  themeLight,
  themeCustom,
  styleNonce,
}: FeedbackInternalOptions): HTMLStyleElement {
  const style = DOCUMENT.createElement('style');
  style.textContent = `
:host {
  --font-family: system-ui, 'Helvetica Neue', Arial, sans-serif;
  --font-size: 14px;
  --z-index: 100000;

  --page-margin: 16px;
  --inset: auto 0 0 auto;
  --actor-inset: var(--inset);

  font-family: var(--font-family);
  font-size: var(--font-size);

  ${colorScheme !== 'system' ? 'color-scheme: only light;' : ''}

  ${getThemedCssVariables(
    colorScheme === 'dark' ? { ...DEFAULT_DARK, ...themeDark } : { ...DEFAULT_LIGHT, ...themeLight },
  )}
}

${
  colorScheme === 'system'
    ? `
@media (prefers-color-scheme: dark) {
  :host {
    ${getThemedCssVariables({ ...DEFAULT_DARK, ...themeDark })}
  }
}`
    : ''
}
}
`;

  if (styleNonce) {
    style.setAttribute('nonce', styleNonce);
  }

  return style;
}
