import { useState, useCallback, useMemo, useEffect } from "react";
import { Modal, Button, Input, Toast } from "@douyinfe/semi-ui";
import "./CreditsDetailPage.css";
import MenuButtonWithDropdown from "@/components/MenuButtonWithDropdown";
import { useNavigate } from "react-router";
import {
  exchange,
  getDetails,
  type CreditsDetailRecord,
  type CreditsDetailsResponse,
} from "@/api/user";
import { useUser } from "@/contexts/UserContext";

// 类型定义 - 更新为与API数据匹配
interface RecordItem {
  id: string;
  icon: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  time: string;
  code?: string;
  businessType: string; // 业务类型
  changeAmount: number; // 变化金额
  deductionNo?: string; // 扣除单号
  businessId?: string; // 业务ID
}

interface DateGroup {
  date: string;
  items: RecordItem[];
}

type FilterType = "all" | "income" | "expense";

const CreditsDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, refreshUserInfo } = useUser();
  // 状态管理
  const [currentFilter, setCurrentFilter] = useState<FilterType>("all");
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // 积分明细相关状态
  const [detailsData, setDetailsData] = useState<CreditsDetailsResponse>({
    total: 0,
    dataList: [],
  });
  const [detailsLoading, setDetailsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10); // 每页数量
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    refreshUserInfo();
    loadDetailsData();
  }, []);

  // 加载积分明细数据
  const loadDetailsData = useCallback(
    async (reset: boolean = false) => {
      if (detailsLoading) return;

      setDetailsLoading(true);
      const page = reset ? 1 : currentPage;

      try {
        const data = await getDetails({
          pageNO: page,
          pageSize: pageSize,
        });

        setHasMore(page < Math.ceil(data.total / pageSize));

        if (reset) {
          setDetailsData(data);
          setCurrentPage(2);
        } else {
          setDetailsData((prev) => ({
            total: data.total,
            dataList: [...prev.dataList, ...data.dataList],
          }));
          setCurrentPage((prev) => prev + 1);
        }
      } catch (error: any) {
        console.error("获取积分明细失败:", error);
        Toast.error({ content: "获取积分明细失败，请稍后重试" });
      } finally {
        setDetailsLoading(false);
      }
    },
    [currentPage, pageSize, detailsLoading],
  );

  // 将API数据转换为页面需要的格式
  const transformApiData = useCallback((apiData: CreditsDetailRecord[]): DateGroup[] => {
    if (apiData.length === 0) return [];

    // 按日期分组
    const groupedByDate = apiData.reduce((groups, item) => {
      const date = new Date().toLocaleDateString("zh-CN", {
        month: "numeric",
        day: "numeric",
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push({
        id: item.id,
        icon: getIconByBusinessType(item.businessType),
        title: item.title,
        amount: item.changeAmount || item.amount,
        type: (item.changeAmount || item.amount) >= 0 ? "income" : "expense",
        time: new Date().toLocaleString("zh-CN"), // 临时时间，需要后端提供
        code: item.deductionNo,
        businessType: item.businessType,
        changeAmount: item.changeAmount || item.amount,
        deductionNo: item.deductionNo,
        businessId: item.businessId,
      });
      return groups;
    }, {} as Record<string, RecordItem[]>);

    // 转换为DateGroup数组
    return Object.entries(groupedByDate).map(([date, items]) => ({
      date,
      items,
    }));
  }, []);

  // 根据业务类型获取图标
  const getIconByBusinessType = useCallback((businessType: string): string => {
    const iconMap: Record<string, string> = {
      recharge: "💳", // 充值
      consumption: "📤", // 消费
      bonus: "🎁", // 赠送
      invitation: "🎉", // 邀请
      refund: "↩️", // 退款
    };
    return iconMap[businessType] || "📝";
  }, []);

  // 记录数据 - 使用useMemo优化性能，现在基于API数据
  const records = useMemo<DateGroup[]>(() => {
    return transformApiData(detailsData.dataList);
  }, [detailsData.dataList, transformApiData]);

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

  const filterRecords = useCallback((type: FilterType) => {
    setCurrentFilter(type);
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore && !detailsLoading) {
      loadDetailsData(false);
    }
  }, [hasMore, detailsLoading, loadDetailsData]);

  // 刷新数据
  const refreshData = useCallback(() => {
    setCurrentPage(1);
    loadDetailsData(true);
  }, [loadDetailsData]);

  const handleInviteCodeChange = useCallback((value: string) => {
    setInviteCode(value);
  }, []);

  const activateInviteCode = useCallback(async () => {
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      Toast.error({ content: "请输入邀请码" });
      return;
    }

    setLoading(true);
    try {
      await exchange(trimmedCode);
      refreshUserInfo();
      closeInviteCodeModal();
      Toast.success({ content: "邀请码激活成功！" });
    } catch (error: any) {
      console.error("邀请码激活失败:", error);
      Toast.error({ content: error.message || "邀请码无效或已被使用" });
    } finally {
      setLoading(false);
    }
  }, [inviteCode, closeInviteCodeModal]);

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
    // 加载中状态
    if (detailsLoading && currentPage === 1) {
      return (
        <div className="loading-state">
          <div className="loading-spinner">⏳</div>
          <div className="loading-text">正在加载积分明细...</div>
        </div>
      );
    }

    // 空数据状态
    if (filteredRecords.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">暂无记录</div>
          <div className="empty-desc">
            {detailsLoading ? "正在加载..." : "暂时没有相关的积分记录"}
          </div>
          {!detailsLoading && (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button className="empty-btn secondary" onClick={refreshData}>
                刷新
              </button>
            </div>
          )}
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
                {item.businessType && (
                  <div className="record-code">业务类型：{item.businessType}</div>
                )}
                {item.deductionNo && <div className="record-code">单号：{item.deductionNo}</div>}
              </div>
            ))}
          </div>
        ))}

        {/* 加载更多 */}
        {hasMore && (
          <div className="load-more">
            <button className="load-more-btn" onClick={loadMore} disabled={detailsLoading}>
              {detailsLoading ? "加载中..." : "加载更多"}
            </button>
          </div>
        )}

        {/* 已加载完毕 */}
        {!hasMore && detailsData.dataList.length > 0 && (
          <div className="load-more">
            <div className="load-more-text">已加载全部记录</div>
            <button className="refresh-btn" onClick={refreshData}>
              刷新
            </button>
          </div>
        )}
      </>
    );
  }, [
    filteredRecords,
    goToRecharge,
    loadMore,
    hasMore,
    detailsLoading,
    refreshData,
    detailsData.dataList.length,
  ]);

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
            {userInfo?.integral.toLocaleString()} <span>积分</span>
          </div>
          {userInfo?.integral && (
            <div className="balance-desc">
              约可分析 {userInfo?.integral && userInfo.integral / 50} 家企业
            </div>
          )}
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
          <div className="filter-title">
            消费记录
            <button className="refresh-icon" onClick={refreshData} title="刷新">
              🔄
            </button>
          </div>
          <div className="filter-tabs">{renderFilterTabs}</div>
        </div>

        {/* 记录列表 */}
        <div className="records-section">{renderRecords}</div>
      </div>

      {/* 邀请码弹窗 */}
      <Modal
        title="使用邀请码"
        visible={showInviteModal}
        onCancel={closeInviteCodeModal}
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={closeInviteCodeModal}>取消</Button>
            <Button
              theme="solid"
              type="primary"
              onClick={activateInviteCode}
              disabled={!inviteCode.trim() || loading}
              loading={loading}
            >
              确认激活
            </Button>
          </div>
        }
        centered
      >
        <div style={{ marginBottom: "16px" }}>
          <Input
            placeholder="请输入邀请码"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            style={{ width: "100%" }}
          />
        </div>
        <div className="modal-tips">
          <div className="modal-tips-title">💡 使用邀请码即可获得：</div>
          <div className="modal-tips-list">
            • 免费领 100 积分（原价 ¥10）
            <br />• 可免费体验 8 家企业分析
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreditsDetailPage;
