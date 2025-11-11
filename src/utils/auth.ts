import { login } from "@/api/user";
import type { LoginParams } from "@/api/user";
import { bitable } from "@lark-base-open/js-sdk";

/**
 * 应用启动时的认证初始化
 * 自动从 bitable.bridge 获取 open_id 和 tenant_key
 */
export async function initAuth(): Promise<void> {
  try {
    // 从 bitable.bridge 获取登录参数
    const openId = await bitable.bridge.getUserId();
    const tenantKey = await bitable.bridge.getTenantKey();

    const loginParams: LoginParams = { open_id: openId, tenant_key: tenantKey };

    // 使用获取的参数进行初始化
    await initTokenManager(loginParams);
  } catch (error) {
    throw error;
  }
}

// token管理器的状态
interface TokenManagerState {
  token: string | null;
  isRefreshing: boolean;
  pendingRequests: (() => Promise<any>)[];
}

// 内部状态
const state: TokenManagerState = {
  token: null,
  isRefreshing: false,
  pendingRequests: [],
};

// localStorage key
const TOKEN_KEY = "auth_token";

/**
 * 保存token到localStorage
 */
function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  state.token = token;
}

/**
 * 从localStorage获取token
 */
function getStoredToken(): string | null {
  // if (state.token) {
  //   return state.token;
  // }

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    state.token = token;
  }
  return token;
}

/**
 * 重置认证状态
 * 清除所有相关状态，包括 token、刷新状态和待处理请求队列
 */
function resetAuthState(): void {
  clearToken();
  state.isRefreshing = false;
  state.pendingRequests = [];
}

/**
 * 清除localStorage中的token
 */
function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  state.token = null;
}

/**
 * 执行登录获取新token
 */
async function performLogin(params: LoginParams): Promise<string> {
  const resp = await login(params);

  if (resp.tokenValue) {
    saveToken(resp.tokenValue);
    return resp.tokenValue;
  } else {
    throw new Error("登录失败，未获取到token");
  }
}

/**
 * 重新执行待处理的请求
 */
async function retryPendingRequests(): Promise<void> {
  const requests = [...state.pendingRequests];
  state.pendingRequests = [];

  for (const request of requests) {
    try {
      await request();
    } catch (error) {
      console.error("重试请求失败:", error);
    }
  }
  
  // 确保队列被清空
  state.pendingRequests = [];
}

/**
 * 初始化token管理器
 * 在应用启动时调用
 */
export async function initTokenManager(params: LoginParams): Promise<void> {
  const existingToken = getStoredToken();

  if (!existingToken) {
    // 没有token，执行登录
    await performLogin(params);
  }
  // 如果有token，暂不验证其有效性
  // 有效性将在实际请求中验证
}

/**
 * 获取当前token
 */
export function getToken(): string | null {
  return getStoredToken();
}

/**
 * 清除token
 */
export function clearAuthToken(): void {
  resetAuthState();
}

/**
 * 处理token过期的情况
 * @param originalRequest 原始请求函数
 */
export async function handleTokenExpired<T>(originalRequest: () => Promise<T>): Promise<T> {
  // 如果正在刷新，等待刷新完成
  if (state.isRefreshing) {
    return new Promise<T>((resolve, reject) => {
      state.pendingRequests.push(async () => {
        try {
          const result = await originalRequest();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // 开始刷新token
  state.isRefreshing = true;

  try {
    // 从 bitable.bridge 获取最新的登录参数
    const openId = await bitable.bridge.getUserId();
    const tenantKey = await bitable.bridge.getTenantKey();

    const loginParams: LoginParams = { open_id: openId, tenant_key: tenantKey };

    // 执行登录获取新token
    await performLogin(loginParams);

    // 重试所有待处理的请求
    await retryPendingRequests();

    // 重试当前请求
    return await originalRequest();
  } catch (error) {
    // 登录失败，重置认证状态并抛出错误
    resetAuthState();
    throw error;
  } finally {
    state.isRefreshing = false;
  }
}

/**
 * 自动处理token过期检查
 * @param error 错误对象
 * @param originalRequest 原始请求函数
 */
export async function checkAndHandleTokenExpired<T>(
  error: any,
  originalRequest: () => Promise<T>,
): Promise<T> {
  // 检查是否是token过期错误（code: 4000）
  if (error?.code === 4000 || error?.response?.code === 4000) {
    return await handleTokenExpired(originalRequest);
  }

  // 不是token过期错误，直接抛出
  throw error;
}

/**
 * 重新登录
 * @param params 登录参数
 */
export async function reLogin(params: LoginParams): Promise<string> {
  // 重置所有认证状态
  resetAuthState();
  
  return await performLogin(params);
}
