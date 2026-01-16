import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated by calling /auth/me
    // This will use the HTTP-only cookie automatically
    authService
      .getMe()
      .then((response) => {
        setUser(response.data.data);
      })
      .catch(() => {
        // Not authenticated or token expired
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    // Cookie is set automatically by the server
    // Get user data from response
    setUser(response.data.data.user);
    return response;
  };

  const register = async (name, email, password) => {
    const response = await authService.register(name, email, password);
    // Cookie is set automatically by the server
    // Get user data from response
    setUser(response.data.data.user);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Even if logout fails, clear user state
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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

