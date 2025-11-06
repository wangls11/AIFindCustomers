/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_API_TIMEOUT: string;
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_ENV: string;
  // 添加更多环境变量类型定义
  // readonly VITE_XXX: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
