import React, { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getUserInfo } from "@/api/user";
import { getToken } from "@/utils/auth";
import type { LoginVO } from "@/api/user";

const STORAGE_KEY = "currentUser";

type UserContextValue = {
  user: LoginVO | null;
  setUser: (u: LoginVO | null) => void;
  clearUser: () => void;
  loading: boolean;
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<LoginVO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const setUser = (u: LoginVO | null) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (e) {
      // ignore storage errors
      console.warn("UserContext: failed to persist user to localStorage", e);
    }
  };

  const clearUser = () => setUser(null);

  useEffect(() => {
    // Load from cache first
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LoginVO;
        setUserState(parsed);
      }
    } catch (e) {
      // ignore parse errors
    }

    let mounted = true;

    const fetchUser = async () => {
      setLoading(true);
      try {
        // Only call getUserInfo when we have a token; otherwise wait until auth initializes.
        const token = getToken();
        if (!token) {
          // no token yet, skip fetch (there may be cached user already)
          return;
        }

        const res: any = await getUserInfo();

        // The project's request util sometimes returns res.data directly.
        // Handle both shapes: { data: LoginVO } or LoginVO
        let data: LoginVO | null = null;
        if (res == null) {
          data = null;
        } else if (typeof res === "object" && "data" in res) {
          data = (res as any).data as LoginVO;
        } else {
          data = res as LoginVO;
        }

        if (mounted && data) {
          setUser(data);
        }
      } catch (err) {
        // ignore errors (user not logged in etc.)
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Call once on mount to refresh cached user (only if token exists)
    fetchUser();

    // If there's no token yet, watch for a token for a short period and fetch when it appears.
    let intervalId: number | null = null;
    if (!getToken()) {
      let attempts = 0;
      const maxAttempts = 20; // ~10 seconds at 500ms interval
      intervalId = window.setInterval(() => {
        attempts += 1;
        const tokenNow = getToken();
        if (tokenNow) {
          fetchUser();
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        } else if (attempts >= maxAttempts) {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
          // stop waiting; set loading false if still loading
          if (mounted) setLoading(false);
        }
      }, 500);
    }

    return () => {
      mounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};

export default UserContext;
