import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getStoredUser, logout as authLogout, getMe } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  // Re-validate token on mount
  useEffect(() => {
    if (localStorage.getItem('token')) {
      getMe()
        .then((u) => { setUser(u); localStorage.setItem('user', JSON.stringify(u)); })
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback((userData) => {
    setUser(userData);
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
