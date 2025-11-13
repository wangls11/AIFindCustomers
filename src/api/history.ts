import { post } from "@/utils/request";
import type { ResultVO } from "./types";

// 分页查询 DTO
export interface QueryPageDTO {
  pageNO?: number;
  pageSize?: number;
  orderBy?: string;
  properties?: string;
  // 业务查询参数，通常为任意对象
  params?: Record<string, any>;
}

// 用户请求记录
export interface UserRequest {
  id?: string;
  userId?: string;
  createBy?: string;
  updateBy?: string;
  createTime?: string; // date-time
  updateTime?: string; // date-time
  dr?: string;
  status?: string;
  totalCount?: number;
  successCount?: number;
  failCount?: number;
  cost?: number;
  param?: string;
  unprocessedParam?: string;
  baseToken?: string;
  tableId?: string;
  viewId?: string;
  planeId?: string;
  fieldList?: string;
  sessionId?: string;
  title?: string;
  map?: Record<string, any>;
}

// 通用分页返回结构
export interface PageVO<T = any> {
  total?: number;
  dataList?: T[];
}

/**
 * 获取请求列表
 * POST /api/data/getRequest
 * Content-Type: application/json
 */
export function getRequest(payload: QueryPageDTO) {
  return post<ResultVO<PageVO<UserRequest>>>("/api/data/getRequest", payload, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// 分页查询 record 列表 DTO
export interface RecordPageDTO extends QueryPageDTO {
  requestId?: string;
}

// 单条记录（UserRequestRecord）
export interface UserRequestRecord {
  id?: string;
  userId?: string;
  createTime?: string;
  updateTime?: string;
  requestId?: string;
  recordId?: string;
  progress?: string;
  hasPushed?: string;
  paramFields?: string;
  companyName?: string;
  companyStatus?: string;
  establishmentDate?: string;
  employeeCount?: string;
  registeredCapital?: string;
  financingRound?: string;
  isListed?: string;
  legalRepresentative?: string;
  companyPhone?: string;
  officialWebsite?: string;
  companyEmail?: string;
  latestFinancingDate?: string;
  financingHeatScore?: string;
  overallScore?: string;
  customerPriority?: string;
  financingHeatLevel?: string;
  growthHeatLevel?: string;
  riskRating?: string;
  coreConclusion?: string;
  salesRecommendation?: string;
  customerDoc?: string;
  map?: Record<string, any>;
  pushData?: string;
}

/**
 * 获取记录列表
 * POST /api/data/getRecord
 * Content-Type: application/json
 */
export function getRecord(payload: RecordPageDTO) {
  return post<ResultVO<PageVO<UserRequestRecord>>>(
    "/api/data/getRecord",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

/**
 * 删除会话记录
 * @param requestId
 * @returns
 */
export function deleteRequest(requestId: string) {
  const params = new URLSearchParams();
  params.append("requestId", requestId);

  return post<ResultVO<unknown>>("/api/data/deleteRequest", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 重命名会话标题
 * @param
 * @returns
 */
export function updateRequest(requestId: string, title: string) {
  const params = new URLSearchParams();
  params.append("requestId", requestId);
  params.append("title", title);

  return post<ResultVO<unknown>>("/api/data/updateTitle", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}
