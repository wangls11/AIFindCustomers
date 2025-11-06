import { post } from "@/utils/request";
import type { ResultVO } from "./types";

// ====== Data streaming DTOs (moved from types.ts 8-34) ======
export interface DataFieldDTO {
  fieldId?: string;
  fieldName?: string;
  // 任意类型的字段值
  fieldValue?: unknown;
}

export interface DataItem {
  recordId?: string;
  fields?: DataFieldDTO[];
}

export interface DataDTO {
  appToken?: string;
  tableId?: string;
  viewId?: string;
  // 分析方案id
  userAnalysisId?: string;
  // 数据表中所有的字段名
  fieldList?: string[];
  dataItems?: DataItem[];
}

// SSE 事件回调类型
export type SseMessageHandler = (eventData: string) => void;
export type SseErrorHandler = (error: unknown) => void;

/**
 * 终止进度处理
 * POST /api/data/terminate
 * Content-Type: application/x-www-form-urlencoded
 * 参数：id (string) 必填
 */
export function terminateData(id: string) {
  const params = new URLSearchParams();
  params.append("id", id);

  return post<ResultVO<unknown>>("/api/data/terminate", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 暂停/中止（可恢复）
 * POST /api/data/abort
 * Content-Type: application/x-www-form-urlencoded
 * 参数：id (string) 必填
 */
export function abortData(id: string) {
  const params = new URLSearchParams();
  params.append("id", id);

  return post<ResultVO<unknown>>("/api/data/abort", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 检验是否可恢复/继续
 * POST /api/data/checkResume
 * Content-Type: application/x-www-form-urlencoded
 * 参数：id (string) 必填
 */
export function checkResume(id: string) {
  const params = new URLSearchParams();
  params.append("id", id);

  return post<ResultVO<unknown>>("/api/data/checkResume", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 开始数据处理（SSE）
 * POST /api/data/start
 * 请求体：application/json (DataDTO)
 * 响应：text/event-stream
 *
 * 返回 AbortController 用于终止请求。
 */
export function startDataStream(
  payload: DataDTO,
  onMessage: SseMessageHandler,
  onError?: SseErrorHandler
) {
  const controller = new AbortController();

  const baseURL = import.meta.env.VITE_API_BASE_URL || "";
  const url = `${baseURL || ""}/api/data/start`.replace(/([^:]\/)\/+/, "$1");

  // 与 axios 拦截器保持一致的认证头（如有）
  const authorization = `Bearer 9afd0857-5667-411d-af76-f5c9ddc1b870`;

  (async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, */*",
          Authorization: authorization,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("SSE 流不可用");
      }

      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx;
        while ((idx = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // 解析简单的 SSE：以 data: 开头的行
          const lines = rawEvent.split(/\r?\n/);
          const dataLines = lines
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim());
          if (dataLines.length) {
            const dataPayload = dataLines.join("\n");
            onMessage(dataPayload);
          }
        }
      }
    } catch (err) {
      onError?.(err);
    }
  })();

  return controller;
}
