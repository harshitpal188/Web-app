import axios from "axios";

/** Backend mounts routes under `/api`. Render env often forgets `/api` — normalize so login works. */
function getApiBase() {
  const raw = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
  let base = raw.replace(/\/+$/, "");
  if (!base.endsWith("/api")) {
    base = `${base}/api`;
  }
  return base;
}

const axiosClient = axios.create({
  baseURL: getApiBase(),
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
