export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export function wsBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_WS_BASE_URL;
  if (explicit) return explicit;
  return API_BASE_URL.replace(/^http/, "ws");
}

export const TOKEN_STORAGE_KEY = "fwf_token";
