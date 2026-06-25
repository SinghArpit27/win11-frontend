import { appConfig } from '@config/index';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const MIN_LEVEL: LogLevel = appConfig.environment === 'production' ? 'warn' : 'debug';

const enabled = (level: LogLevel): boolean => LEVEL_ORDER[level] >= LEVEL_ORDER[MIN_LEVEL];

const tag = `[${appConfig.appName}]`;

/**
 * Minimal structured logger. We intentionally avoid pulling Pino into
 * the browser bundle — `console.*` is enough for client logs and keeps
 * the bundle small. Production builds suppress `debug` + `info`.
 */
export const logger = {
  debug: (...args: unknown[]): void => {
    if (enabled('debug')) console.debug(tag, ...args);
  },
  info: (...args: unknown[]): void => {
    if (enabled('info')) console.info(tag, ...args);
  },
  warn: (...args: unknown[]): void => {
    if (enabled('warn')) console.warn(tag, ...args);
  },
  error: (...args: unknown[]): void => {
    if (enabled('error')) console.error(tag, ...args);
  },
};
