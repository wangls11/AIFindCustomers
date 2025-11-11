import { post } from "@/utils/request";
import type { ResultVO } from "./types";

// 登录参数接口
export interface LoginParams {
  open_id: string;
  tenant_key: string;
}

// 登录响应接口
export interface LoginResponse {
  tokenValue: string;
}

/**
 * 登录
 * @param {object} params LoginParams
 * @param {string} params.open_id
 * @param {string} params.tenant_key
 * @returns Promise<LoginResponse>
 */
export function login(params: LoginParams) {
  return post<LoginResponse>(`/api/user/login/login`, params);
}

export interface UserAnalysisPlanDTO {
  id?: string;
  userId?: string; // 用户id
  name?: string; // 方案名称
  remark?: string; // 方案说明
  fieldList?: string; // 勾选字段
  productLine?: string; // 产品线
  keySellingPoints?: string; // 核心卖点
  customerSize?: string; // 客户规模
  budgetRange?: string; // 预算范围
  industry?: string; // 所属行业
  otherRequirement?: string; // 其他要求
  tableId?: string; // 表id
  viewId?: string; // 视图id
}

// ResultVO 移至公共类型 ./types

export interface UserAnalysisPlanVO {
  id?: string;
  userId?: string;
  name?: string;
  remark?: string;
  fieldList?: string;
  productLine?: string;
  keySellingPoints?: string;
  customerSize?: string;
  budgetRange?: string;
  industry?: string;
  otherRequirement?: string;
  createBy?: string;
  updateBy?: string;
  createTime?: string; // date-time
  updateTime?: string; // date-time
  tableId?: string;
  viewId?: string;
}

/**
 * 保存用户分析方案
 * Content-Type: application/x-www-form-urlencoded
 */
export function saveUserAnalysisPlan(dto: UserAnalysisPlanDTO) {
  const params = new URLSearchParams();
  Object.entries(dto).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });

  return post<ResultVO<UserAnalysisPlanDTO>>("/api/user/userAnalysisPlan/save", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}

/**
 * 获取用户分析方案
 * POST /api/user/userAnalysisPlan/get
 * Content-Type: application/x-www-form-urlencoded
 * 请求参数：userId (string)
 */
export function getUserAnalysisPlan({ table_id, view_id }: { table_id: string; view_id: string }) {
  const params = new URLSearchParams();
  params.append("table_id", table_id);
  params.append("view_id", view_id);

  return post<ResultVO<UserAnalysisPlanVO>>("/api/user/userAnalysisPlan/get", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
}
