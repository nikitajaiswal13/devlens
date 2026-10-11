import React, { useEffect, useState, useTransition } from 'react';
import type { User, LoginPayload, RegisterPayload } from '../types/auth';
import { authApi, tokenStorage, ApiError } from '../services/api';
import { AuthContext } from './authContextBase';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(tokenStorage.get());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      const storedToken = tokenStorage.get();

      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setToken(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        if (isMounted) {
          startTransition(() => {
            setUser(response.user);
            setToken(storedToken);
            setIsLoading(false);
          });
        }
      } catch {
        // Token is invalid or expired
        tokenStorage.remove();
        if (isMounted) {
          startTransition(() => {
            setUser(null);
            setToken(null);
            setIsLoading(false);
          });
        }
      }
    }

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (payload: LoginPayload): Promise<void> => {
    try {
      const data = await authApi.login(payload);
      tokenStorage.set(data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error('Login failed. Please try again.', { cause: err });
    }
  };

  const register = async (payload: RegisterPayload): Promise<void> => {
    try {
      const data = await authApi.register(payload);
      tokenStorage.set(data.token);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      }
      throw new Error('Registration failed. Please try again.', { cause: err });
    }
  };

  const logout = () => {
    tokenStorage.remove();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(user && token),
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
