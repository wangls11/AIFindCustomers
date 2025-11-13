import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import {
  deleteRequest,
  getRequest,
  updateRequest,
  UserRequest,
} from "@/api/history";
import "./HistoryAnalysisPage.css";
import { Toast } from "@douyinfe/semi-ui";

const HistoryAnalysisPage = () => {
  const navigate = useNavigate();

  // ======================== State ========================
  type Session = {
    id: number | string;
    name: string;
    status: "0" | "1" | "2" | string;
    progress: number;
    total: number;
    startTime?: string | null;
    pauseTime?: string | null;
    completeTime?: string | null;
  };

  // store sessions separately per status so each tab has its own list and pagination
  const [sessionsMap, setSessionsMap] = useState<Record<string, Session[]>>({
    "0": [],
    "1": [],
    "2": [],
  });
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({
    "0": false,
    "1": false,
    "2": false,
  });
  const [isLoadingMoreMap, setIsLoadingMoreMap] = useState<
    Record<string, boolean>
  >({
    "0": false,
    "1": false,
    "2": false,
  });
  const [pageMap, setPageMap] = useState<Record<string, number>>({
    "0": 1,
    "1": 1,
    "2": 1,
  });
  const [hasMoreMap, setHasMoreMap] = useState<Record<string, boolean>>({
    "0": true,
    "1": true,
    "2": true,
  });
  const [totalsMap, setTotalsMap] = useState<Record<string, number>>({
    "0": 0,
    "1": 0,
    "2": 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [currentFilter, setCurrentFilter] = useState("0");
  const [activeMenuId, setActiveMenuId] = useState<number | string | null>(
    null
  );
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<
    number | string | null
  >(null);
  const [currentSessionStatus, setCurrentSessionStatus] = useState<
    string | null
  >(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteSessionInfo, setDeleteSessionInfo] = useState({
    name: "",
    progress: "",
  });

  // loading states for modal actions
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const renameInputRef = useRef<HTMLInputElement | null>(null);

  // 分页状态
  // (moved to per-status maps)

  // ======================== Derived ========================
  const filteredSessions = sessionsMap[currentFilter] || [];
  // use backend totals when available for tab labels
  const processingCount = totalsMap["0"] ?? sessionsMap["0"].length;
  const pausedCount = totalsMap["1"] ?? sessionsMap["1"].length;
  const completedCount = totalsMap["2"] ?? sessionsMap["2"].length;

  // ======================== Hooks ========================
  useEffect(() => {
    if (showRenameModal && renameInputRef.current) {
      setTimeout(() => {
        renameInputRef.current?.focus();
        renameInputRef.current?.select();
      }, 100);
    }
  }, [showRenameModal]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ======================== Helper ========================
  const mapUserRequestToSession = (r: UserRequest) => {
    const id =
      r.id ?? (r.sessionId as any) ?? Math.random().toString(36).slice(2);
    let name = r.title || `会话 ${id}`;
    try {
      if (r.param) {
        if (typeof r.param === "string") {
          const parsed = JSON.parse(r.param as string);
          if (parsed && (parsed.name || parsed.title))
            name = parsed.name || parsed.title;
        } else if (typeof r.param === "object" && (r.param as any).name) {
          name = (r.param as any).name;
        }
      } else if ((r as any).map && (r as any).map.name) {
        name = (r as any).map.name;
      }
    } catch {}

    const total = Number(r.totalCount ?? 0) || 0;
    const progress = Number(r.successCount ?? 0) || 0;

    const rawStatus = (r.status || "").toString().toLowerCase();
    let status: "0" | "1" | "2" | string = "0";
    if (rawStatus.includes("abort") || rawStatus.includes("disconnect"))
      status = "1";
    else if (rawStatus.includes("terminate") || rawStatus.includes("end"))
      status = "2";
    else status = "0";

    const startTime = r.createTime ?? null;
    const completeTime =
      status === "2" ? r.updateTime ?? r.createTime ?? null : null;
    const pauseTime = status === "1" ? r.updateTime ?? null : null;

    return {
      id,
      name,
      status,
      progress,
      total,
      startTime,
      pauseTime,
      completeTime,
    };
  };

  // ======================== Fetch ========================
  const fetchSessions = async (filter = currentFilter, page = 1) => {
    setError(null);

    // set loading flags per status
    if (page === 1) {
      setLoadingMap((prev) => ({ ...prev, [filter]: true }));
    } else {
      setIsLoadingMoreMap((prev) => ({ ...prev, [filter]: true }));
    }

    try {
      const payload = {
        pageNO: page,
        pageSize: 5,
        type: filter,
      };

      const res = await getRequest(payload as any);
      const pageData = res?.data ?? res;
      const list: UserRequest[] = pageData?.dataList || [];
      const mapped = (list || []).map(mapUserRequestToSession);

      // total returned by backend for this query
      const totalFromApi = Number(pageData?.total ?? 0) || 0;
      setTotalsMap((t) => ({ ...t, [filter]: totalFromApi }));

      if (page === 1) {
        setSessionsMap((prev) => ({ ...prev, [filter]: mapped }));
        setPageMap((p) => ({ ...p, [filter]: 1 }));
      } else {
        setSessionsMap((prev) => ({
          ...prev,
          [filter]: [...(prev[filter] || []), ...mapped],
        }));
        setPageMap((p) => ({ ...p, [filter]: page }));
      }

      if (!list.length || list.length < payload.pageSize) {
        setHasMoreMap((m) => ({ ...m, [filter]: false }));
      } else {
        setHasMoreMap((m) => ({ ...m, [filter]: true }));
      }
    } catch (err: any) {
      console.error("fetchSessions error:", err);
      setError(err?.message || String(err));
    } finally {
      setLoadingMap((prev) => ({ ...prev, [filter]: false }));
      setIsLoadingMoreMap((prev) => ({ ...prev, [filter]: false }));
    }
  };

  // fetch first page for all three statuses when filter changes or on mount so counts are available
  useEffect(() => {
    // initial load for all tabs so counts are displayed immediately
    fetchSessions("0", 1);
    fetchSessions("1", 1);
    fetchSessions("2", 1);

    // keep behavior of switching to a tab: we already have first page, but if it's empty we let fetch handle it
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 滚动加载更多
  useEffect(() => {
    const handleScroll = () => {
      const filter = currentFilter;
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        (hasMoreMap[filter] ?? false) &&
        !(isLoadingMoreMap[filter] ?? false) &&
        !(loadingMap[filter] ?? false)
      ) {
        const nextPage = (pageMap[filter] ?? 1) + 1;
        setPageMap((p) => ({ ...p, [filter]: nextPage }));
        fetchSessions(filter, nextPage);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pageMap, hasMoreMap, isLoadingMoreMap, loadingMap, currentFilter]);

  // ======================== Actions ========================
  const goBack = () => navigate(-1);
  const startNewAnalysis = () => navigate("/select-plan");
  const openSession = (id: number | string, status: string) => {
    console.log("打开会话:", id, "状态:", status);
  };

  const filterSessions = (type: string) => {
    setCurrentFilter(type);
    // Only fetch when we don't already have data for that tab.
    // Avoid resetting pagination here to prevent duplicate fetches/append.
    if (!sessionsMap[type] || sessionsMap[type].length === 0) {
      fetchSessions(type, 1);
    }
  };

  const toggleMenu = (
    e: React.MouseEvent<HTMLElement>,
    id: number | string
  ) => {
    e.stopPropagation();
    setActiveMenuId(activeMenuId === id ? null : id);
  };

  const openRenameModal = (
    e: React.MouseEvent<HTMLElement>,
    id: number | string,
    currentName: string,
    status: string
  ) => {
    e.stopPropagation();
    setCurrentSessionId(id);
    setCurrentSessionStatus(status);
    setRenameValue(currentName);
    setShowRenameModal(true);
    setActiveMenuId(null);
  };

  const closeRenameModal = () => {
    setShowRenameModal(false);
    setCurrentSessionId(null);
  };

  const saveRename = () => {
    const newName = renameValue.trim();
    if (!newName) return alert("名称不能为空");
    // update the correct status list
    const status = currentSessionStatus;
    if (status) {
      setRenameLoading(true);
      updateRequest(currentSessionId + "", newName)
        .then(() => {
          Toast.success("重命名成功");
          setSessionsMap((prev) => ({
            ...prev,
            [status]: (prev[status] || []).map((session) =>
              session.id === currentSessionId
                ? { ...session, name: newName }
                : session
            ),
          }));
        })
        .catch((err) => {
          Toast.error("重命名失败");
        })
        .finally(() => {
          setRenameLoading(false);
          closeRenameModal();
        });
    } else {
      // fallback: update across all lists

      setRenameLoading(true);
      updateRequest(currentSessionId + "", newName)
        .then(() => {
          Toast.success("重命名成功");
          setSessionsMap((prev) => {
            const next: Record<string, Session[]> = { ...prev };
            Object.keys(next).forEach((k) => {
              next[k] = next[k].map((s) =>
                s.id === currentSessionId ? { ...s, name: newName } : s
              );
            });
            return next;
          });
        })
        .catch(() => {
          Toast.error("重命名失败");
        })
        .finally(() => {
          setRenameLoading(false);
          closeRenameModal();
        });
    }
  };

  const openDeleteModal = (
    e: React.MouseEvent<HTMLElement>,
    id: number | string,
    name: string,
    progress: string,
    status: string
  ) => {
    e.stopPropagation();
    setCurrentSessionId(id);
    setCurrentSessionStatus(status);
    setDeleteSessionInfo({
      name: name,
      progress: progress + " 已完成",
    });
    setShowDeleteModal(true);
    setActiveMenuId(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setCurrentSessionId(null);
  };

  const confirmDelete = () => {
    // remove from the correct status list
    const status = currentSessionStatus;
    if (status) {
      setDeleteLoading(true);
      deleteRequest(currentSessionId + "")
        .then(() => {
          Toast.success("删除记录成功");
          // remove locally and decrement total for the status
          setSessionsMap((prev) => {
            const nextList = (prev[status] || []).filter(
              (session) => session.id !== currentSessionId
            );
            const next: Record<string, Session[]> = {
              ...prev,
              [status]: nextList,
            };

            // if this page becomes empty and we have earlier pages, fetch the previous page
            const currentPage = pageMap[status] ?? 1;
            if (nextList.length === 0 && currentPage > 1) {
              const prevPage = currentPage - 1;
              setPageMap((p) => ({ ...p, [status]: prevPage }));
              // fetch previous page to refill
              fetchSessions(status, prevPage);
            }

            return next;
          });

          setTotalsMap((t) => ({
            ...t,
            [status]: Math.max(0, (t[status] ?? 0) - 1),
          }));
        })
        .catch(() => {
          Toast.error("删除记录失败");
        })
        .finally(() => {
          setDeleteLoading(false);
          closeDeleteModal();
        });
    } else {
      setDeleteLoading(true);
      deleteRequest(currentSessionId + "")
        .then(() => {
          // remove from any list that contains the id, decrement totals accordingly,
          // and if any list becomes empty while page > 1, fetch previous page for that list.
          setSessionsMap((prev) => {
            const next: Record<string, Session[]> = { ...prev };
            const removedFrom: string[] = [];

            Object.keys(next).forEach((k) => {
              const before = prev[k] || [];
              const after = before.filter((s) => s.id !== currentSessionId);
              if (after.length !== before.length) removedFrom.push(k);
              next[k] = after;
            });

            // optimistic totals update for all affected statuses
            if (removedFrom.length) {
              setTotalsMap((t) => {
                const nextTotals = { ...t };
                removedFrom.forEach((k) => {
                  nextTotals[k] = Math.max(0, (nextTotals[k] ?? 0) - 1);
                });
                return nextTotals;
              });
            }

            // for any affected list that became empty and had previous pages, fetch previous page
            removedFrom.forEach((k) => {
              const page = pageMap[k] ?? 1;
              if ((next[k] || []).length === 0 && page > 1) {
                const prevPage = page - 1;
                setPageMap((p) => ({ ...p, [k]: prevPage }));
                fetchSessions(k, prevPage);
              }
            });

            return next;
          });
        })
        .catch(() => {
          Toast.error("删除记录失败");
        })
        .finally(() => {
          setDeleteLoading(false);
          closeDeleteModal();
        });
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") saveRename();
  };

  const handleModalOverlayClick = (
    e: React.MouseEvent<HTMLElement>,
    modalType: string
  ) => {
    const target = e.target as HTMLElement;
    if (target.id === modalType) {
      if (modalType === "renameModal") closeRenameModal();
      else if (modalType === "deleteModal") closeDeleteModal();
    }
  };

  // ======================== Render ========================
  return (
    <>
      <div className="containerHistory">
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
            className={`filter-tab ${currentFilter === "0" ? "active" : ""}`}
            onClick={() => filterSessions("0")}
          >
            进行中<span className="tab-count">({processingCount})</span>
          </div>
          <div
            className={`filter-tab ${currentFilter === "1" ? "active" : ""}`}
            onClick={() => filterSessions("1")}
          >
            暂停<span className="tab-count">({pausedCount})</span>
          </div>
          <div
            className={`filter-tab ${currentFilter === "2" ? "active" : ""}`}
            onClick={() => filterSessions("2")}
          >
            已完成<span className="tab-count">({completedCount})</span>
          </div>
        </div>

        {/* 列表内容 */}
        <div className="content">
          {loadingMap[currentFilter] ? (
            <div style={{ padding: 20, color: "#666" }}>加载中...</div>
          ) : error ? (
            <div style={{ padding: 20, color: "#ff4d4f" }}>错误：{error}</div>
          ) : filteredSessions.length === 0 ? (
            <div style={{ padding: 20, color: "#999" }}>暂无数据</div>
          ) : (
            <>
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  className={`session-card ${
                    session.status === "0" ? "processing" : ""
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
                      <div
                        className={`dropdown-menu ${
                          activeMenuId === session.id ? "show" : ""
                        }`}
                      >
                        <div
                          className="menu-item"
                          onClick={(e) =>
                            openRenameModal(
                              e,
                              session.id,
                              session.name,
                              session.status
                            )
                          }
                        >
                          <span className="menu-icon">✏️</span>重命名
                        </div>
                        <div
                          className="menu-item danger"
                          onClick={(e) =>
                            openDeleteModal(
                              e,
                              session.id,
                              session.name,
                              `${session.progress}/${session.total}`,
                              session.status
                            )
                          }
                        >
                          <span className="menu-icon">🗑️</span>删除会话
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="card-info">
                    <div className="info-item">
                      <span className="info-icon">📊</span>进度：
                      {session.progress}/{session.total}
                    </div>
                    <div className="info-item">
                      <span className="info-icon">⏰</span>开始于：
                      {session.startTime}
                    </div>
                    {session.pauseTime && (
                      <div className="info-item">
                        <span className="info-icon">⏸️</span>暂停于：
                        {session.pauseTime}
                      </div>
                    )}
                    {session.completeTime && (
                      <div className="info-item">
                        <span className="info-icon">✅</span>完成于：
                        {session.completeTime}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* 底部加载提示 */}
              <div
                style={{ textAlign: "center", padding: "12px", color: "#999" }}
              >
                {isLoadingMoreMap[currentFilter]
                  ? "加载中..."
                  : hasMoreMap[currentFilter]
                  ? "下拉加载更多"
                  : "已加载全部数据"}
              </div>
            </>
          )}
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
            <button
              className="modal-btn primary"
              onClick={saveRename}
              disabled={renameLoading}
            >
              {renameLoading ? "保存中..." : "保存"}
            </button>
          </div>
        </div>
      </div>

      {/* 删除弹窗 */}
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
            <button
              className="modal-btn danger"
              onClick={confirmDelete}
              disabled={deleteLoading}
            >
              {deleteLoading ? "删除中..." : "确认删除"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HistoryAnalysisPage;
