import { useState, useCallback, useMemo } from "react";
import "./CreditsDetailPage.css";
import MenuButtonWithDropdown from "@/components/MenuButtonWithDropdown";
import { useNavigate } from "react-router";

// 类型定义
interface RecordItem {
  id: number;
  icon: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  time: string;
  code?: string;
}

interface DateGroup {
  date: string;
  items: RecordItem[];
}

type FilterType = "all" | "income" | "expense";

const CreditsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  // 状态管理
  const [balance, setBalance] = useState<number>(1250);
  const [canAnalyze, setCanAnalyze] = useState<number>(50);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");

  // 记录数据 - 使用useMemo优化性能
  const records = useMemo<DateGroup[]>(
    () => [
      {
        date: "11月12日",
        items: [
          {
            id: 1,
            icon: "📤",
            title: "快速分析 - 客户线索总表",
            amount: -25,
            type: "expense",
            time: "2025-11-12 14:30",
          },
          {
            id: 2,
            icon: "📤",
            title: "快速分析 - 目标企业筛选",
            amount: -25,
            type: "expense",
            time: "2025-11-12 10:15",
          },
        ],
      },
      {
        date: "11月11日",
        items: [
          {
            id: 3,
            icon: "💳",
            title: "购买标准包",
            amount: 3300,
            type: "income",
            time: "2025-11-11 16:20",
          },
          {
            id: 4,
            icon: "🎁",
            title: "赠送积分",
            amount: 310,
            type: "income",
            time: "2025-11-11 16:20",
          },
        ],
      },
      {
        date: "11月10日",
        items: [
          {
            id: 5,
            icon: "🎉",
            title: "邀请码激活",
            amount: 200,
            type: "income",
            time: "2025-11-10 09:00",
            code: "AIZHAO2025",
          },
        ],
      },
    ],
    [],
  );

  // 筛选后的记录 - 使用useMemo优化性能
  const filteredRecords = useMemo(() => {
    if (currentFilter === "all") return records;

    return records
      .map((dateGroup) => ({
        ...dateGroup,
        items: dateGroup.items.filter((item) => item.type === currentFilter),
      }))
      .filter((dateGroup) => dateGroup.items.length > 0);
  }, [records, currentFilter]);

  // 事件处理函数 - 使用useCallback优化性能
  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const goToRecharge = useCallback(() => {
    navigate("/recharge");
  }, []);

  const showInviteCodeModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);

  const closeInviteCodeModal = useCallback(() => {
    setShowInviteModal(false);
    setInviteCode("");
  }, []);

  const activateInviteCode = useCallback(() => {
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      alert("请输入邀请码");
      return;
    }

    // 模拟验证
    if (trimmedCode === "AIZHAO2025") {
      closeInviteCodeModal();
      setShowSuccessModal(true);

      // 更新余额
      setTimeout(() => {
        setBalance(1450);
        setCanAnalyze(58);
      }, 1000);
    } else {
      alert("邀请码无效或已被使用");
    }
  }, [inviteCode, closeInviteCodeModal]);

  const closeSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    // 刷新页面或更新列表
    window.location.reload();
  }, []);

  const filterRecords = useCallback((type: FilterType) => {
    setCurrentFilter(type);
    console.log("筛选类型:", type);
  }, []);

  const loadMore = useCallback(() => {
    console.log("加载更多记录");
    // TODO: 实现分页加载
  }, []);

  const handleInviteCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteCode(e.target.value.toUpperCase());
  }, []);

  // 渲染筛选标签
  const renderFilterTabs = useMemo(() => {
    const tabs: { key: FilterType; label: string }[] = [
      { key: "all", label: "全部" },
      { key: "income", label: "收入" },
      { key: "expense", label: "支出" },
    ];

    return tabs.map((tab) => (
      <div
        key={tab.key}
        className={`filter-tab ${currentFilter === tab.key ? "active" : ""}`}
        onClick={() => filterRecords(tab.key)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            filterRecords(tab.key);
          }
        }}
      >
        {tab.label}
      </div>
    ));
  }, [currentFilter, filterRecords]);

  // 渲染记录列表
  const renderRecords = useMemo(() => {
    if (filteredRecords.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">暂无记录</div>
          <div className="empty-desc">暂时没有相关的积分记录</div>
          <button className="empty-btn" onClick={goToRecharge}>
            立即充值
          </button>
        </div>
      );
    }

    return (
      <>
        {filteredRecords.map((dateGroup, groupIndex) => (
          <div key={groupIndex} className="date-group">
            <div className="date-header">{dateGroup.date}</div>
            {dateGroup.items.map((item) => (
              <div key={item.id} className="record-item">
                <div className="record-header">
                  <div className="record-title">
                    <span className="record-icon">{item.icon}</span>
                    {item.title}
                  </div>
                  <div className={`record-amount ${item.type}`}>
                    {item.amount > 0 ? "+" : ""}
                    {item.amount}
                  </div>
                </div>
                <div className="record-time">{item.time}</div>
                {item.code && <div className="record-code">邀请码：{item.code}</div>}
              </div>
            ))}
          </div>
        ))}
        <div className="load-more">
          <button className="load-more-btn" onClick={loadMore}>
            加载更多
          </button>
        </div>
      </>
    );
  }, [filteredRecords, goToRecharge, loadMore]);

  return (
    <div className="credits-detail-page">
      <div className="container">
        {/* 顶部导航 */}
        <div className="header">
          <div className="header-left">
            <button className="back-btn" onClick={goBack} aria-label="返回上一页" type="button">
              ←
            </button>
            <div className="header-title">积分明细</div>
          </div>
          <MenuButtonWithDropdown />
        </div>

        {/* 余额卡片 */}
        <div className="balance-card">
          <div className="balance-icon">💎</div>
          <div className="balance-label">当前积分余额</div>
          <div className="balance-amount">
            {balance.toLocaleString()} <span>积分</span>
          </div>
          <div className="balance-desc">约可分析 {canAnalyze} 家企业</div>
          <div className="balance-actions">
            <button className="action-btn primary" onClick={goToRecharge} type="button">
              充值购买
            </button>
            <button className="action-btn secondary" onClick={showInviteCodeModal} type="button">
              使用邀请码
            </button>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="filter-section">
          <div className="filter-title">消费记录</div>
          <div className="filter-tabs">{renderFilterTabs}</div>
        </div>

        {/* 记录列表 */}
        <div className="records-section">{renderRecords}</div>
      </div>

      {/* 邀请码弹窗 */}
      <div
        className={`modal-overlay ${showInviteModal ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
      >
        <div className="modal">
          <div id="invite-modal-title" className="modal-title">
            使用邀请码
          </div>
          <input
            type="text"
            className="modal-input"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            placeholder="请输入邀请码"
            maxLength={12}
            aria-label="邀请码输入"
          />
          <div className="modal-tips">
            <div className="modal-tips-title">💡 使用邀请码即可获得：</div>
            <div className="modal-tips-list">
              • 免费领 200 积分（原价 ¥20）
              <br />• 可免费体验 8 家企业分析
            </div>
          </div>
          <div className="modal-actions">
            <button className="modal-btn cancel" onClick={closeInviteCodeModal} type="button">
              取消
            </button>
            <button
              className="modal-btn confirm"
              onClick={activateInviteCode}
              type="button"
              disabled={!inviteCode.trim()}
            >
              确认激活
            </button>
          </div>
        </div>
      </div>

      {/* 成功弹窗 */}
      <div
        className={`modal-overlay success-modal ${showSuccessModal ? "show" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
      >
        <div className="modal">
          <div id="success-modal-title" className="modal-title">
            激活成功！
          </div>
          <div className="success-icon">🎉</div>
          <div className="success-amount">+200 积分已到账</div>
          <div className="success-desc">现在就可以开始体验了</div>
          <button
            className="modal-btn confirm"
            onClick={closeSuccessModal}
            style={{ width: "100%" }}
            type="button"
          >
            立即体验
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsDetailPage;
