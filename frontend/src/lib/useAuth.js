/**
 * Custom Hook for Authentication
 * 
 * Provides authentication state and protection for pages.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getCurrentUser, clearAuthData } from './auth';

/**
 * Hook to protect pages that require authentication
 * @param {boolean} redirectIfNotAuth - Whether to redirect to login if not authenticated
 * @returns {object} { user, loading, isAuth }
 */
export function useAuth(redirectIfNotAuth = true) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      const currentUser = getCurrentUser();

      if (!authenticated && redirectIfNotAuth) {
        // Not authenticated and should redirect
        clearAuthData();
        router.push('/login');
        return;
      }

      setIsAuth(authenticated);
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();
  }, [router, redirectIfNotAuth]);

  return {
    user,
    loading,
    isAuth,
  };
}

/**
 * Hook to handle logout
 * @returns {function} logout function
 */
export function useLogout() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthData();
    router.push('/login');
  };

  return handleLogout;
}
