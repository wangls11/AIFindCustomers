import { post, stream } from "@/utils/request";
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
  title?: string;
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
 * 继续数据处理
 * @param id 任务id
 * @returns 是否成功
 */
export function continueData(
  id: string,
  onMessage: SseMessageHandler,
  onError?: SseErrorHandler
) {
  return stream("/api/data/resume", {
    method: "POST",
    data: { id },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    onMessage,
    onError,
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
  return stream("/api/data/start", {
    method: "POST",
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
    onMessage,
    onError,
  });
}
