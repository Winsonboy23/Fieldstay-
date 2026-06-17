const frontendBaseUrl = (
  import.meta.env.VITE_FRONTEND_URL ||
  import.meta.env.VITE_NOTIFY_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

export function getFrontendUrl(path = "") {
  const normalizedPath = path && !path.startsWith("/") ? `/${path}` : path;
  return `${frontendBaseUrl}${normalizedPath}`;
}
