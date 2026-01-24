// // src/config/api.js
// export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";
// src/config/api.js
const rawUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

// This helper ensures there is NO trailing slash, preventing 405/404 errors
export const API_BASE = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;