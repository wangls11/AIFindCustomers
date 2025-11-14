import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchUserInfo, type UserInfo } from "@/api/user";

interface UserContextType {
  userInfo: UserInfo | null;
  refreshUserInfo: () => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshUserInfo = async () => {
    try {
      setLoading(true);
      const data = await fetchUserInfo();
      if (data) {
        setUserInfo(data);
      }
    } catch (error) {
      console.error("获取用户信息失败:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUserInfo();
  }, []);

  const value: UserContextType = {
    userInfo,
    refreshUserInfo,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
