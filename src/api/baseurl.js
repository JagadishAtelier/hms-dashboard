// src/api/baseurl.js

/**
 * Resolves the backend API base URL:
 * 1. Automatically connects to the local backend (port 4000) when browsing on localhost or local network.
 * 2. Honors explicit VITE_API_URL when deploying or pointing to a custom environment.
 * 3. Gracefully falls back to production Render backend when hosted remotely.
 */
const resolveBaseApi = () => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocalHost =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      host.startsWith("172.");

    // When running locally in browser, always target the local backend on port 4000
    // to ensure newly developed endpoints don't 404 against stale cloud deployments.
    if (isLocalHost) {
      if (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL.includes("localhost") || import.meta.env.VITE_API_URL.includes("127.0.0.1"))) {
        return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
      }
      return `http://${host}:4000/api/v1`;
    }
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  return "https://hms-be-0a13.onrender.com/api/v1";
};

export const BASE_API = resolveBaseApi();
export default BASE_API;
