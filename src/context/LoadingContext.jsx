import React, { createContext, useContext, useState, useCallback } from 'react';
import LoadingOverlay from '../components/common/LoadingOverlay';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loadingState, setLoadingState] = useState({
    show: false,
    title: '',
    message: '',
  });

  const showLoading = useCallback((title = '', message = '') => {
    setLoadingState({
      show: true,
      title,
      message,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoadingState(prev => ({ ...prev, show: false }));
  }, []);

  /**
   * Helper to wrap any action or async function with loading overlay
   * Automatically shows loading for at least minDurationMs to give smooth UX
   */
  const withLoading = useCallback(async (
    title = '', 
    asyncFn, 
    minDurationMs = 700, 
    message = ''
  ) => {
    showLoading(title, message);
    const start = Date.now();
    try {
      let result;
      if (typeof asyncFn === 'function') {
        result = await asyncFn();
      } else {
        await new Promise(r => setTimeout(r, minDurationMs));
      }
      const elapsed = Date.now() - start;
      if (elapsed < minDurationMs) {
        await new Promise(r => setTimeout(r, minDurationMs - elapsed));
      }
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, withLoading, isLoading: loadingState.show }}>
      {children}
      <LoadingOverlay
        show={loadingState.show}
        title={loadingState.title}
        message={loadingState.message}
      />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
