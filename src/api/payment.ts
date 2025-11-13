import { post } from "@/utils/request";
import { ResultVO } from "./types";

interface TradePagePayResult {
  codeUrl: string;
  orderNo: string;
}

export interface AppPricePayType {
  payType: string;
  orderType: string;
  tradeType: string;
  qrcodeWidth?: string;
}

/**
 * 记账费用接口
 * @param data
 * @returns
 */
export const fetchAppPricePay = (data: AppPricePayType) =>
  post<TradePagePayResult>("/api/pay/appPrice/appPricePay", data);

/**
 * 获取支付宝交易状态
 * @param outTradeNo
 * @returns
 */
export const getAlipayTradeStatus = (outTradeNo: string) =>
  post<string>(`/api/pay/alipay/getTradeStatus?outTradeNo=${outTradeNo}`);

/**
 * 获取微信支付交易状态
 * @param outTradeNo
 * @returns
 */
export const getWechatPayTradeStatus = (outTradeNo: string, tradeType: string) =>
  post<string>(
    `/api/pay/wechat-pay/getTradeStatus?outTradeNo=${outTradeNo}&tradeType=${tradeType}`,
  );
