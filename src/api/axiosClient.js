import axios from 'axios';
import { isTokenValid } from '../utils/authSecurity';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request interceptor: attach token only if valid
axiosClient.interceptors.request.use(
  (config) => {
    const isLoginEndpoint = config.url && config.url.includes('/auth/login');
    if (!isLoginEndpoint) {
      const token = localStorage.getItem('hr_payroll_token');
      if (token) {
        if (isTokenValid(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        } else {
          // Token expired client-side: prevent leaking or sending stale token
          console.warn('[Security] Outdated/expired JWT detected in storage. Evicting session.');
          localStorage.removeItem('hr_payroll_token');
          localStorage.removeItem('hr_payroll_user');
          window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { reason: 'expired' } }));
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token revocation & session termination
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isLoginRequest = error.config?.url?.includes('/auth/login');
      if (!isLoginRequest) {
        console.warn('[Security] 401 Unauthorized from server: terminating session.');
        localStorage.removeItem('hr_payroll_token');
        localStorage.removeItem('hr_payroll_user');
        window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { reason: 'unauthorized' } }));
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
