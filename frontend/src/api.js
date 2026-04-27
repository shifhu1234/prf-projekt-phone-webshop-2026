const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const request = async (path, options = {}) => {
  const headers = options.headers || {};
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || "Request failed";
    throw new Error(message);
  }

  return data;
};

export const apiGet = (path) => request(path);
export const apiPost = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });
export const apiPut = (path, body) =>
  request(path, { method: "PUT", body: JSON.stringify(body) });
export const apiDelete = (path) => request(path, { method: "DELETE" });
