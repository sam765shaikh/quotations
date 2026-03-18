import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const tokenKey = 'quotation_token';
const userKey = 'quotation_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(!!localStorage.getItem(tokenKey));

  const setToken = (newToken, userData) => {
    if (newToken) {
      localStorage.setItem(tokenKey, newToken);
      if (userData) localStorage.setItem(userKey, JSON.stringify(userData));
      setTokenState(newToken);
      setUser(userData || JSON.parse(localStorage.getItem(userKey)));
    } else {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(userKey);
      setTokenState(null);
      setUser(null);
    }
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setUser(data);
        localStorage.setItem(userKey, JSON.stringify(data));
      })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, [token]);

  const login = (newToken, userData) => setToken(newToken, userData);
  const logout = () => setToken(null);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
