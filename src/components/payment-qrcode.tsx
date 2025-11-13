import { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useCountdown } from "@/hooks/use-countdown";
import { getAlipayTradeStatus, getWechatPayTradeStatus } from "@/api/payment";
import { Canvas } from "./canvas";
import { IconSpin } from "@douyinfe/semi-icons";

interface PaymentQRCodeProps {
  className?: string;
  size?: number;

  /**
   * 用于渲染二维码
   * alipay: 接口返回 form 表单 html, iframe 渲染
   * wechat: 接口返回一个协议地址, qrcode 渲染
   */
  codeUrl: string;

  /**
   * 支付类型: alipay || wechat
   */
  paymentMethod: string;

  /**
   * 二维码加载状态
   */
  loading: boolean;

  /**
   * 当前支付订单 id
   */
  orderId: string;

  /**
   * 是否为移动端
   * 默认值: false
   */
  isMobile?: boolean;

  /**
   * 是否开启倒计时
   * 默认值: true
   */
  countdown?: boolean;

  /**
   * 付款码弹窗自动关闭时间，开启后，5 分钟自动关闭
   * 默认值: false
   */
  autoClose?: boolean;

  /**
   * 倒计时时间
   */
  time?: {
    hour?: number; // 小时
    minute?: number; // 分钟
    second?: number; // 秒
  };

  /**
   * 订单截止时间
   */
  closeOrderTime?: Dayjs;

  /**
   * 是否继续查询订单状态
   * 默认值: true
   */
  continueQuery?: boolean;

  /**
   * 订单支付成功回调
   */
  onSuccess?: () => void;

  /**
   * 关闭付款码弹窗回调
   */
  onClose?: () => void;
}

/**
 * 支付二维码组件
 * 根据支付方式显示不同的二维码，并处理倒计时和订单状态轮询
 */
export function PaymentQRCode({
  className = "",
  size = 240,
  codeUrl,
  paymentMethod,
  loading = false,
  orderId,
  isMobile = false,
  countdown = true,
  autoClose = false,
  time,
  closeOrderTime,
  continueQuery = true,
  onSuccess,
  onClose,
}: PaymentQRCodeProps) {
  // 付款码 loading 状态
  const [paymentCodeLoading, setPaymentCodeLoading] = useState(true);

  // 轮询定时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 倒计时时间状态
  const [hours, setHours] = useState(time?.hour || 0);
  const [minutes, setMinutes] = useState(time?.minute || 0);
  const [seconds, setSeconds] = useState(time?.second || 0);

  // 使用 useRef 存储 continueQuery 的值，以便在定时器回调中获取最新值
  const continueQueryRef = useRef(continueQuery);

  // 当 continueQuery 属性变化时更新 ref
  useEffect(() => {
    continueQueryRef.current = continueQuery;
  }, [continueQuery]);

  // 主倒计时（订单支付倒计时）
  const { formatTime, isRunning, start, reset } = useCountdown({
    initialHours: hours,
    initialMinutes: minutes,
    initialSeconds: seconds,
    onFinish: () => {
      timerRef.current && clearTimeout(timerRef.current);
      reset();
      onClose?.();
    },
  });

  // 自动关闭倒计时（5分钟）
  const { start: startAutoClose, reset: resetAutoClose } = useCountdown({
    initialMinutes: 5,
    onFinish: () => {
      timerRef.current && clearTimeout(timerRef.current);
      resetAutoClose();
      onClose?.();
    },
  });

  // 查询当前订单状态
  const getPaymentOrderStatus = (orderId: string) => {
    if (!orderId) return;

    let request;
    if (paymentMethod === "alipay") {
      request = getAlipayTradeStatus(orderId);
    } else {
      request = getWechatPayTradeStatus(orderId, isMobile ? "MWEB" : "NATIVE");
    }

    if (request) {
      request
        .then((data: string) => {
          let isPayment;
          if (paymentMethod === "alipay") {
            isPayment = !data || data === "WAIT_BUYER_PAY";
          } else {
            isPayment = !data || data === "NOTPAY";
          }

          if (!isPayment) {
            onSuccess?.();
          }
        })
        .finally(() => {
          timerRef.current && clearTimeout(timerRef.current);

          // 如果组件仍然挂载且允许继续查询，继续轮询
          if (codeUrl && continueQueryRef.current) {
            timerRef.current = setTimeout(() => {
              getPaymentOrderStatus(orderId);
            }, 3000);
          }
        });
    }
  };

  // 开始倒计时并计算时间
  const startCountdown = () => {
    setPaymentCodeLoading(false);
    handleCalculateTime();
  };

  // 计算倒计时时间
  const handleCalculateTime = () => {
    // 提供订单截止时间，重新计算倒计时时间
    if (closeOrderTime && closeOrderTime instanceof dayjs) {
      const currentDate = dayjs();
      const endDate = closeOrderTime;
      const duration = endDate.unix() - currentDate.unix();

      if (duration > 0) {
        const hours = Math.floor(duration / (60 * 60));
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = duration % 60;
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);
      }
    }
    // 无订单截止时间，默认 30 分钟
    else {
      setMinutes(30);
    }
  };

  // 监听轮询检查订单状态，并区分是否开启倒计时
  useEffect(() => {
    if (countdown) {
      if (codeUrl && !paymentCodeLoading && !loading && isRunning) {
        getPaymentOrderStatus(orderId);
      }
    } else {
      if (codeUrl && !paymentCodeLoading && !loading) {
        getPaymentOrderStatus(orderId);
      }
    }

    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [paymentCodeLoading, loading, isRunning, codeUrl, paymentMethod, countdown]);

  // 当二维码URL变化时（关闭或打开弹窗）
  useEffect(() => {
    // 关闭弹窗
    if (!codeUrl) {
      setPaymentCodeLoading(true);
      timerRef.current && clearTimeout(timerRef.current);
    }
  }, [codeUrl]);

  // 当loading状态变化时
  useEffect(() => {
    if (loading) {
      setPaymentCodeLoading(true);
    }
  }, [loading]);

  // 处理倒计时启动
  useEffect(() => {
    if ((hours || minutes || seconds) && codeUrl && !paymentCodeLoading && !loading && countdown) {
      // 重置并启动倒计时
      reset();
      start();
      // 是否 5 分钟自动关闭
      if (autoClose) {
        resetAutoClose();
        startAutoClose();
      }
    }
  }, [hours, minutes, seconds, codeUrl, paymentCodeLoading, loading]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
      reset();
      resetAutoClose();
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{
        width: `${paymentMethod === "alipay" ? size + 10 : size}px`,
        height: `${size + 10}px`,
      }}
    >
      {paymentCodeLoading || loading ? (
        <div className="absolute z-10 flex h-full w-full items-center justify-center bg-white">
          <IconSpin className="animate-spin" size="extra-large" />
        </div>
      ) : null}

      {paymentMethod === "alipay" ? (
        <iframe
          srcDoc={codeUrl}
          className="h-full w-full overflow-hidden border-none"
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups"
          onLoad={() => {
            if (codeUrl) {
              startCountdown();
            }
          }}
        />
      ) : (
        <Canvas
          text={codeUrl}
          logo={{ src: "/wechat_pay.svg", options: { width: size / 4 } }}
          options={{ errorCorrectionLevel: "M", margin: 1, width: size }}
          onLoad={startCountdown}
        />
      )}
      {countdown && !paymentCodeLoading && formatTime && (
        <div className="mt-4 text-center text-lg font-medium">{formatTime()}</div>
      )}
    </div>
  );
}
