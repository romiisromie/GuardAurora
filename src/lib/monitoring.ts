import * as Sentry from '@sentry/react-native';
import { Config } from '../config';

let started = false;

export function initMonitoring() {
  if (started) return;
  started = true;
  if (!Config.sentryDsn) return;
  Sentry.init({
    dsn: Config.sentryDsn,
    enabled: true,
    tracesSampleRate: 0.1,
  });
}

export function captureException(error: unknown, context?: string) {
  if (context) console.warn(context, error);
  else console.warn(error);
  if (Config.sentryDsn) {
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  }
}
