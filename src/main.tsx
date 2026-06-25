import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from '@app/App';
import { appConfig } from '@config/index';
import { errorReporter, installGlobalErrorHandlers } from '@services/logging';
import { logger } from '@utils/logger';

import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

logger.info('app boot', {
  app: appConfig.appName,
  version: appConfig.appVersion,
  env: appConfig.environment,
});

// Initialise error reporting + window-level catchers BEFORE the React
// tree mounts so we don't miss runtime errors that fire during render.
// `errorReporter.useAdapter(sentryAdapter)` from here once the SDK is
// installed; the console adapter is the default.
void errorReporter.init();
installGlobalErrorHandlers();

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
