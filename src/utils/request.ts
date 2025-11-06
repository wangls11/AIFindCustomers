import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { Toast } from "@douyinfe/semi-ui";

// 定义响应数据类型
interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    "Content-Type": "application/json;charset=UTF-8",
  },
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加token等信息
    // const token = localStorage.getItem("token");
    // if (token) {
    config.headers[
      "Authorization"
    ] = `Bearer 9afd0857-5667-411d-af76-f5c9ddc1b870`;
    // }

    // 可以根据环境打印日志
    if (import.meta.env.DEV) {
      console.log("Request:", config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;

    // 根据实际接口返回的数据结构判断
    // 这里假设 code === 0 表示成功
    if (res.code !== 200) {
      Toast.error(res.message || "请求失败");

      // 根据不同的错误码做不同处理
      if (res.code === 401) {
        // 未授权，可以跳转到登录页
        // window.location.href = '/login';
      }

      return Promise.reject(new Error(res.message || "失败"));
    }

    // 如果是成功的响应，直接返回data部分
    return res.data;
  },
  (error: AxiosError) => {
    console.error("Response Error:", error);

    let message = "网络错误，请稍后重试";

    if (error.response) {
      // 服务器返回了错误状态码
      switch (error.response.status) {
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
          message = `失败 (${error.response.status})`;
      }
    } else if (error.request) {
      // 请求已发送但没有收到响应
      message = "网络连接超时，请检查网络";
    }

    Toast.error(message);
    return Promise.reject(error);
  }
);

export default service;

// 导出常用的请求方法
export const get = <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.get(url, { params, ...config });
};

export const post = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.post(url, data, config);
};

export const put = <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.put(url, data, config);
};

export const del = <T = any>(
  url: string,
  config?: AxiosRequestConfig
): Promise<T> => {
  return service.delete(url, config);
};

export { service as axios };
