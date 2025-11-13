import React, { useEffect, useRef } from "react";
import "./AnalysisCompleteModal.css";

type Props = {
  visible?: boolean;
  onClose?: () => void;
  data: {
    excellent: number;
    potential: number;
    watch: number;
    low: number;
  };
  tableName: string;
};

const AnalysisCompleteModal: React.FC<Props> = ({ visible = true, data, tableName, onClose }) => {
  const confettiContainerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  // 生成礼花
  const createConfetti = () => {
    if (!confettiContainerRef.current) return;

    const container = confettiContainerRef.current;
    // clear previous confetti if any (helps when component re-renders)
    container.innerHTML = "";
    const colors = [
      "#1890ff",
      "#52c41a",
      "#faad14",
      "#f5222d",
      "#722ed1",
      "#13c2c2",
      "#eb2f96",
      "#fa8c16",
    ];

    for (let i = 0; i < 60; i++) {
      const confetti = document.createElement("div");
      confetti.className = "analysis-complete-modal__confetti";
      confetti.style.left = Math.random() * 100 + "%";
      // give each confetti a random vertical start so they are visible
      confetti.style.top = Math.random() * 40 + "px";
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      // make sure confetti is visible at start (animation will handle fade)
      confetti.style.opacity = "1";
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confetti.style.width = Math.random() * 6 + 6 + "px";
      confetti.style.height = Math.random() * 6 + 6 + "px";

      const duration = Math.random() * 1.5 + 2.5;
      const delay = Math.random() * 0.8;
      // use 'both' so the element renders during the animation and respects end state
      confetti.style.animation = `analysis-complete-modal__confettiFall ${duration}s ease-in ${delay}s both`;

      container.appendChild(confetti);
    }
  };

  // 确认按钮处理
  const handleConfirm = () => {
    if (!overlayRef.current) return;

    const overlay = overlayRef.current;
    overlay.classList.add("analysis-complete-modal__overlay--fade-out");

    setTimeout(() => {
      // 触发自定义事件
      window.dispatchEvent(
        new CustomEvent("analysisComplete", {
          detail: {
            tableName,
            total: 100,
            excellent: 8,
            potential: 20,
            observation: 45,
            lowScore: 27,
          },
        }),
      );

      // 隐藏弹窗
      overlay.style.display = "none";
      onClose && onClose();
    }, 300);
  };

  // 键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        handleConfirm();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // 在 visible 变为 true 时生成礼花（确保在挂载并渲染后触发）
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      createConfetti();
      // debug: 输出生成的 confetti 数量，便于调试
      if (confettiContainerRef.current) {
        // eslint-disable-next-line no-console
        console.debug(
          "createConfetti: appended",
          confettiContainerRef.current.children.length,
          "items",
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="analysis-complete-modal">
      <div className="analysis-complete-modal__overlay" ref={overlayRef}>
        <div className="analysis-complete-modal__container">
          {/* 礼花容器 */}
          <div
            className="analysis-complete-modal__confetti-container"
            ref={confettiContainerRef}
          ></div>

          {/* 顶部庆祝区 */}
          <div className="analysis-complete-modal__header">
            <div className="analysis-complete-modal__icon">🎉</div>
            <div className="analysis-complete-modal__title">AI找客分析完成！</div>
            <div className="analysis-complete-modal__subtitle">{tableName}</div>
          </div>

          {/* 内容区 */}
          <div className="analysis-complete-modal__body">
            {/* 统计卡片 */}
            <div className="analysis-complete-modal__stats-grid">
              <div className="analysis-complete-modal__stat-card">
                <div className="analysis-complete-modal__stat-number">{data.excellent}</div>
                <div className="analysis-complete-modal__stat-label">优质客户</div>
                <div className="analysis-complete-modal__stat-score">≥90分</div>
              </div>
              <div className="analysis-complete-modal__stat-card">
                <div className="analysis-complete-modal__stat-number">{data.potential}</div>
                <div className="analysis-complete-modal__stat-label">潜力客户</div>
                <div className="analysis-complete-modal__stat-score">80-89分</div>
              </div>
              <div className="analysis-complete-modal__stat-card">
                <div className="analysis-complete-modal__stat-number">{data.watch}</div>
                <div className="analysis-complete-modal__stat-label">观察名单</div>
                <div className="analysis-complete-modal__stat-score">70-79分</div>
              </div>
              <div className="analysis-complete-modal__stat-card">
                <div className="analysis-complete-modal__stat-number">{data.low}</div>
                <div className="analysis-complete-modal__stat-label">低分客户</div>
                <div className="analysis-complete-modal__stat-score">{"<70分"}</div>
              </div>
            </div>

            {/* 同步提示 */}
            <div className="analysis-complete-modal__sync-notice">
              <div className="analysis-complete-modal__sync-icon">✓</div>
              <div className="analysis-complete-modal__sync-text">企业信息已同步至多维表格</div>
            </div>

            {/* 确认按钮 */}
            <button className="analysis-complete-modal__confirm-button" onClick={handleConfirm}>
              <span className="analysis-complete-modal__button-text">我知道了</span>
              <span className="analysis-complete-modal__button-icon">✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCompleteModal;
