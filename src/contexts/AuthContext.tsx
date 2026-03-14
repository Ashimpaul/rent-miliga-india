import React, { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  login: () => false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("rentmilega_admin") === "true";
    }
    return false;
  });

  const login = (password: string): boolean => {
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "Admin###102";
    if (password === adminPassword) {
      setIsAdmin(true);
      localStorage.setItem("rentmilega_admin", "true");
      return true;
    }
    return false;
  };

  const logout = (): void => {
    setIsAdmin(false);
    localStorage.removeItem("rentmilega_admin");
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
