import { createContext, useContext, useState, useEffect } from 'react';
import { Auth, API } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (Auth.isLoggedIn()) {
      API.user.profile()
        .then((data) => setUser(data))
        .catch(() => { Auth.clear(); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const tokens = await API.user.login(email, password);
    Auth.setTokens(tokens.access_token, tokens.refresh_token);
    const profile = await API.user.profile();
    setUser(profile);
    return profile;
  };

  const logout = () => {
    Auth.clear();
    setUser(null);
  };

  const refreshUser = async () => {
    const profile = await API.user.profile();
    setUser(profile);
    return profile;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
