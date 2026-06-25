import type { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { ErrorBoundary } from '@components/common/ErrorBoundary';
import { store } from '@store/index';
import { ThemeProvider } from '@theme/theme.provider';

/**
 * Composition of every provider that wraps the whole app:
 *   ErrorBoundary → Redux → Theme.
 *
 * Order matters:
 *  - Redux must wrap Theme because the theme slice lives in the store.
 *  - ErrorBoundary wraps everything so a provider crash is still caught.
 */
interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps): JSX.Element => (
  <ErrorBoundary>
    <ReduxProvider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReduxProvider>
  </ErrorBoundary>
);
