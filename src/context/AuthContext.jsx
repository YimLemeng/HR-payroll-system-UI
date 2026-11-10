import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import axiosClient from '../api/axiosClient';
import { isTokenValid, parseJwt, getTokenRemainingTime } from '../utils/authSecurity';

const AuthContext = createContext();

// 30 minutes inactivity timeout for enterprise HR/payroll privacy
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  // Validate token on initial load - purge immediately if expired or tampered
  const [token, setToken] = useState(() => {
    const saved = localStorage.getItem('hr_payroll_token');
    if (saved && isTokenValid(saved)) {
      return saved;
    }
    localStorage.removeItem('hr_payroll_token');
    localStorage.removeItem('hr_payroll_user');
    return null;
  });

  const [user, setUser] = useState(() => {
    const savedToken = localStorage.getItem('hr_payroll_token');
    if (!savedToken || !isTokenValid(savedToken)) {
      return null;
    }
    const savedUser = localStorage.getItem('hr_payroll_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isInitializing, setIsInitializing] = useState(true);
  const [sessionNotice, setSessionNotice] = useState(null);
  const inactivityTimerRef = useRef(null);
  const expirationTimerRef = useRef(null);

  // Core clean state purger
  const purgeAuth = useCallback((notice = null) => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('hr_payroll_token');
    localStorage.removeItem('hr_payroll_user');
    if (notice) {
      setSessionNotice(notice);
      setTimeout(() => setSessionNotice(null), 8000);
    }
  }, []);

  // Standard Logout
  const logout = useCallback(async (reason = null) => {
    try {
      const activeToken = localStorage.getItem('hr_payroll_token');
      if (activeToken) {
        // Notify backend to blacklist token in Redis
        await axiosClient.post('/auth/logout');
      }
    } catch (err) {
      console.warn('[Security] Server logout notification error (token local discard will proceed):', err);
    } finally {
      purgeAuth(reason);
    }
  }, [purgeAuth]);

  // Login handler
  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login', {
        usernameOrEmail: username.trim(),
        username: username.trim(),
        password: password,
      });

      const { token: jwtToken, ...userData } = response.data;

      // Extract verified role and info directly from JWT payload for tamper resistance
      const jwtClaims = parseJwt(jwtToken);
      const verifiedRole = (jwtClaims?.role || userData.role || 'HR').replace('ROLE_', '');

      const normalizedUser = {
        ...userData,
        userId: jwtClaims?.userId || userData.userId,
        username: jwtClaims?.sub || userData.username || username.trim(),
        userName: jwtClaims?.sub || userData.userName || username.trim(),
        role: verifiedRole,
        email: jwtClaims?.email || userData.email,
      };

      setToken(jwtToken);
      setUser(normalizedUser);
      setSessionNotice(null);

      localStorage.setItem('hr_payroll_token', jwtToken);
      localStorage.setItem('hr_payroll_user', JSON.stringify(normalizedUser));

      return { success: true };
    } catch (error) {
      console.error('[Security] Authentication failed:', error);
      const validationErrors = error.response?.data?.validationErrors;
      const errorMsg =
        validationErrors && typeof validationErrors === 'object'
          ? Object.values(validationErrors).join(', ')
          : error.response?.data?.message || 'Invalid username or password';
      return { success: false, error: errorMsg };
    }
  };

  // 1. Multi-Tab Session Synchronization (Storage Listener)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'hr_payroll_token') {
        if (!e.newValue) {
          // Another tab logged out
          console.info('[Security] Session revoked in another tab. Synchronizing logout.');
          purgeAuth('Session logged out from another window.');
        } else if (isTokenValid(e.newValue)) {
          // Another tab logged in
          setToken(e.newValue);
          const savedUser = localStorage.getItem('hr_payroll_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [purgeAuth]);

  // 2. React to Axios 401 Unauthorized / Token Expiration events
  useEffect(() => {
    const handleUnauthorized = (e) => {
      const reason = e?.detail?.reason === 'expired'
        ? 'Your login session has expired. Please sign in again.'
        : 'Your session has ended or credentials were invalidated. Please sign in again.';
      purgeAuth(reason);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [purgeAuth]);

  // 3. Automated Token Expiration Watchdog
  useEffect(() => {
    if (!token) return;

    const remainingTime = getTokenRemainingTime(token);
    if (remainingTime <= 0) {
      logout('Your session has expired. Please sign in again.');
      return;
    }

    if (expirationTimerRef.current) {
      clearTimeout(expirationTimerRef.current);
    }

    expirationTimerRef.current = setTimeout(() => {
      console.warn('[Security] JWT token lifetime elapsed. Auto logging out.');
      logout('Your session has expired. Please sign in again.');
    }, remainingTime);

    return () => {
      if (expirationTimerRef.current) {
        clearTimeout(expirationTimerRef.current);
      }
    };
  }, [token, logout]);

  // 4. Inactivity Watchdog (Idle Auto-Logout)
  useEffect(() => {
    if (!token) return;

    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      inactivityTimerRef.current = setTimeout(() => {
        console.warn('[Security] User idle timeout triggered.');
        logout('Session timed out due to 30 minutes of inactivity for security.');
      }, INACTIVITY_TIMEOUT_MS);
    };

    // User activity listeners
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetInactivityTimer, { passive: true }));
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
    };
  }, [token, logout]);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated: !!token && isTokenValid(token),
        isInitializing,
        sessionNotice,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
