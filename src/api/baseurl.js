// src/api/baseurl.js

/**
 * Resolves the backend API base URL:
 * 1. Honors explicit VITE_API_URL environment variable if set.
 * 2. Automatically defaults to local backend (http://localhost:4000/api/v1) when running on localhost.
 * 3. Gracefully falls back to production Render backend when hosted remotely.
 */
const resolveBaseApi = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:4000/api/v1";
    }
  }

  return "https://hms-be-0a13.onrender.com/api/v1";
};

export const BASE_API = resolveBaseApi();
export default BASE_API;


