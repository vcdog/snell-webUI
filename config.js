// API Configuration
// In production, change this to your actual backend URL
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:9090'  // Development: backend on port 9090
    : window.location.origin;   // Production: same origin (use nginx proxy)

export default API_BASE_URL;
