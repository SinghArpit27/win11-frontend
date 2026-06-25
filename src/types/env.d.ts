/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';

  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_PREFIX: string;
  readonly VITE_API_TIMEOUT_MS: string;

  readonly VITE_SOCKET_URL: string;
  readonly VITE_SOCKET_PATH: string;
  readonly VITE_SOCKET_TRANSPORTS: string;

  readonly VITE_DEFAULT_THEME_ID: string;
  readonly VITE_DEFAULT_THEME_MODE: 'dark' | 'light' | 'system';
  readonly VITE_THEME_REMOTE_CONFIG_ENABLED: string;

  readonly VITE_FEATURE_PWA: string;
  readonly VITE_FEATURE_ANALYTICS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
