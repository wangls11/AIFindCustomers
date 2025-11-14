import { post } from "@/utils/request";
import type { ResultVO } from "./types";

// 分页查询参数类型
export interface PageParams {
  pageNO: number; // 当前页
  pageSize: number; // 当前页数量
  params?: object; // 业务查询参数，json格式
}

// 积分明细记录类型
export interface CreditsDetailRecord {
  id: string; // 记录ID
  userId: string; // 用户ID
  deductionNo: string; // 扣除单号
  businessType: string; // 业务类型
  title: string; // 标题
  businessId: string; // 业务ID
  amount: number; // 金额
  changeAmount: number; // 变化金额
}

// 积分明细响应类型
export interface CreditsDetailsResponse {
  total: number; // 总记录数
  dataList: CreditsDetailRecord[]; // 记录列表
}

// 用户信息接口
export interface UserInfo {
  tokenValue: string; // token值
  userCode: string; // 用户编码
  integral: number; // 积分
}

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
  return post<LoginResponse>(`/api/user/login`, params);
}

// 登录返回的用户信息 VO
export interface LoginVO {
  tokenValue?: string; // token 值
  userCode?: string; // 用户 id
  integral?: number; // 积分
  // 其他可能的字段
  [key: string]: any;
}

/**
 * 获取用户信息
 * POST /api/user/login/getUserInfo
 * Content-Type: application/x-www-form-urlencoded
 * 无请求参数
 */
export function getUserInfo() {
  const params = new URLSearchParams();

  return post<ResultVO<LoginVO>>("/api/user/getUserInfo", params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
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
export function getUserAnalysisPlan({
  table_id,
  view_id,
}: {
  table_id: string;
  view_id: string;
}) {
  const params = new URLSearchParams();
  params.append("table_id", table_id);
  params.append("view_id", view_id);

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

/**
 * 获取用户信息
 * @returns Promise<ResultVO<UserInfo>>
 */
export function fetchUserInfo() {
  return post<UserInfo>("/api/user/getUserInfo");
}

/**
 * 兑换邀请码
 * @param {string} exchangeCode 邀请码
 * @returns Promise<any>
 */
export function exchange(exchangeCode: string) {
  return post(`/api/exchangeKeys/exchange?exchangeCode=${exchangeCode}`);
}

/**
 * 获取积分使用明细
 * @param {object} params 分页查询数据传输对象
 * @param {number} params.pageNO 当前页
 * @param {number} params.pageSize 当前页数量
 * @param {string} params.orderBy 排序方式
 * @param {string} params.properties 排序字段
 * @param {object} params.params 业务查询参数，json格式
 * @returns Promise<ResultVO<CreditsDetailsResponse>>
 */
export function getDetails(params: PageParams) {
  return post<CreditsDetailsResponse>(`/api/user/getDetails`, params);
}
