import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const CompletePage: React.FC = () => {
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

  const companies = [
    {
      name: "美团",
      industry: "互联网 · 5000+人",
      matchScore: 92,
      ceo: "王兴",
      phone: "010-1234567",
      address: "北京朝阳",
      script: "已生成",
    },
    {
      name: "字节跳动",
      industry: "互联网 · 10000+人",
      matchScore: 89,
      ceo: "张一鸣",
      phone: "010-7654321",
      address: "北京海淀",
      script: "已生成",
    },
    {
      name: "小米",
      industry: "硬件 · 3000+人",
      matchScore: 86,
      ceo: "雷军",
      phone: "010-5551234",
      address: "北京西城",
      script: "已生成",
    },
  ];

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
        .wrap {
          flex: 1;
          overflow-y: auto;
        }
        .header-status {
          padding: 28px 20px 24px;
          text-align: center;
          border-bottom: 1px solid var(--border);
        }
        .success-icon {
          font-size: 48px;
          margin-bottom: 12px;
          display: inline-block;
          animation: celebrate 0.8s ease-out;
        }
        @keyframes celebrate {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.15) rotate(-5deg); }
          75% { transform: scale(1.15) rotate(5deg); }
        }
        .status-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .status-desc {
          font-size: 13px;
          color: var(--muted);
        }
        .ai-recommendation {
          background: var(--card);
          border-left: 3px solid var(--accent);
          padding: 14px 16px;
          margin: 18px 20px 0;
          border-radius: 8px;
        }
        .ai-recommendation-text {
          font-size: 13px;
          color: var(--brand);
          line-height: 1.5;
        }
        .ai-recommendation-text strong {
          font-weight: 700;
        }
        .credit-reward {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 16px;
          margin: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .reward-info {
          flex: 1;
        }
        .reward-text {
          font-size: 12px;
          color: var(--muted);
          margin-bottom: 2px;
        }
        .reward-value {
          font-size: 16px;
          font-weight: 700;
          color: var(--brand);
        }
        .claim-btn {
          padding: 8px 14px;
          background: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: .25s;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .claim-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .stats-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          padding: 14px 20px;
        }
        .stat-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px;
          text-align: center;
        }
        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 11px;
          color: var(--muted);
          font-weight: 600;
        }
        .company-list-section {
          padding: 0 20px 20px;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
          gap: 10px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--brand);
        }
        .filter-btn {
          padding: 6px 12px;
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          color: var(--brand);
          cursor: pointer;
          transition: .2s;
          white-space: nowrap;
        }
        .filter-btn:hover {
          border-color: var(--accent);
          background: var(--card);
        }
        .company-card {
          background: #fff;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px;
          margin-bottom: 10px;
          transition: .2s;
        }
        .company-card:hover {
          border-color: var(--accent);
          box-shadow: var(--shadow);
        }
        .company-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .company-logo {
          width: 40px;
          height: 40px;
          background: var(--accent);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }
        .company-info {
          flex: 1;
        }
        .company-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--brand);
          margin-bottom: 2px;
        }
        .company-match {
          font-size: 12px;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .match-score {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--success);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 11px;
          white-space: nowrap;
        }
        .company-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .detail-item {
          font-size: 11px;
          color: var(--muted);
          line-height: 1.4;
        }
        .detail-item strong {
          color: var(--brand);
          font-weight: 600;
        }
        .bottom-actions {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 32px);
          max-width: 388px;
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 10px;
          z-index: 100;
        }
        .action-btn {
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: .25s;
        }
        .action-btn.secondary {
          background: #fff;
          color: var(--brand);
          border: 1px solid var(--border);
        }
        .action-btn.secondary:hover {
          border-color: var(--accent);
          background: var(--card);
          transform: translateY(-1px);
        }
        .action-btn.primary {
          background: var(--brand);
          color: white;
        }
        .action-btn.primary:hover {
          background: #111827;
          transform: translateY(-1px);
        }
        @media (max-width: 430px) {
          .bottom-actions {
            grid-template-columns: 1fr 1fr;
          }
        }
      `}</style>

      <header className="top">
        <div className="header-title">找客完成</div>
        <div className="spacer"></div>
      </header>

      <main className="wrap">
        <div className="header-status">
          <div className="success-icon">🎉</div>
          <div className="status-title">找客完成！</div>
          <div className="status-desc">已为20家公司完成智能分析</div>
        </div>

        <div className="ai-recommendation">
          <div className="ai-recommendation-text">
            <strong>💡 AI建议：</strong>
            美团的张总明天下午2-4点有空档，建议今天联系预约
          </div>
        </div>

        <div className="credit-reward">
          <div className="reward-info">
            <div className="reward-text">本次获得积分</div>
            <div className="reward-value">50分（约10家）</div>
          </div>
          <button className="claim-btn">立即领取</button>
        </div>

        <div className="stats-summary">
          <div className="stat-card">
            <div className="stat-value">8</div>
            <div className="stat-label">高匹配客户</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">15</div>
            <div className="stat-label">获得联系方式</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">20</div>
            <div className="stat-label">话术已生成</div>
          </div>
        </div>

        <div className="company-list-section">
          <div className="section-header">
            <div className="section-title">📊 客户列表（按匹配度）</div>
            <button className="filter-btn">筛选</button>
          </div>

          {companies.map((company, index) => (
            <div key={index} className="company-card">
              <div className="company-header">
                <div className="company-logo">🏢</div>
                <div className="company-info">
                  <div className="company-name">{company.name}</div>
                  <div className="company-match">
                    {company.industry}
                    <span className="match-score">{company.matchScore}分</span>
                  </div>
                </div>
              </div>
              <div className="company-details">
                <div className="detail-item">
                  <strong>CEO：</strong>
                  {company.ceo}
                </div>
                <div className="detail-item">
                  <strong>电话：</strong>
                  {company.phone}
                </div>
                <div className="detail-item">
                  <strong>地址：</strong>
                  {company.address}
                </div>
                <div className="detail-item">
                  <strong>话术：</strong>
                  {company.script}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="bottom-actions">
        <button className="action-btn secondary" onClick={() => navigate("/")}>
          返回首页
        </button>
        <button
          className="action-btn primary"
          onClick={() => navigate("/buy-credits")}
        >
          查看积分购买
        </button>
      </div>
    </div>
  );
};

export default CompletePage;
