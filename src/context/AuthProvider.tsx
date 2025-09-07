import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./AuthContext";
import AuthService from "../services/auth";
import { toast } from "react-toastify";

import type { Login, UserResponse } from "../types";
import { getLocalStorage, localStorageKeys, removeLocalStorage, setLocalStorage } from "../lib/utils";

type Session = {
  access_token: string;
  refresh_token: string;
  expiresAt: number;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const refreshTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshInProgressRef = useRef(false);

  // Initialize state
  const [user, setUser] = useState<UserResponse | null>(() => {
    const storedUser = getLocalStorage("user");
    if (typeof storedUser === "string") {
      try {
        return JSON.parse(storedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!getLocalStorage("accessToken");
  });
  const [isSidenav, setIsSidenav] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // ------------------
  // Helpers
  // ------------------

  const saveSession = (session: Session) => {
    setLocalStorage(localStorageKeys.session, JSON.stringify(session));
    setLocalStorage("accessToken", session.access_token);
    setLocalStorage("refreshToken", session.refresh_token);
    scheduleTokenRefresh(session.expiresAt, refreshTokens);
  };

  const clearSession = () => {
    removeLocalStorage("user");
    removeLocalStorage("accessToken");
    removeLocalStorage("refreshToken");
    removeLocalStorage(localStorageKeys.session);
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };

  // ------------------
  // Auth Handlers
  // ------------------

  const handleLogin = async (formData: Login) => {
    setIsLoading(true);
    try {
      const payload = Object.entries(formData).reduce<Record<string, string>>((acc, [key, value]) => { acc[key] = value !== undefined ? String(value) : ""; return acc; }, {});
      const loginResponse = await AuthService.login(payload) as | {
        success?: boolean;
        data?: {
          access_token: string[];
          refresh_token: string[];
          user: UserResponse;
        };
      } | undefined;

      if (!loginResponse?.success) {
        throw new Error("Invalid credentials");
      }

      const accessToken = loginResponse?.data?.access_token?.[0];
      const refreshToken = loginResponse?.data?.refresh_token?.[0];

      if (!accessToken || !refreshToken) {
        throw new Error("Missing access or refresh token");
      }

      const session: Session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expiresAt: Date.now() + 3600 * 1000, // 1h expiry
      };

      saveSession(session);
      if (loginResponse?.success) {
        setUser(loginResponse?.data?.user ?? null);
        setIsAuthenticated(true);
        setLocalStorage("user", JSON.stringify(loginResponse?.data?.user));
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (err) {
      clearSession();
      toast.error("Authentication failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  // ------------------
  // Token Refresh
  // ------------------

  const refreshTokens = async () => {
    if (refreshInProgressRef.current) return;
    refreshInProgressRef.current = true;

    const sessionStr = getLocalStorage(localStorageKeys.session);
    if (!sessionStr) {
      handleLogout();
      return;
    }
debugger
    try {
      const session: Session = typeof sessionStr === "string" ? JSON.parse(sessionStr) : {} as Session;
      const resp = await AuthService.refreshToken({ refresh_token: session.refresh_token }) as {
        access_token: string;
        refresh_token: string;
      } | null | undefined;

      if (!resp?.access_token || !resp?.refresh_token) {
        throw new Error("Invalid refresh response");
      }

      const newSession: Session = {
        access_token: resp.access_token,
        refresh_token: resp.refresh_token,
        expiresAt: Date.now() + 3600 * 1000,
      };
      console.log("Token refreshed*********");
      saveSession(newSession);
    } catch (err) {
      console.error("Token refresh failed:", err);
      handleLogout();
    } finally {
      refreshInProgressRef.current = false;
    }
  };

  const scheduleTokenRefresh = (expiresAt: number, refreshFn: () => void) => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    const timeout = expiresAt - Date.now() - 60 * 1000; // refresh 1 min early
    refreshTimeoutRef.current = setTimeout(refreshFn, Math.max(timeout, 0));
  };

useEffect(() => {
  const session = getLocalStorage<Session>(localStorageKeys.session);
  if (!session) {
    clearSession();
    return;
  }

  // Mark authenticated immediately
  setIsAuthenticated(true);

  // Restore user from localStorage if available
  const storedUser = getLocalStorage<UserResponse>("user");
  if (storedUser) {
    setUser(storedUser);
  } else {
    // Or re-fetch if not stored
    AuthService.getUser()
      .then((res) => {
        if (res?.code === 200) {
          setUser(res.data);
          setLocalStorage("user", JSON.stringify(res.data));
        } else {
          handleLogout();
        }
      })
      .catch(() => handleLogout());
  }

  // Schedule refresh
  scheduleTokenRefresh(session.expiresAt, refreshTokens);

  return () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);


  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        isSidenav,
        toggleSidenav: () => setIsSidenav((p) => !p),
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
