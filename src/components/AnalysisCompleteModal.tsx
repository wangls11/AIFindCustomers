import React, { useEffect, useRef } from "react";

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

const AnalysisCompleteModal: React.FC<Props> = ({
  visible = true,
  data,
  tableName,
  onClose,
}) => {
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
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      // give each confetti a random vertical start so they are visible
      confetti.style.top = Math.random() * 40 + "px";
      confetti.style.background =
        colors[Math.floor(Math.random() * colors.length)];
      // make sure confetti is visible at start (animation will handle fade)
      confetti.style.opacity = "1";
      confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
      confetti.style.width = Math.random() * 6 + 6 + "px";
      confetti.style.height = Math.random() * 6 + 6 + "px";

      const duration = Math.random() * 1.5 + 2.5;
      const delay = Math.random() * 0.8;
      // use 'both' so the element renders during the animation and respects end state
      confetti.style.animation = `confettiFall ${duration}s ease-in ${delay}s both`;

      container.appendChild(confetti);
    }
  };

  // 确认按钮处理
  const handleConfirm = () => {
    if (!overlayRef.current) return;

    const overlay = overlayRef.current;
    overlay.classList.add("fade-out");

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
        })
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
          "items"
        );
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif; background: #f5f5f5; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.3s ease-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-container { width: 90%; max-width: 460px; background: white; border-radius: 20px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3); position: relative; animation: slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(60px) scale(0.85); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .confetti-container { position: absolute; top: -100px; left: 0; right: 0; bottom: -100px; pointer-events: none; overflow: visible; z-index: 10; }
        .confetti { position: absolute; width: 10px; height: 10px; opacity: 0; }
        @keyframes confettiFall { 0% { transform: translateY(-100px) rotate(0deg); opacity: 1; } 100% { transform: translateY(800px) rotate(720deg); opacity: 0; } }
        .celebration-header { background: linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%); padding: 36px 24px 28px 24px; border-radius: 20px 20px 0 0; text-align: center; position: relative; border-bottom: 1px solid #f0f0f0; }
        .celebration-icon { font-size: 56px; margin-bottom: 12px; animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both; }
        @keyframes popIn { 0% { transform: scale(0) rotate(-180deg); opacity: 0; } 50% { transform: scale(1.15) rotate(0deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .celebration-title { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 8px; line-height: 1.3; animation: fadeInUp 0.5s ease-out 0.4s both; }
        .celebration-subtitle { font-size: 14px; color: #999; line-height: 1.4; animation: fadeInUp 0.5s ease-out 0.5s both; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .modal-body { padding: 24px; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
        .stat-card { background: #fafafa; padding: 16px 12px; border-radius: 12px; text-align: center; border: 1px solid #f0f0f0; opacity: 0; animation: scaleIn 0.4s ease-out both; }
        .stat-card:nth-child(1) { animation-delay: 0.6s; }
        .stat-card:nth-child(2) { animation-delay: 0.7s; }
        .stat-card:nth-child(3) { animation-delay: 0.8s; }
        .stat-card:nth-child(4) { animation-delay: 0.9s; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
        .stat-number { font-size: 24px; font-weight: 700; color: #1890ff; margin-bottom: 4px; }
        .stat-label { font-size: 12px; color: #666; line-height: 1.3; font-weight: 500; }
        .stat-score { font-size: 11px; color: #999; margin-top: 2px; }
        .sync-notice { padding: 14px 16px; background: #e7f3ff; border-radius: 12px; display: flex; align-items: center; margin-bottom: 20px; border: 1px solid #bae7ff; animation: fadeInUp 0.5s ease-out 1s both; }
        .sync-icon { width: 20px; height: 20px; border-radius: 50%; background: #1890ff; color: white; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: bold; margin-right: 12px; flex-shrink: 0; }
        .sync-text { font-size: 14px; color: #1890ff; line-height: 1.4; }
        .confirm-button { width: 100%; height: 48px; background: #1890ff; border: none; border-radius: 12px; color: white; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3); animation: fadeInUp 0.5s ease-out 1.1s both; }
        .confirm-button:hover { background: #40a9ff; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4); }
        .confirm-button:active { transform: translateY(0); }
        .button-text { margin-right: 6px; }
        .button-icon { font-size: 18px; }
        .fade-out { animation: modalFadeOut 0.3s ease-in forwards; }
        @keyframes modalFadeOut { to { opacity: 0; transform: scale(0.9); } }
        @media (max-width: 480px) { .modal-container { width: 95%; max-width: none; } .celebration-header { padding: 32px 20px 24px 20px; } .celebration-icon { font-size: 48px; } .celebration-title { font-size: 20px; } .modal-body { padding: 20px; } .stat-number { font-size: 22px; } }
      `}</style>

      <div className="modal-overlay" ref={overlayRef}>
        <div className="modal-container">
          {/* 礼花容器 */}
          <div className="confetti-container" ref={confettiContainerRef}></div>

          {/* 顶部庆祝区 */}
          <div className="celebration-header">
            <div className="celebration-icon">🎉</div>
            <div className="celebration-title">AI找客分析完成！</div>
            <div className="celebration-subtitle">{tableName}</div>
          </div>

          {/* 内容区 */}
          <div className="modal-body">
            {/* 统计卡片 */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{data.excellent}</div>
                <div className="stat-label">优质客户</div>
                <div className="stat-score">≥90分</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{data.potential}</div>
                <div className="stat-label">潜力客户</div>
                <div className="stat-score">80-89分</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{data.watch}</div>
                <div className="stat-label">观察名单</div>
                <div className="stat-score">70-79分</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{data.low}</div>
                <div className="stat-label">低分客户</div>
                <div className="stat-score">&lt;70分</div>
              </div>
            </div>

            {/* 同步提示 */}
            <div className="sync-notice">
              <div className="sync-icon">✓</div>
              <div className="sync-text">企业信息已同步至多维表格</div>
            </div>

            {/* 确认按钮 */}
            <button className="confirm-button" onClick={handleConfirm}>
              <span className="button-text">我知道了</span>
              <span className="button-icon">✓</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AnalysisCompleteModal;
