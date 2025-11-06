import { post } from "@/utils/request";
import type { ResultVO } from "./types";

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

  return post<ResultVO<UserAnalysisPlanDTO>>(
    "/api/user/userAnalysisPlan/save",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}

/**
 * 获取用户分析方案
 * POST /api/user/userAnalysisPlan/get
 * Content-Type: application/x-www-form-urlencoded
 * 请求参数：userId (string)
 */
export function getUserAnalysisPlan(userId: string) {
  const params = new URLSearchParams();
  params.append("userId", userId);

  return post<ResultVO<UserAnalysisPlanVO>>(
    "/api/user/userAnalysisPlan/get",
    params,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
}
