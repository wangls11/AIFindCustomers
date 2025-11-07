import { Toast } from "@douyinfe/semi-ui";

// 定义响应数据类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 请求配置类型（兼容原 axios 配置）
export interface RequestConfig extends RequestInit {
  params?: Record<string, any>;
  timeout?: number;
  headers?: HeadersInit;
  data?: any; // 请求体数据（兼容 axios 的 data 属性）
  baseURL?: string; // 基础 URL
}

// 请求拦截器类型
type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;
// 响应拦截器类型
type ResponseInterceptor<T = any> = (
  response: Response,
  data?: any
) => any | Promise<any>;
// 错误拦截器类型
type ErrorInterceptor = (error: any) => any | Promise<any>;

// 请求拦截器列表
const requestInterceptors: RequestInterceptor[] = [];
// 响应拦截器列表
const responseInterceptors: ResponseInterceptor[] = [];
// 错误拦截器列表
const errorInterceptors: ErrorInterceptor[] = [];

// 默认配置
const defaultConfig: RequestConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 300000, // 默认5分钟（300000毫秒）
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
};

// 添加请求拦截器
export const addRequestInterceptor = (interceptor: RequestInterceptor) => {
  requestInterceptors.push(interceptor);
};

// 添加响应拦截器
export const addResponseInterceptor = (interceptor: ResponseInterceptor) => {
  responseInterceptors.push(interceptor);
};

// 添加错误拦截器
export const addErrorInterceptor = (interceptor: ErrorInterceptor) => {
  errorInterceptors.push(interceptor);
};

// 默认请求拦截器
const defaultRequestInterceptor: RequestInterceptor = (config) => {
  // 添加认证头
  const headers = new Headers(config.headers || {});
  headers.set("Authorization", `Bearer 9afd0857-5667-411d-af76-f5c9ddc1b870`);

  // 开发环境打印日志（注意：url 在 request 函数中处理）
  if (import.meta.env.DEV) {
    console.log("Request:", config.method?.toUpperCase() || "GET");
  }

  return {
    ...config,
    headers,
  };
};

// 默认响应拦截器
const defaultResponseInterceptor: ResponseInterceptor = async (
  response,
  data
) => {
  const res = data as ApiResponse;

  // 根据实际接口返回的数据结构判断
  if (res.code !== 200) {
    Toast.error(res.message || "请求失败");

    // 根据不同的错误码做不同处理
    if (res.code === 401) {
      // 未授权，可以跳转到登录页
      // window.location.href = '/login';
    }

    throw new Error(res.message || "失败");
  }

  // 如果是成功的响应，直接返回data部分
  return res.data;
};

// 默认错误拦截器
const defaultErrorInterceptor: ErrorInterceptor = (error) => {
  console.error("Response Error:", error);

  let message = "网络错误，请稍后重试";

  if (error instanceof Response) {
    // 服务器返回了错误状态码
    switch (error.status) {
      case 400:
        message = "请求参数错误";
        break;
      case 401:
        message = "未授权，请重新登录";
        // window.location.href = '/login';
        break;
      case 403:
        message = "拒绝访问";
        break;
      case 404:
        message = "请求的资源不存在";
        break;
      case 500:
        message = "服务器错误";
        break;
      case 502:
        message = "网关错误";
        break;
      case 503:
        message = "服务不可用";
        break;
      case 504:
        message = "网关超时";
        break;
      default:
        message = `失败 (${error.status})`;
    }
  } else if (error.name === "AbortError") {
    // 检查是否是超时导致的取消
    const abortError = error as any;
    const errorMessage = error.message || "";

    // 检查 error.reason (现代浏览器支持)
    const errorReason = abortError.reason;
    const reasonMessage =
      errorReason?.message ||
      (typeof errorReason === "string" ? errorReason : "") ||
      "";

    // 检查 signal.reason (如果 error 有 signal 属性)
    const signalReason = abortError.signal?.reason;
    const signalReasonMessage =
      signalReason?.message ||
      (typeof signalReason === "string" ? signalReason : "") ||
      "";

    // 检查 error.cause (Error 构造函数支持)
    const errorCause = (error as Error).cause;
    const causeMessage =
      (errorCause && typeof errorCause === "object" && "message" in errorCause
        ? (errorCause as { message: string }).message
        : typeof errorCause === "string"
        ? errorCause
        : "") || "";

    // 检查所有可能包含 timeout 的地方
    const allMessages = [
      errorMessage,
      reasonMessage,
      signalReasonMessage,
      causeMessage,
    ].map((m) => String(m).toLowerCase());

    const isTimeout = allMessages.some((m) => m.includes("timeout"));

    // 特殊处理: "BodyStreamBuffer was aborted" 如果找不到明确的取消原因，
    // 且配置了超时，很可能是超时导致的
    const isBodyStreamAborted = errorMessage.includes(
      "BodyStreamBuffer was aborted"
    );
    const likelyTimeout =
      isBodyStreamAborted &&
      !allMessages.some(
        (m) => m.includes("cancelled") || m.includes("cancel")
      ) &&
      defaultConfig.timeout &&
      defaultConfig.timeout > 0;

    if (isTimeout || likelyTimeout) {
      message = "网络连接超时，请检查网络";
    } else {
      message = "请求已取消";
    }
  } else if (error.message?.includes("timeout")) {
    message = "网络连接超时，请检查网络";
  }

  Toast.error(message);
  return Promise.reject(error);
};

// 注册默认拦截器
addRequestInterceptor(defaultRequestInterceptor);
addResponseInterceptor(defaultResponseInterceptor);
addErrorInterceptor(defaultErrorInterceptor);

// 构建完整 URL
const buildURL = (
  url: string,
  params?: Record<string, any>,
  baseURL?: string
): string => {
  let fullURL = url;

  // 添加 baseURL
  if (baseURL && !url.startsWith("http://") && !url.startsWith("https://")) {
    fullURL = `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
  }

  // 添加查询参数
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullURL += (fullURL.includes("?") ? "&" : "?") + queryString;
    }
  }

  return fullURL;
};

// 处理请求体
const processBody = (data: any, headers: Headers): BodyInit | null => {
  if (!data) return null;

  const contentType = headers.get("content-type") || "";

  if (contentType.includes("application/x-www-form-urlencoded")) {
    if (data instanceof URLSearchParams) {
      return data;
    }
    if (typeof data === "object") {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
      return params;
    }
    return String(data);
  }

  if (contentType.includes("application/json")) {
    return JSON.stringify(data);
  }

  if (
    data instanceof FormData ||
    data instanceof Blob ||
    data instanceof ArrayBuffer
  ) {
    return data;
  }

  // 默认 JSON
  return JSON.stringify(data);
};

// 创建超时控制器
const createTimeoutController = (timeout: number): AbortController => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(new Error("Request timeout")), timeout);
  return controller;
};

// 核心请求函数
const request = async <T = any>(
  url: string,
  config: RequestConfig = {}
): Promise<T> => {
  try {
    // 合并配置
    const mergedConfig: RequestConfig = {
      ...defaultConfig,
      ...config,
      headers: {
        ...defaultConfig.headers,
        ...config.headers,
      },
    };

    // 执行请求拦截器
    let finalConfig = mergedConfig;
    for (const interceptor of requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    // 构建 URL
    const fullURL = buildURL(
      url,
      finalConfig.params,
      finalConfig.baseURL as string
    );

    // 处理请求体
    const headers = new Headers(finalConfig.headers);
    const body = processBody(
      (finalConfig as any).data || finalConfig.body,
      headers
    );

    // 创建 AbortController（支持超时和手动取消）
    const timeoutController = finalConfig.timeout
      ? createTimeoutController(finalConfig.timeout)
      : null;
    const userController = finalConfig.signal
      ? { signal: finalConfig.signal }
      : {};

    // 合并 signal（如果两者都存在，需要创建一个新的 AbortController）
    let signal = finalConfig.signal;
    if (timeoutController && finalConfig.signal) {
      const combinedController = new AbortController();
      timeoutController.signal.addEventListener("abort", () =>
        combinedController.abort(
          (timeoutController.signal as any).reason ||
            new Error("Request timeout")
        )
      );
      finalConfig.signal.addEventListener("abort", () =>
        combinedController.abort(
          (finalConfig.signal as any)?.reason || new Error("Request cancelled")
        )
      );
      signal = combinedController.signal;
    } else if (timeoutController) {
      signal = timeoutController.signal;
    }

    // 发起请求
    const response = await fetch(fullURL, {
      ...finalConfig,
      method: finalConfig.method || "GET",
      headers,
      body,
      signal,
    });

    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误响应
      let errorData: any;
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        try {
          errorData = await response.json();
        } catch {
          // 忽略 JSON 解析错误
        }
      }

      // 执行错误拦截器
      let error = response;
      for (const interceptor of errorInterceptors) {
        error = await interceptor(error);
      }
      throw error;
    }

    // 解析响应数据
    const contentType = response.headers.get("content-type") || "";
    let data: any;

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else if (contentType.includes("text/")) {
      data = await response.text();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await response.text();
      const params = new URLSearchParams(text);
      data = Object.fromEntries(params);
    } else {
      // 尝试作为 JSON 解析，失败则返回文本
      try {
        const text = await response.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = await response.blob();
      }
    }

    // 执行响应拦截器
    let result = data;
    for (const interceptor of responseInterceptors) {
      result = await interceptor(response, result);
    }

    return result;
  } catch (error) {
    // 执行错误拦截器
    let finalError = error;
    for (const interceptor of errorInterceptors) {
      finalError = await interceptor(finalError);
    }
    throw finalError;
  }
};

// 导出常用的请求方法
export const get = <T = any>(
  url: string,
  params?: any,
  config?: RequestConfig
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "GET",
    params,
  });
};

export const post = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "POST",
    data,
  });
};

export const put = <T = any>(
  url: string,
  data?: any,
  config?: RequestConfig
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "PUT",
    data,
  });
};

export const del = <T = any>(
  url: string,
  config?: RequestConfig
): Promise<T> => {
  return request<T>(url, {
    ...config,
    method: "DELETE",
  });
};

// SSE 事件回调类型
export type SseMessageHandler = (eventData: string) => void;
export type SseErrorHandler = (error: unknown) => void;
export type SseCompleteHandler = () => void;

// 流式请求配置
export interface StreamRequestConfig extends RequestConfig {
  onMessage?: SseMessageHandler;
  onError?: SseErrorHandler;
  onComplete?: SseCompleteHandler;
}

/**
 * 流式请求（SSE/Server-Sent Events）
 * @param url 请求地址
 * @param config 请求配置，包括 onMessage、onError、onComplete 回调
 * @returns AbortController 用于取消请求
 */
export const stream = (
  url: string,
  config: StreamRequestConfig = {}
): AbortController => {
  const controller = new AbortController();

  (async () => {
    try {
      // 合并配置
      const mergedConfig: RequestConfig = {
        ...defaultConfig,
        ...config,
        headers: {
          ...defaultConfig.headers,
          ...config.headers,
          Accept: "text/event-stream",
          Connection: "keep-alive",
        },
      };

      // 执行请求拦截器
      let finalConfig = mergedConfig;
      for (const interceptor of requestInterceptors) {
        finalConfig = await interceptor(finalConfig);
      }

      // 构建 URL
      const fullURL = buildURL(
        url,
        finalConfig.params,
        finalConfig.baseURL as string
      );

      // 处理请求体
      const headers = new Headers(finalConfig.headers);
      const body = processBody(
        (finalConfig as any).data || finalConfig.body,
        headers
      );

      // 合并 signal
      const timeoutController = finalConfig.timeout
        ? createTimeoutController(finalConfig.timeout)
        : null;

      let signal = controller.signal;
      if (timeoutController) {
        const combinedController = new AbortController();
        timeoutController.signal.addEventListener("abort", () =>
          combinedController.abort(
            (timeoutController!.signal as any).reason ||
              new Error("Request timeout")
          )
        );
        controller.signal.addEventListener("abort", () =>
          combinedController.abort(
            (controller.signal as any).reason || new Error("Request cancelled")
          )
        );
        signal = combinedController.signal;
      }

      if (import.meta.env.DEV) {
        console.log("[SSE] 开始请求:", fullURL);
      }

      // 发起请求
      const response = await fetch(fullURL, {
        ...finalConfig,
        method: finalConfig.method || "POST",
        headers,
        body,
        signal,
      });

      if (import.meta.env.DEV) {
        console.log("[SSE] 收到响应:", response.status, response.statusText);
        console.log(
          "[SSE] Content-Type:",
          response.headers.get("content-type")
        );
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      // 检查 Content-Type
      const contentType = response.headers.get("content-type") || "";
      if (
        !contentType.includes("text/event-stream") &&
        !contentType.includes("text/plain")
      ) {
        if (import.meta.env.DEV) {
          console.warn(`[SSE] 意外的 Content-Type: ${contentType}`);
        }
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("SSE 流不可用：response.body 为 null");
      }

      if (import.meta.env.DEV) {
        console.log("[SSE] 开始读取流");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let readCount = 0;

      while (true) {
        const { value, done } = await reader.read();
        readCount++;

        if (done) {
          if (import.meta.env.DEV) {
            console.log(`[SSE] 流结束，共读取 ${readCount} 次`);
          }
          // 处理缓冲区中剩余的数据
          if (buffer.trim()) {
            if (import.meta.env.DEV) {
              console.log(
                "[SSE] 处理缓冲区剩余数据:",
                buffer.substring(0, 100)
              );
            }
            const lines = buffer.split(/\r?\n/);
            const dataLines = lines
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trim());
            if (dataLines.length) {
              const dataPayload = dataLines.join("\n");
              config.onMessage?.(dataPayload);
            }
          }
          config.onComplete?.();
          break;
        }

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // 处理所有完整的事件（以 \n\n 分隔）
          let idx;
          while ((idx = buffer.indexOf("\n\n")) !== -1) {
            const rawEvent = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);

            // 解析 SSE 格式：支持 event: 和 data: 行
            const lines = rawEvent.split(/\r?\n/).filter((l) => l.trim());

            // 提取 data: 行的内容（忽略 event: 行）
            const dataLines = lines
              .filter((l) => l.startsWith("data:"))
              .map((l) => l.slice(5).trim());

            if (dataLines.length) {
              // 合并多行 data（如果有多行）
              const dataPayload = dataLines.join("\n");
              if (import.meta.env.DEV) {
                console.log("[SSE] 解析到数据:", dataPayload.substring(0, 100));
              }
              try {
                config.onMessage?.(dataPayload);
              } catch (msgErr) {
                console.error("[SSE] onMessage 回调出错:", msgErr);
                config.onError?.(msgErr);
              }
            } else {
              // 如果没有 data: 行，记录原始事件内容（用于调试）
              if (import.meta.env.DEV) {
                console.log(
                  "[SSE] 未找到 data: 行，原始事件:",
                  rawEvent.substring(0, 200)
                );
              }
            }
          }
        } else {
          if (import.meta.env.DEV) {
            console.warn("[SSE] 读取到空的 value");
          }
        }
      }
    } catch (err) {
      // 如果是 AbortError，可能是用户主动取消，不一定要调用 onError
      if (err instanceof Error && err.name === "AbortError") {
        if (import.meta.env.DEV) {
          console.log("SSE 流已取消");
        }
        return;
      }
      console.error("SSE 流错误:", err);
      config.onError?.(err);
    }
  })();

  return controller;
};

// 导出默认实例（兼容原有代码）
const service = {
  get,
  post,
  put,
  delete: del,
  request,
  stream,
};

export default service;

// 兼容导出（保持原有 API）
export { service as axios };
