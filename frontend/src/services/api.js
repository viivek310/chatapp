// Centralized API Client

const getBaseUrl = () => {
  const envApi = import.meta.env.VITE_BACKEND_API;
  if (envApi) {
    return envApi.endsWith("/") ? envApi.slice(0, -1) : envApi;
  }
  // In production served from Express, relative requests to /api work natively
  return "";
};

export const API_BASE_URL = getBaseUrl();

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  let token = null;
  try {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    token = userInfo?.token;
  } catch (e) {
    // ignore
  }

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem("userInfo");
    if (window.location.pathname !== "/") {
      window.location.href = "/";
    }
  }

  const data = await response.json().catch(() => ({}));
  return { status: response.status, ok: response.ok, ...data };
};

export const api = {
  get: (endpoint, options) => apiRequest(endpoint, { method: "GET", ...options }),
  post: (endpoint, body, options) =>
    apiRequest(endpoint, { method: "POST", body: JSON.stringify(body), ...options }),
  put: (endpoint, body, options) =>
    apiRequest(endpoint, { method: "PUT", body: JSON.stringify(body), ...options }),
  delete: (endpoint, options) => apiRequest(endpoint, { method: "DELETE", ...options }),
};
