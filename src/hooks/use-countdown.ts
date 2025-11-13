import { useEffect, useRef, useState } from "react";

interface CountdownProps {
  /** 初始小时数 */
  initialHours?: number;
  /** 初始分钟数 */
  initialMinutes?: number;
  /** 初始秒数 */
  initialSeconds?: number;
  /** 倒计时结束时的回调函数 */
  onFinish?: () => void;
}

/**
 * 倒计时钩子
 * 提供倒计时功能，支持小时、分钟、秒的计时
 *
 * @param initialHours - 初始小时数，默认为0
 * @param initialMinutes - 初始分钟数，默认为0
 * @param initialSeconds - 初始秒数，默认为0
 * @param onFinish - 倒计时结束时的回调函数
 *
 * @returns {Object} 返回倒计时相关的状态和方法
 * @property {number} hours - 当前剩余小时数
 * @property {number} minutes - 当前剩余分钟数
 * @property {number} seconds - 当前剩余秒数
 * @property {boolean} isRunning - 倒计时是否正在运行
 * @property {() => void} start - 开始倒计时
 * @property {() => void} reset - 重置倒计时
 * @property {() => string} formatTime - 格式化时间字符串
 */
export const useCountdown = ({ initialHours = 0, initialMinutes = 0, initialSeconds = 0, onFinish }: CountdownProps = {}) => {
  // 存储小时、分钟、秒的状态
  const [hours, setHours] = useState(initialHours);
  const [minutes, setMinutes] = useState(initialMinutes);
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);

  // 使用 ref 存储定时器 ID
  const timerRef = useRef<NodeJS.Timeout>();

  // 倒计时核心逻辑
  useEffect(() => {
    if (!isRunning) return;

    // 启动定时器
    timerRef.current = setTimeout(() => {
      setSeconds((prevSeconds) => {
        const totalSeconds = hours * 3600 + minutes * 60 + prevSeconds; // 计算总剩余秒数
        if (totalSeconds <= 0) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          onFinish?.();
          return 0; // 倒计时结束
        }

        const nextTotalSeconds = totalSeconds - 1; // 减去 1 秒
        const nextHours = Math.floor(nextTotalSeconds / 3600);
        const nextMinutes = Math.floor((nextTotalSeconds % 3600) / 60);
        const nextSeconds = nextTotalSeconds % 60;

        // 更新状态
        setHours(nextHours);
        setMinutes(nextMinutes);
        return nextSeconds;
      });
    }, 1000);

    // 清理定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, hours, minutes, seconds, onFinish]);

  /**
   * 开始倒计时
   * 重置时间到初始值并开始计时
   */
  const start = (hours?: number, minutes?: number, seconds?: number) => {
    setHours(hours || initialHours);
    setMinutes(minutes || initialMinutes);
    setSeconds(seconds || initialSeconds);
    setIsRunning(true);
  };

  /**
   * 重置倒计时
   * 停止计时并重置时间到初始值
   */
  const reset = () => {
    setIsRunning(false);
    setHours(initialHours);
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  };

  /**
   * 格式化时间
   * 将时间格式化为 HH:MM:SS 或 MM:SS 格式
   */
  const formatTime = () => {
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(seconds).padStart(2, "0");

    return `${formattedHours}：${formattedMinutes}：${formattedSeconds}`;
  };

  return {
    hours,
    minutes,
    seconds,
    isRunning,
    start,
    reset,
    formatTime,
  };
};
