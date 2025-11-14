import { useState, useEffect } from "react";
import "./App.css";
import { RouterProvider } from "react-router";
import router from "./router";
import { getToken, initAuth } from "./utils/auth";
import CenterLayout from "./components/CenterLayout";
import { UserProvider } from "./contexts/UserContext";

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsInitializing(true);
        setInitError(null);

        // 检查是否已有token
        const existingToken = getToken();
        if (existingToken) {
          return;
        }

        // 没有token，需要进行认证初始化
        await initAuth();
      } catch (error) {
        setInitError(error instanceof Error ? error.message : "认证初始化失败");
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  // Loading 状态
  if (isInitializing) {
    return <CenterLayout status="loading" loadingText="正在初始化认证系统..." />;
  }

  // 错误状态
  if (initError) {
    return (
      <CenterLayout
        status="error"
        errorTitle="认证初始化失败"
        errorMessage={initError}
        onReload={() => window.location.reload()}
      />
    );
  }

  // 正常渲染
  return (
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  );
}
