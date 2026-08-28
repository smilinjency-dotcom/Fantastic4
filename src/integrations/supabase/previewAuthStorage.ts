// Auth storage — always uses localStorage.
// The Lovable preview-iframe postMessage brokering layer has been removed
// since this project is no longer hosted on lovable.dev / lovableproject.com.
export function brokeredPreviewStorage() {
  if (typeof window === "undefined") return undefined;
  return localStorage;
}
