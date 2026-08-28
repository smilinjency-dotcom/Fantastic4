type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

/**
 * Reports an error from an error boundary or global handler.
 * Extend this function to forward errors to your own observability provider
 * (e.g. Sentry, Datadog, LogRocket) by adding a call here.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;

  // Log to console so errors are visible in server/browser logs.
  console.error("[error-boundary]", error, context);

  // Example: forward to Sentry
  // Sentry.captureException(error, { extra: context });
}
