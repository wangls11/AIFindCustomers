import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const BuyCreditsPage: React.FC = () => {
  const [morePlansOpen, setMorePlansOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const applyMax = () => {
      const leftSidebar = (window as any).__LEFT_SIDEBAR_WIDTH__ || 280;
      const pageWidth =
        window.innerWidth || document.documentElement.clientWidth;
      const maxW = Math.max(410, pageWidth - leftSidebar - 640);
    };
    applyMax();
    window.addEventListener("resize", applyMax);
    return () => window.removeEventListener("resize", applyMax);
  }, []);

  const togglePlans = () => {
    setMorePlansOpen(!morePlansOpen);
  };

  return (
    <div
      className="panel"
      style={
        {
          "--panel-min": "410px",
          "--brand": "#1f2937",
          "--accent": "#3b82f6",
          "--muted": "#6b7280",
          "--border": "#e5e7eb",
          "--card": "#fafafa",
          "--r": "10px",
          "--shadow": "0 2px 8px rgba(0,0,0,.04)",
          "--success": "#10b981",
        } as React.CSSProperties & Record<string, string>
      }
    >
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          background: #fff;
          color: #1f2937;
          line-height: 1.6;
          font-family: -apple-system, BlinkMacSystemFont, Helvetica Neue, Tahoma, PingFang SC, Microsoft Yahei, Arial, Hiragino Sans GB, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .panel {
          width: clamp(var(--panel-min), 100%, var(--panel-max));
          min-width: var(--panel-min);
          max-width: var(--panel-max);
          margin: 0;
          background: #fff;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding-bottom: 100px;
        }
        .top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-bottom: 1px solid var(--border);
          gap: 12px;
        }
        .back-btn {
          background: none;
          border: none;
          color: var(--brand);
          font-size: 20px;
          cursor: pointer;
          padding: 4px 0px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .back-btn:hover {
          background: var(--card);
          border-radius: 6px;
        }
        .header-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--brand);
          flex: 1;
        }
        .spacer {
          width: 32px;
          height: 32px;
        }
        .banner {
          background: var(--card);
          border-bottom: 1px solid var(--border);
          padding: 12px 20px;
          text-align: center;
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
        }
        .wrap {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }
        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 6px;
        }
        .page-desc {
          font-size: 13px;
          color: var(--muted);
          margin-bottom: 18px;
        }
        .cost-comparison {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 14px;
        }
        .comparison-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 10px;
        }
        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .comparison-item {
          background: #fff;
          border-radius: 8px;
          padding: 10px;
          text-align: center;
          border: 1px solid var(--border);
        }
        .comparison-item.new {
          border-color: var(--success);
        }
        .comparison-label {
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 4px;
          font-weight: 600;
        }
        .comparison-price {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 2px;
        }
        .comparison-item.new .comparison-price {
          color: var(--success);
        }
        .comparison-note {
          font-size: 10px;
          color: var(--muted);
        }
        .savings-badge {
          background: var(--accent);
          color: white;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 14px;
        }
        .balance-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 14px;
        }
        .balance-label {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 4px;
          font-weight: 600;
        }
        .balance-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .balance-value .unit {
          font-size: 16px;
          font-weight: 600;
        }
        .balance-note {
          font-size: 11px;
          color: var(--muted);
        }
        .recommended-plan {
          background: #fff;
          border: 2px solid var(--accent);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 18px;
          position: relative;
        }
        .recommended-badge {
          position: absolute;
          top: -12px;
          left: 16px;
          background: var(--accent);
          color: white;
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
        }
        .plan-header {
          padding-top: 4px;
          margin-bottom: 12px;
        }
        .plan-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .plan-desc {
          font-size: 12px;
          color: var(--muted);
          line-height: 1.4;
        }
        .plan-stats {
          background: var(--card);
          border-radius: 8px;
          padding: 10px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .plan-stat {
          text-align: center;
        }
        .plan-stat-label {
          font-size: 10px;
          color: var(--muted);
          margin-bottom: 3px;
          font-weight: 600;
        }
        .plan-stat-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--brand);
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 2px;
        }
        .plan-stat-unit {
          font-size: 10px;
          font-weight: 600;
          color: var(--muted);
        }
        .plan-price {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 12px;
          gap: 8px;
        }
        .plan-price-new {
          font-size: 28px;
          font-weight: 700;
          color: var(--brand);
        }
        .plan-price-old {
          font-size: 14px;
          color: var(--muted);
          text-decoration: line-through;
          opacity: 0.6;
        }
        .plan-price-note {
          font-size: 11px;
          color: var(--accent);
          font-weight: 700;
        }
        .btn-primary {
          width: 100%;
          padding: 12px;
          background: var(--brand);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: .25s;
          margin-bottom: 8px;
        }
        .btn-primary:hover {
          background: #111827;
          transform: translateY(-1px);
        }
        .plan-note {
          font-size: 11px;
          text-align: center;
          color: var(--muted);
        }
        .more-plans-toggle {
          text-align: center;
          margin-bottom: 16px;
        }
        .toggle-btn {
          background: none;
          border: 1px solid var(--border);
          color: var(--brand);
          font-size: 14px;
          font-weight: 600;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: .2s;
        }
        .toggle-btn:hover {
          border-color: var(--accent);
          background: var(--card);
        }
        .more-plans {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.4s ease-out;
        }
        .more-plans.active {
          max-height: 800px;
        }
        .plan-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 10px;
        }
        .plan-card:hover {
          border-color: var(--accent);
          box-shadow: var(--shadow);
        }
        .plan-card-header {
          margin-bottom: 10px;
        }
        .plan-card-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .plan-card-price {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
        }
        .plan-card-features {
          margin-bottom: 12px;
        }
        .plan-card-feature {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 4px;
          padding-left: 14px;
          position: relative;
          line-height: 1.4;
        }
        .plan-card-feature::before {
          content: "•";
          position: absolute;
          left: 4px;
          color: var(--accent);
          font-weight: 700;
        }
        .plan-card-btn {
          width: 100%;
          padding: 10px;
          background: #fff;
          border: 1px solid var(--border);
          color: var(--brand);
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: .2s;
        }
        .plan-card-btn:hover {
          border-color: var(--accent);
          background: var(--card);
        }
        @media (max-width: 430px) {
          .plan-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <header className="top">
        <button
          className="back-btn"
          aria-label="返回"
          onClick={() => navigate(-1)}
        >
          ←
        </button>
        <div className="header-title">购买积分</div>
        <div className="spacer"></div>
      </header>

      <div className="banner">团队采购？享8折优惠 + 统一积分池 + 专属客服</div>

      <main className="wrap">
        <h1 className="page-title">💎 购买积分</h1>
        <p className="page-desc">按需付费 · 用多少买多少 · 永久有效</p>

        <div className="cost-comparison">
          <div className="comparison-title">💰 成本对比（单家客户）</div>
          <div className="comparison-grid">
            <div className="comparison-item">
              <div className="comparison-label">传统手工调研</div>
              <div className="comparison-price">¥100</div>
              <div className="comparison-note">人力1天/20家</div>
            </div>
            <div className="comparison-item new">
              <div className="comparison-label">AI找客</div>
              <div className="comparison-price">¥0.40</div>
              <div className="comparison-note">专业包单价</div>
            </div>
          </div>
        </div>

        <div className="savings-badge">节省 99.6% 成本</div>

        <div className="balance-card">
          <div className="balance-label">当前余额</div>
          <div className="balance-value">
            50 <span className="unit">积分</span>
          </div>
          <div className="balance-note">
            约可处理 10 家公司（按5积分/家计算）
          </div>
        </div>

        <div className="recommended-plan">
          <div className="recommended-badge">⭐ 为你推荐</div>
          <div className="plan-header">
            <div className="plan-title">专业包</div>
            <div className="plan-desc">
              根据你刚处理的20家，2000积分够你再处理400家，覆盖3个月找客需求
            </div>
          </div>
          <div className="plan-stats">
            <div className="plan-stat">
              <div className="plan-stat-label">获得积分</div>
              <div className="plan-stat-value">
                2000<span className="plan-stat-unit">分</span>
              </div>
            </div>
            <div className="plan-stat">
              <div className="plan-stat-label">可处理</div>
              <div className="plan-stat-value">
                400<span className="plan-stat-unit">家</span>
              </div>
            </div>
            <div className="plan-stat">
              <div className="plan-stat-label">有效期</div>
              <div className="plan-stat-value">
                6<span className="plan-stat-unit">个月</span>
              </div>
            </div>
            <div className="plan-stat">
              <div className="plan-stat-label">单家成本</div>
              <div className="plan-stat-value">¥0.40</div>
            </div>
          </div>
          <div className="plan-price">
            <span className="plan-price-new">¥159</span>
            <span className="plan-price-old">¥196</span>
            <span className="plan-price-note">省20%</span>
          </div>
          <button className="btn-primary">立即购买专业包</button>
          <div className="plan-note">
            支持微信/支付宝 · 1分钟到账立即可用 · 支持开发票
          </div>
        </div>

        <div className="more-plans-toggle">
          <button className="toggle-btn" onClick={togglePlans}>
            {morePlansOpen ? "收起方案" : "查看其他方案"}
          </button>
        </div>

        <div className={`more-plans ${morePlansOpen ? "active" : ""}`}>
          <div className="plan-card">
            <div className="plan-card-header">
              <div className="plan-card-title">入门包</div>
              <div className="plan-card-price">¥49</div>
            </div>
            <div className="plan-card-features">
              <div className="plan-card-feature">500积分（可处理约100家）</div>
              <div className="plan-card-feature">有效期3个月</div>
              <div className="plan-card-feature">单价¥0.49/家</div>
            </div>
            <button className="plan-card-btn">购买入门包</button>
          </div>

          <div className="plan-card">
            <div className="plan-card-header">
              <div className="plan-card-title">企业包</div>
              <div className="plan-card-price">¥349</div>
            </div>
            <div className="plan-card-features">
              <div className="plan-card-feature">
                5000积分（可处理约1000家）
              </div>
              <div className="plan-card-feature">有效期12个月</div>
              <div className="plan-card-feature">单价¥0.35/家（省30%）</div>
              <div className="plan-card-feature">优先处理 + 专属客服</div>
            </div>
            <button className="plan-card-btn">购买企业包</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyCreditsPage;
