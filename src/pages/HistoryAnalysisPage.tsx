import React, { useState, useEffect, useRef } from "react";

const HistoryAnalysisPage = () => {
  // 初始化会话数据
  const [sessions, setSessions] = useState([
    {
      id: 1,
      name: "客户线索总表 - 11/12",
      status: "processing",
      progress: 15,
      total: 100,
      startTime: "2025-11-12 10:30:15",
      pauseTime: null,
      completeTime: null,
    },
    {
      id: 2,
      name: "客户线索总表 - 11/11",
      status: "paused",
      progress: 30,
      total: 100,
      startTime: "2025-11-11 13:20:30",
      pauseTime: "2025-11-11 15:18:45",
      completeTime: null,
    },
    {
      id: 3,
      name: "新客户线索 - 11/10",
      status: "paused",
      progress: 20,
      total: 50,
      startTime: "2025-11-10 14:00:20",
      pauseTime: "2025-11-10 14:30:50",
      completeTime: null,
    },
    {
      id: 4,
      name: "季度分析 - 11/08",
      status: "paused",
      progress: 40,
      total: 80,
      startTime: "2025-11-08 15:30:10",
      pauseTime: "2025-11-08 16:00:30",
      completeTime: null,
    },
    {
      id: 5,
      name: "新客户线索·10月批次",
      status: "completed",
      progress: 20,
      total: 20,
      startTime: "2025-11-08 09:00:10",
      pauseTime: null,
      completeTime: "2025-11-08 09:15:20",
    },
    {
      id: 6,
      name: "客户线索总表 - 11/4",
      status: "completed",
      progress: 30,
      total: 30,
      startTime: "2025-11-04 09:00:00",
      pauseTime: null,
      completeTime: "2025-11-04 09:20:00",
    },
    {
      id: 7,
      name: "季度客户分析 - 10/28",
      status: "completed",
      progress: 50,
      total: 50,
      startTime: "2025-10-28 14:00:00",
      pauseTime: null,
      completeTime: "2025-10-28 14:30:00",
    },
  ]);

  const [currentFilter, setCurrentFilter] = useState("processing");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteSessionInfo, setDeleteSessionInfo] = useState({
    name: "",
    progress: "",
  });

  const renameInputRef = useRef<HTMLInputElement | null>(null);

  // 筛选会话
  const filteredSessions = sessions.filter((s) => s.status === currentFilter);

  // 计数
  const processingCount = sessions.filter(
    (s) => s.status === "processing"
  ).length;
  const pausedCount = sessions.filter((s) => s.status === "paused").length;
  const completedCount = sessions.filter(
    (s) => s.status === "completed"
  ).length;

  // 自动聚焦重命名输入框
  useEffect(() => {
    const input = renameInputRef.current;
    if (showRenameModal && input) {
      setTimeout(() => {
        input.focus();
        input.select();
      }, 100);
    }
  }, [showRenameModal]);

  // 点击页面关闭菜单
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenuId(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 打开会话
  const openSession = (id: number, status: string) => {
    console.log("打开会话:", id, "状态:", status);
    // 跳转到 Page 3
  };

  // 筛选会话
  const filterSessions = (type: string) => {
    setCurrentFilter(type);
    console.log("筛选类型:", type);
  };

  // 切换菜单
  const toggleMenu = (e: React.MouseEvent<HTMLElement>, id: number) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  // 返回
  const goBack = () => {
    console.log("返回上一页");
  };

  // 新建分析
  const startNewAnalysis = () => {
    console.log("开始新分析");
  };

  // 打开重命名弹窗
  const openRenameModal = (
    e: React.MouseEvent<HTMLElement>,
    id: number,
    currentName: string
  ) => {
    e.stopPropagation();
    setCurrentSessionId(id);
    setRenameValue(currentName);
    setShowRenameModal(true);
    setActiveMenuId(null);
  };

  // 关闭重命名弹窗
  const closeRenameModal = () => {
    setShowRenameModal(false);
    setCurrentSessionId(null);
  };

  // 保存重命名
  const saveRename = () => {
    const newName = renameValue.trim();
    if (!newName) {
      alert("名称不能为空");
      return;
    }

    console.log("重命名会话", currentSessionId, "为:", newName);

    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === currentSessionId
          ? { ...session, name: newName }
          : session
      )
    );

    closeRenameModal();
  };

  // 打开删除确认弹窗
  const openDeleteModal = (
    e: React.MouseEvent<HTMLElement>,
    id: number,
    name: string,
    progress: string
  ) => {
    e.stopPropagation();
    setCurrentSessionId(id);
    setDeleteSessionInfo({
      name: name,
      progress: progress + " 已完成",
    });
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  // 关闭删除弹窗
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentSessionId(null);
  };

  // 确认删除
  const confirmDelete = () => {
    console.log("删除会话:", currentSessionId);

    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== currentSessionId)
    );

    closeDeleteModal();
  };

  // 回车键保存重命名
  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveRename();
    }
  };

  // 点击遮罩关闭弹窗
  const handleModalOverlayClick = (
    e: React.MouseEvent<HTMLElement>,
    modalType: string
  ) => {
    const target = e.target as HTMLElement;
    if (target.id === modalType) {
      if (modalType === "renameModal") {
        closeRenameModal();
      } else if (modalType === "deleteModal") {
        closeDeleteModal();
      }
    }
  };

  return (
    <>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
          background: #f5f5f5;
        }

        .container {
          margin: 0 auto;
          background: white;
          min-height: 100vh;
        }

        /* 顶部导航栏 */
        .header {
          padding: 16px 20px;
          background: white;
          border-bottom: 1px solid #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
        }

        .back-btn {
          font-size: 18px;
          margin-right: 12px;
          color: #333;
          cursor: pointer;
        }

        .header-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        .new-analysis-btn {
          padding: 8px 16px;
          background: #1890ff;
          border: none;
          border-radius: 6px;
          color: white;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .new-analysis-btn:hover {
          background: #40a9ff;
        }

        .new-analysis-btn:disabled {
          background: #d9d9d9;
          cursor: not-allowed;
        }

        /* 统计区域 */
        .stats-section {
          padding: 20px;
          background: #fafafa;
          border-bottom: 1px solid #f0f0f0;
        }

        .stats-title {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 12px;
        }

        .stats-item {
          font-size: 13px;
          color: #666;
          line-height: 1.8;
        }

        .stats-number {
          font-weight: 600;
          color: #1890ff;
        }

        /* 筛选标签栏 */
        .filter-tabs {
          display: flex;
          padding: 0 20px;
          background: white;
          border-bottom: 1px solid #f0f0f0;
        }

        .filter-tab {
          flex: 1;
          padding: 14px 0;
          text-align: center;
          font-size: 14px;
          color: #666;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
        }

        .filter-tab:hover {
          color: #1890ff;
        }

        .filter-tab.active {
          color: #1890ff;
          border-bottom-color: #1890ff;
        }

        .filter-tab .tab-count {
          margin-left: 4px;
          font-size: 12px;
          color: #999;
        }

        .filter-tab.active .tab-count {
          color: #1890ff;
        }

        /* 列表内容 */
        .content {
          padding: 16px;
        }

        /* 会话卡片 */
        .session-card {
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          transition: all 0.2s ease;
          position: relative;
          cursor: pointer;
        }

        .session-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          border-color: #1890ff;
        }

        /* 进行中会话呼吸动效 */
        .session-card.processing {
          animation: breathingCard 3s ease-in-out infinite;
        }

        @keyframes breathingCard {
          0%, 100% {
            border-color: #e8e8e8;
            box-shadow: 0 0 0 rgba(82, 196, 26, 0);
          }
          50% {
            border-color: rgba(82, 196, 26, 0.6);
            box-shadow: 0 0 12px rgba(82, 196, 26, 0.3);
          }
        }

        /* 卡片头部 */
        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .session-name {
          flex: 1;
          font-size: 15px;
          font-weight: 500;
          color: #333;
          line-height: 1.4;
          word-break: break-word;
        }

        .more-btn {
          padding: 4px 8px;
          background: transparent;
          border: none;
          font-size: 18px;
          color: #999;
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
          margin-left: 12px;
          z-index: 2;
        }

        .more-btn:hover {
          color: #333;
        }

        /* 卡片信息 */
        .card-info {
          margin-bottom: 0;
        }

        .info-item {
          font-size: 13px;
          color: #666;
          line-height: 1.8;
          display: flex;
          align-items: center;
        }

        .info-icon {
          margin-right: 6px;
          font-size: 14px;
        }

        /* 下拉菜单 */
        .dropdown-menu {
          position: absolute;
          top: 40px;
          right: 16px;
          background: white;
          border: 1px solid #e8e8e8;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          min-width: 140px;
          z-index: 10;
          display: none;
        }

        .dropdown-menu.show {
          display: block;
        }

        .menu-item {
          padding: 12px 16px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .menu-item:hover {
          background: #f5f5f5;
        }

        .menu-item:first-child {
          border-radius: 8px 8px 0 0;
        }

        .menu-item:last-child {
          border-radius: 0 0 8px 8px;
        }

        .menu-item.danger {
          color: #ff4d4f;
        }

        .menu-item.danger:hover {
          background: #fff1f0;
        }

        .menu-icon {
          margin-right: 8px;
          font-size: 16px;
        }

        /* 弹窗遮罩 */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: none;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-overlay.show {
          display: flex;
        }

        /* 重命名弹窗 */
        .modal {
          width: 90%;
          max-width: 400px;
          background: white;
          border-radius: 12px;
          padding: 24px;
        }

        .modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 16px;
        }

        .modal-input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid #d9d9d9;
          border-radius: 6px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .modal-input:focus {
          outline: none;
          border-color: #1890ff;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
        }

        .modal-btn {
          flex: 1;
          height: 40px;
          border: 1px solid #d9d9d9;
          background: white;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-btn:hover {
          border-color: #1890ff;
          color: #1890ff;
        }

        .modal-btn.primary {
          background: #1890ff;
          border-color: #1890ff;
          color: white;
        }

        .modal-btn.primary:hover {
          background: #40a9ff;
        }

        /* 删除确认弹窗 */
        .delete-modal {
          width: 90%;
          max-width: 400px;
          background: white;
          border-radius: 12px;
          padding: 24px;
        }

        .delete-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .delete-content {
          margin-bottom: 16px;
        }

        .delete-session-name {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
        }

        .delete-warning {
          font-size: 13px;
          color: #ff4d4f;
          line-height: 1.6;
        }

        .modal-btn.danger {
          background: #ff4d4f;
          border-color: #ff4d4f;
          color: white;
        }

        .modal-btn.danger:hover {
          background: #ff7875;
        }
      `}</style>

      <div className="container">
        {/* 顶部导航 */}
        <div className="header">
          <div className="header-left">
            <span className="back-btn" onClick={goBack}>
              ←
            </span>
            <span className="header-title">历史分析</span>
          </div>
          <button className="new-analysis-btn" onClick={startNewAnalysis}>
            + 新建分析
          </button>
        </div>

        {/* 统计区域 */}
        <div className="stats-section">
          <div className="stats-title">📊 数据统计</div>
          <div className="stats-item">
            累计分析企业：<span className="stats-number">1,247</span> 家
          </div>
          <div className="stats-item">
            已完成会话：<span className="stats-number">12</span> 个
          </div>
        </div>

        {/* 筛选标签栏 */}
        <div className="filter-tabs">
          <div
            className={`filter-tab ${
              currentFilter === "processing" ? "active" : ""
            }`}
            onClick={() => filterSessions("processing")}
          >
            进行中<span className="tab-count">({processingCount})</span>
          </div>
          <div
            className={`filter-tab ${
              currentFilter === "paused" ? "active" : ""
            }`}
            onClick={() => filterSessions("paused")}
          >
            暂停<span className="tab-count">({pausedCount})</span>
          </div>
          <div
            className={`filter-tab ${
              currentFilter === "completed" ? "active" : ""
            }`}
            onClick={() => filterSessions("completed")}
          >
            已完成<span className="tab-count">({completedCount})</span>
          </div>
        </div>

        {/* 列表内容 */}
        <div className="content">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`session-card ${
                session.status === "processing" ? "processing" : ""
              }`}
              onClick={() => openSession(session.id, session.status)}
            >
              <div className="card-header">
                <div className="session-name">{session.name}</div>
                <button
                  className="more-btn"
                  onClick={(e) => toggleMenu(e, session.id)}
                >
                  ⋯
                </button>
                <div
                  className={`dropdown-menu ${
                    activeMenuId === session.id ? "show" : ""
                  }`}
                >
                  <div
                    className="menu-item"
                    onClick={(e) =>
                      openRenameModal(e, session.id, session.name)
                    }
                  >
                    <span className="menu-icon">✏️</span>
                    重命名
                  </div>
                  <div
                    className="menu-item danger"
                    onClick={(e) =>
                      openDeleteModal(
                        e,
                        session.id,
                        session.name,
                        `${session.progress}/${session.total}`
                      )
                    }
                  >
                    <span className="menu-icon">🗑️</span>
                    删除会话
                  </div>
                </div>
              </div>

              <div className="card-info">
                <div className="info-item">
                  <span className="info-icon">📊</span>
                  进度：{session.progress}/{session.total}
                </div>
                <div className="info-item">
                  <span className="info-icon">⏰</span>
                  开始于：{session.startTime}
                </div>
                {session.pauseTime && (
                  <div className="info-item">
                    <span className="info-icon">⏸️</span>
                    暂停于：{session.pauseTime}
                  </div>
                )}
                {session.completeTime && (
                  <div className="info-item">
                    <span className="info-icon">✅</span>
                    完成于：{session.completeTime}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 重命名弹窗 */}
      <div
        className={`modal-overlay ${showRenameModal ? "show" : ""}`}
        id="renameModal"
        onClick={(e) => handleModalOverlayClick(e, "renameModal")}
      >
        <div className="modal">
          <div className="modal-title">重命名会话</div>
          <input
            type="text"
            className="modal-input"
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            placeholder="请输入新名称"
          />
          <div className="modal-actions">
            <button className="modal-btn" onClick={closeRenameModal}>
              取消
            </button>
            <button className="modal-btn primary" onClick={saveRename}>
              保存
            </button>
          </div>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      <div
        className={`modal-overlay ${showDeleteModal ? "show" : ""}`}
        id="deleteModal"
        onClick={(e) => handleModalOverlayClick(e, "deleteModal")}
      >
        <div className="delete-modal">
          <div className="delete-title">确认删除会话？</div>
          <div className="delete-content">
            <div className="delete-session-name">{deleteSessionInfo.name}</div>
            <div className="delete-session-name">
              {deleteSessionInfo.progress}
            </div>
            <div className="delete-warning">
              ⚠️ 删除后无法恢复
              <br />
              已同步的数据不受影响
            </div>
          </div>
          <div className="modal-actions">
            <button className="modal-btn" onClick={closeDeleteModal}>
              取消
            </button>
            <button className="modal-btn danger" onClick={confirmDelete}>
              确认删除
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryAnalysisPage;
