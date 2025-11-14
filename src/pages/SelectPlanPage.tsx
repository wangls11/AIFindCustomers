import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./SelectPlanPage.scss";
import { bitable } from "@lark-base-open/js-sdk";
import { getUserAnalysisPlan, saveUserAnalysisPlan, UserAnalysisPlanVO } from "@/api";
import MenuButtonWithDropdown from "@/components/MenuButtonWithDropdown";

type AppState = {
  selectedTable: string | null;
  selectedView: string | null;
  selectedFields: string[];
  selectedRecords: string[];
  currentPlan: "quick" | "custom";
};

const SelectPlanPage: React.FC = () => {
  const navigate = useNavigate();

  const [state, setState] = useState<AppState>({
    selectedTable: null,
    selectedView: null,
    selectedFields: [],
    selectedRecords: [],
    currentPlan: "quick",
  });

  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showViewDropdown, setShowViewDropdown] = useState<boolean>(false);
  const [showFieldsSection, setShowFieldsSection] = useState<boolean>(false);
  const [showRecordsSection, setShowRecordsSection] = useState<boolean>(false);
  const [fieldCount, setFieldCount] = useState<number>(0);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [errors, setErrors] = useState<{
    table: string;
    view: string;
    field: string;
    record: string;
  }>({
    table: "",
    view: "",
    field: "",
    record: "",
  });
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [selectedViewOption, setSelectedViewOption] = useState<string>("");
  const [productInfo, setProductInfo] = useState<{
    productType: string;
    valueProps: string[];
    companySize: string;
    budget: string;
    industries: string[];
    remark: string;
  }>({
    productType: "",
    valueProps: [],
    companySize: "",
    budget: "",
    industries: [],
    remark: "",
  });
  const [charCount, setCharCount] = useState<number>(0);
  const [valuePropsCount, setValuePropsCount] = useState<number>(0);
  const [showOtherInputs, setShowOtherInputs] = useState<{
    productType: boolean;
    companySize: boolean;
    budget: boolean;
    valueProp: boolean;
    industry: boolean;
  }>({
    productType: false,
    companySize: false,
    budget: false,
    valueProp: false,
    industry: false,
  });

  // SDK loaded data
  const [tables, setTables] = useState<{ id: string; name: string }[]>([]);
  const [views, setViews] = useState<{ id: string; name: string }[]>([]);
  const [fieldsByTable, setFieldsByTable] = useState<
    Record<string, { id: string; name: string }[]>
  >({});
  const [loadingTables, setLoadingTables] = useState<boolean>(false);
  const [loadingFields, setLoadingFields] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [planId, setPlanId] = useState<string>("");

  const valuePropOptions = [
    "成本降低",
    "效率提升",
    "AI 智能",
    "实时数据",
    "数据安全",
    "定制化",
    "易用性",
    "集成能力",
  ];

  const industryOptions = ["互联网", "金融", "零售", "制造", "教育"];

  // Pick preferred table: prefer current selection's table, else first
  const chooseTargetTable = async (
    list: { id: string; name: string }[],
    sdk: any,
    currentViewId: string | null,
  ): Promise<{ id: string; name: string }> => {
    try {
      const selection = await sdk?.base?.getSelection?.();
      const currentId = selection?.tableId;
      const found = list.find((t) => t.id === currentId);

      const table = await sdk.base.getTable(currentId);
      const viewMetaList = await table.getViewMetaList();
      const views = viewMetaList.map((v: any) => ({ id: v.id, name: v.name }));
      setSelectedViewOption(
        views?.length > 0
          ? views.filter((item: { id: string; name: string }) => item.id === currentViewId)[0]?.name
          : "",
      );

      setViews(views);
      return found ?? list[0];
    } catch {
      return list[0];
    }
  };

  const fetchUserAnalysisPlan = async (tableId: string, viewId: string) => {
    const res = (await getUserAnalysisPlan({
      table_id: tableId,
      view_id: viewId,
    })) as UserAnalysisPlanVO;
    console.log(res);

    if (res) {
      setPlanId(res.id || "");
    }
  };

  useEffect(() => {
    const applyMax = () => {
      const leftSidebar = (window as any).__LEFT_SIDEBAR_WIDTH__ || 280;
      const pageWidth = window.innerWidth || document.documentElement.clientWidth;
      const maxW = Math.max(410, pageWidth - leftSidebar - 80);
    };
    applyMax();
    window.addEventListener("resize", applyMax);
    return () => window.removeEventListener("resize", applyMax);
  }, []);

  // Load tables from Lark Base
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTables(true);
        setLoadError("");
        const sdk: any = bitable ?? (window as any).bitable;
        const selection = await sdk?.base?.getSelection?.();
        fetchUserAnalysisPlan(selection?.tableId, selection?.viewId);
        const currentTableId = selection?.tableId ?? null;
        const currentViewId = selection?.viewId ?? null;
        if (currentTableId) {
          setState((prev) => ({
            ...prev,
            selectedTable: currentTableId,
            selectedView: currentViewId,
          }));
        }
        // Prefer SDK import; fall back to window if needed
        if (!sdk?.base) {
          throw new Error("未检测到 Lark Base 运行环境");
        }
        // Get all tables
        // Some SDK versions expose getTableList() returning ITable[]
        let tableInstances: any[] = [];
        if (typeof sdk.base.getTableList === "function") {
          tableInstances = await sdk.base.getTableList();
        } else if (typeof sdk.base.getTables === "function") {
          tableInstances = await sdk.base.getTables();
        } else if (typeof sdk.base.getTableMetaList === "function") {
          const metaList = await sdk.base.getTableMetaList();
          // Map metas to minimal objects
          const mapped = metaList.map((m: any) => ({ id: m.id, name: m.name }));
          if (mounted) setTables(mapped);
          // Auto select first
          if (mounted && mapped.length > 0) {
            const target = await chooseTargetTable(mapped, sdk, currentViewId);
            setSelectedOption(target.name);
            selectTable(target.id, target.name, sdk);
          }
          setLoadingTables(false);
          return;
        }

        // Resolve id/name from table instances
        const mapped = await Promise.all(
          tableInstances.map(async (t: any) => {
            try {
              const meta = await t.getMeta?.();
              return {
                id: meta?.id ?? t.id,
                name: meta?.name ?? (await t.getName?.()),
              };
            } catch {
              return {
                id: t.id,
                name: typeof t.getName === "function" ? await t.getName() : t.name,
              };
            }
          }),
        );
        if (!mounted) return;
        setTables(mapped);
        if (mapped.length > 0) {
          const target = await chooseTargetTable(mapped, sdk, currentViewId);
          setSelectedOption(target.name);
          selectTable(target.id, target.name, sdk);
        }
      } catch (err: any) {
        if (mounted) setLoadError(err?.message || "加载表失败");
      } finally {
        if (mounted) setLoadingTables(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleDropdown = () => setShowDropdown((v) => !v);

  const toggleViewDropdown = () => setShowViewDropdown((v) => !v);

  const selectOption = async (tableId: string, label: string) => {
    setSelectedOption(label);
    setShowDropdown(false);
    selectTable(tableId, label);
    const table = await bitable.base.getTable(tableId);
    const viewMetaList = await table.getViewMetaList();
    const views = viewMetaList.map((v: any) => ({ id: v.id, name: v.name }));
    setState((prev) => ({
      ...prev,
      selectedView: views?.length > 0 ? views[0].id : null,
    }));
    setSelectedViewOption(views?.length > 0 ? views[0].name : "");
  };

  const selectViewOption = (viewId: string, label: string) => {
    setSelectedViewOption(label);
    setShowViewDropdown(false);
    selectView(viewId, label);
  };

  const selectTable = async (tableId: string, label?: string, existingSdk?: any) => {
    if (!tableId) return;
    setState((prev) => ({
      ...prev,
      selectedTable: tableId,
      selectedFields: [],
      selectedRecords: [],
    }));
    setShowFieldsSection(true);
    setShowRecordsSection(true);
    setFieldCount(0);
    setRecordCount(0);
    setErrors({ table: "", view: "", field: "", record: "" });
    if (label) setSelectedOption(label);
    // Load fields for this table if not present
    if (!fieldsByTable[tableId]) {
      try {
        setLoadingFields(true);
        const sdk: any = existingSdk ?? bitable ?? (window as any).bitable;
        if (!sdk?.base) return;
        const table = await sdk.base.getTable?.(tableId);
        if (!table) return;
        let fieldMetas: any[] = [];
        if (typeof table.getFieldMetaList === "function") {
          const view = await table.getActiveView();

          fieldMetas = await view.getFieldMetaList();

          const compony = fieldMetas.find((m: any) => m.name === "企业名称");

          if (compony) {
            setState((prev) => {
              setFieldCount(1);
              return { ...prev, selectedFields: [compony.id] };
            });
          }
        } else if (typeof table.getFieldList === "function") {
          const fieldInstances = await table.getFieldList();
          fieldMetas = await Promise.all(
            fieldInstances.map(async (f: any) => {
              try {
                const meta = await f.getMeta?.();
                return meta ?? { id: f.id, name: await f.getName?.() };
              } catch {
                return {
                  id: f.id,
                  name: typeof f.getName === "function" ? await f.getName() : f.name,
                };
              }
            }),
          );
        }
        const mappedFields = fieldMetas
          .map((m: any) => ({ id: m.id, name: m.name }))
          .filter((m: any) => m.id && m.name);
        setFieldsByTable((prev) => ({ ...prev, [tableId]: mappedFields }));
      } finally {
        setLoadingFields(false);
      }
    }
  };

  const selectView = async (viewId: string, label?: string) => {
    if (!viewId) return;
    setState((prev) => ({ ...prev, selectedView: viewId }));
    if (label) setSelectedViewOption(label);
  };

  const toggleField = (fieldId: string) => {
    setState((prev) => {
      const newFields = prev.selectedFields.includes(fieldId)
        ? prev.selectedFields.filter((id) => id !== fieldId)
        : [...prev.selectedFields, fieldId];
      setFieldCount(newFields.length);
      return { ...prev, selectedFields: newFields };
    });
  };

  const selectRecords = async () => {
    if (!state.selectedTable) return;
    try {
      const sdk: any = bitable ?? (window as any).bitable;
      if (!sdk?.base || !sdk?.ui) return;
      // Use current selection to get view
      const selection = await sdk.base.getSelection?.();
      const tableId = state.selectedTable;
      const viewId = selection?.viewId;
      if (!tableId || !viewId) return;
      const recordIds: string[] = await sdk.ui.selectRecordIdList(tableId, viewId);
      setState((prev) => ({ ...prev, selectedRecords: recordIds }));
      setRecordCount(recordIds.length);
    } catch {}
  };

  const switchPlan = (plan: "quick" | "custom") => {
    setState((prev) => ({ ...prev, currentPlan: plan }));
  };

  const toggleTag = (tag: string, groupName: "valueProp" | "industry", isOther = false) => {
    if (groupName === "valueProp") {
      if (isOther) {
        setShowOtherInputs((prev) => ({ ...prev, valueProp: !prev.valueProp }));
      }
      setProductInfo((prev) => {
        const newProps = prev.valueProps.includes(tag)
          ? prev.valueProps.filter((t) => t !== tag)
          : prev.valueProps.length < 3
          ? [...prev.valueProps, tag]
          : prev.valueProps;
        setValuePropsCount(newProps.length);
        return { ...prev, valueProps: newProps };
      });
    } else if (groupName === "industry") {
      if (isOther) {
        setShowOtherInputs((prev) => ({ ...prev, industry: !prev.industry }));
      }
      setProductInfo((prev) => ({
        ...prev,
        industries: prev.industries.includes(tag)
          ? prev.industries.filter((t) => t !== tag)
          : [...prev.industries, tag],
      }));
    }
  };

  const updateCharCount = (value: string) => {
    setCharCount(value.length);
    setProductInfo((prev) => ({ ...prev, remark: value }));
  };

  const submitForm = async () => {
    if (!state.selectedTable) {
      setErrors((e) => ({ ...e, table: "请先选择你的客户表" }));
      return;
    }
    if (!state.selectedView) {
      setErrors((e) => ({ ...e, view: "请先选择你的视图" }));
      return;
    }
    if (state.selectedFields.length === 0) {
      setErrors((e) => ({ ...e, field: "请至少选择 1 个关键信息" }));
      return;
    }
    if (state.selectedRecords.length === 0) {
      setErrors((e) => ({ ...e, record: "请至少选择 1 个客户" }));
      return;
    }

    // 如果正在提交，防止重复提交
    if (isSubmitting) {
      return;
    }

    setErrors({ table: "", view: "", field: "", record: "" });
    setIsSubmitting(true);

    try {
      const formData: any = {
        tableId: state.selectedTable,
        viewId: state.selectedView,
        fields: state.selectedFields,
        records: state.selectedRecords,
        plan: state.currentPlan,
      };
      if (state.currentPlan === "custom") {
        formData.productInfo = productInfo;
      }

      const sdk: any = bitable ?? (window as any).bitable;

      const userId = await sdk.bridge.getUserId();

      await saveUserAnalysisPlan({
        userId,
        id: planId,
        tableId: state.selectedTable,
        viewId: state.selectedView,
        fieldList: JSON.stringify(state.selectedFields),
        keySellingPoints: JSON.stringify(productInfo.valueProps),
        productLine: productInfo.productType,
        customerSize: productInfo.companySize,
        budgetRange: productInfo.budget,
        industry: JSON.stringify(productInfo.industries),
        otherRequirement: productInfo.remark,
      });

      // 跳转页面的时候使用缓存存储选这的客户recordIds
      localStorage.setItem("selectedRecords", JSON.stringify(state.selectedRecords));
      navigate("/processing", {
        state: { tableId: state.selectedTable, viewId: state.selectedView },
      });
    } catch (error) {
      console.error("提交失败:", error);
      // 可以在这里添加错误提示
    } finally {
      setIsSubmitting(false);
    }
  };

  const goBack = () => {
    navigate("/");
  };

  const isSubmitDisabled =
    !state.selectedTable ||
    state.selectedFields.length === 0 ||
    state.selectedRecords.length === 0 ||
    isSubmitting;

  return (
    <div className="select-plan">
      <header className="top">
        <button
          className="back-btn"
          onClick={goBack}
          style={{ marginRight: "8px" }}
          aria-label="返回"
        >
          ←
        </button>
        <div className="header-title">分析我的客户</div>
        <div className="spacer">
          <MenuButtonWithDropdown />
        </div>
      </header>

      <main className="wrap">
        <div className="step-section">
          <div className="step-header">
            <div className="step-number">1️⃣</div>
            <div className="step-title">选择你的客户表</div>
          </div>
          <div className="step-desc">你的客户数据存在哪个表里？</div>
          <div className="custom-select-wrapper">
            <button
              className={`custom-select-btn ${showDropdown ? "open" : ""}`}
              onClick={toggleDropdown}
            >
              <span>{selectedOption}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${showDropdown ? "show" : ""}`}>
              {loadingTables && <div className="dropdown-item">加载中...</div>}
              {!loadingTables && tables.length === 0 && (
                <div className="dropdown-item">暂无可用数据表</div>
              )}
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`dropdown-item ${state.selectedTable === table.id ? "selected" : ""}`}
                  onClick={() => selectOption(table.id, table.name)}
                >
                  {table.name}
                </div>
              ))}
            </div>
          </div>
          <div className="custom-select-wrapper" style={{ marginTop: "16px" }}>
            <button
              className={`custom-select-btn ${showViewDropdown ? "open" : ""}`}
              onClick={toggleViewDropdown}
            >
              <span>{selectedViewOption}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            <div className={`dropdown-menu ${showViewDropdown ? "show" : ""}`}>
              {loadingTables && <div className="dropdown-item">加载中...</div>}
              {!loadingTables && tables.length === 0 && (
                <div className="dropdown-item">暂无可用视图</div>
              )}
              {views.map((view) => (
                <div
                  key={view.id}
                  className={`dropdown-item ${state.selectedView === view.id ? "selected" : ""}`}
                  onClick={() => selectViewOption(view.id, view.name)}
                >
                  {view.name}
                </div>
              ))}
            </div>
          </div>
          {errors.table && <div className={`error-message show`}>{errors.table}</div>}
        </div>

        <div className={`step-section fields-section ${showFieldsSection ? "show" : ""}`}>
          <div className="step-header">
            <div className="step-number">2️⃣</div>
            <div className="step-title">告诉我你关心什么</div>
          </div>
          <div className="step-desc">选择哪些信息最能帮我找出好客户</div>
          <div className="field-count">
            已勾选：<span>{fieldCount}</span> 个信息
          </div>
          <div className="checkbox-group">
            {loadingFields && <div className="checkbox-item">字段加载中...</div>}
            {state.selectedTable &&
              !loadingFields &&
              (fieldsByTable[state.selectedTable] || []).map((field) => (
                <label key={field.id} className="checkbox-item">
                  <input
                    type="checkbox"
                    value={field.id}
                    checked={state.selectedFields.includes(field.id) || field.name === "企业名称"}
                    disabled={field.name === "企业名称"}
                    onChange={() => toggleField(field.id)}
                  />
                  <span className="checkbox-label">{field.name}</span>
                </label>
              ))}
          </div>
          {errors.field && <div className={`error-message show`}>{errors.field}</div>}
        </div>

        <div className={`step-section records-section ${showRecordsSection ? "show" : ""}`}>
          <div className="step-header">
            <div className="step-number">3️⃣</div>
            <div className="step-title">选择要分析的客户</div>
          </div>
          <div className="step-desc">从你的表中选出这次要分析的客户</div>
          <button className="record-button" onClick={selectRecords}>
            👥 选择客户名单
          </button>
          <div className="record-count">
            <div className="record-count-label">当前选中：</div>
            <div className="record-count-number">
              <span>{recordCount}</span> 个客户
            </div>
          </div>
          {errors.record && <div className={`error-message show`}>{errors.record}</div>}
        </div>

        <div>
          <div className="plan-tabs">
            <button
              className={`plan-tab ${state.currentPlan === "quick" ? "active" : ""}`}
              onClick={() => switchPlan("quick")}
            >
              ⚡ 快速方案
            </button>
            <button
              className={`plan-tab ${state.currentPlan === "custom" ? "active" : ""}`}
              disabled
              // onClick={() => switchPlan("custom")}
            >
              💎 深度方案（敬请期待~）
            </button>
          </div>

          {state.currentPlan === "quick" && (
            <div className="plan-content active">
              <div className="recommend-badge">⭐ 为你推荐</div>
              <div className="plan-title">快速分析方案</div>
              <div className="plan-desc">
                立即告诉你这些客户的匹配度排名，3分钟得出结果，立刻知道谁最值得跟
              </div>
              <div className="plan-features">
                <div className="feature-item">成交概率排名</div>
                <div className="feature-item">行业竞争策略</div>
                <div className="feature-item">标准打单话术</div>
              </div>
              <div className="plan-info">
                <div className="info-item">
                  <div className="info-item-label">处理客户数</div>
                  <div className="info-value">{recordCount}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">消耗积分</div>
                  <div className="info-value">
                    {recordCount ? recordCount * 25 : 0}
                  </div>
                </div>
              </div>
            </div>
          )}

          {state.currentPlan === "custom" && (
            <>
              <div className="plan-content active">
                <div className="plan-title">深度分析方案</div>
                <div className="plan-desc">
                  补充一些关于你产品的信息，我会针对每个客户生成专属的分析和策略
                </div>
                <div className="plan-features">
                  <div className="feature-item">定制匹配度</div>
                  <div className="feature-item">针对每个客户的打单策略</div>
                  <div className="feature-item">个性化的开场白和话术</div>
                  <div className="feature-item">跟进顺序和最佳时机</div>
                </div>
                <div className="plan-info">
                  <div className="info-item">
                    <div className="info-item-label">处理客户数</div>
                    <div className="info-value">{recordCount}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-item-label">消耗积分</div>
                    <div className="info-value">100</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="form-section">
                  <div className="form-title">产品类型是什么？</div>
                  <div className="radio-group">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="product-type"
                        value="SaaS"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            productType: "SaaS",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            productType: false,
                          }));
                        }}
                      />
                      <span className="radio-label">SaaS 软件</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="product-type"
                        value="硬件"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            productType: "硬件",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            productType: false,
                          }));
                        }}
                      />
                      <span className="radio-label">硬件设备</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="product-type"
                        value="服务"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            productType: "服务",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            productType: false,
                          }));
                        }}
                      />
                      <span className="radio-label">咨询服务</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="product-type"
                        value="other"
                        onChange={() =>
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            productType: true,
                          }))
                        }
                      />
                      <span className="radio-label">其他</span>
                    </label>
                  </div>
                  {showOtherInputs.productType && (
                    <div className="other-input-wrapper show">
                      <input
                        type="text"
                        className="other-input"
                        placeholder="请输入"
                        maxLength={50}
                        onChange={(e) =>
                          setProductInfo((prev) => ({
                            ...prev,
                            productType: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <div className="form-title">你的核心卖点是什么？</div>
                  <div className="form-desc">最多选择 3 个</div>
                  <div className="tag-counter">
                    已选 <span>{valuePropsCount}</span>/3
                  </div>
                  <div className="tag-group">
                    {valuePropOptions.map((prop) => (
                      <div
                        key={prop}
                        className={`tag-item ${
                          productInfo.valueProps.includes(prop) ? "active" : ""
                        }`}
                        onClick={() => {
                          if (productInfo.valueProps.includes(prop) || valuePropsCount < 3) {
                            toggleTag(prop, "valueProp");
                          } else {
                            window.alert("最多只能选择 3 个选项");
                          }
                        }}
                      >
                        {prop}
                      </div>
                    ))}
                    <div
                      className={`tag-item ${showOtherInputs.valueProp ? "active" : ""}`}
                      onClick={() => {
                        if (showOtherInputs.valueProp || valuePropsCount < 3) {
                          toggleTag("其他", "valueProp", true);
                        } else {
                          window.alert("最多只能选择 3 个选项");
                        }
                      }}
                    >
                      其他
                    </div>
                  </div>
                  {showOtherInputs.valueProp && (
                    <div className="other-input-wrapper show">
                      <input
                        type="text"
                        className="other-input"
                        placeholder="请输入（多个用逗号分隔）"
                        maxLength={100}
                        onChange={(e) => {
                          const otherValue = e.target.value;
                          const allValueProps = valuePropOptions.filter((p) =>
                            productInfo.valueProps.includes(p),
                          );
                          if (otherValue) {
                            const updatedValueProps = [...allValueProps, otherValue];
                            setProductInfo((prev) => ({
                              ...prev,
                              valueProps: updatedValueProps.slice(0, 3),
                            }));
                          } else {
                            setProductInfo((prev) => ({
                              ...prev,
                              valueProps: allValueProps,
                            }));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <div className="form-title">目标客户的企业规模？</div>
                  <div className="radio-group">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="company-size"
                        value="1-100人"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            companySize: "1-100人",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            companySize: false,
                          }));
                        }}
                      />
                      <span className="radio-label">1-100 人</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="company-size"
                        value="100-500人"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            companySize: "100-500人",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            companySize: false,
                          }));
                        }}
                      />
                      <span className="radio-label">100-500 人</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="company-size"
                        value="500-1000人"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            companySize: "500-1000人",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            companySize: false,
                          }));
                        }}
                      />
                      <span className="radio-label">500-1000 人</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="company-size"
                        value="1000+人"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            companySize: "1000+人",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            companySize: false,
                          }));
                        }}
                      />
                      <span className="radio-label">1000+ 人</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="company-size"
                        value="other"
                        onChange={() => {
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            companySize: true,
                          }));
                          setProductInfo((prev) => ({
                            ...prev,
                            companySize: "",
                          }));
                        }}
                      />
                      <span className="radio-label">其他</span>
                    </label>
                  </div>
                  {showOtherInputs.companySize && (
                    <div className="other-input-wrapper show">
                      <input
                        type="text"
                        className="other-input"
                        placeholder="请输入"
                        maxLength={50}
                        value={productInfo.companySize}
                        onChange={(e) =>
                          setProductInfo((prev) => ({
                            ...prev,
                            companySize: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <div className="form-title">他们的预算范围？</div>
                  <div className="radio-group">
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="budget"
                        value="10-50万"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            budget: "10-50万",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            budget: false,
                          }));
                        }}
                      />
                      <span className="radio-label">10-50 万</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="budget"
                        value="50-100万"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            budget: "50-100万",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            budget: false,
                          }));
                        }}
                      />
                      <span className="radio-label">50-100 万</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="budget"
                        value="100+万"
                        onChange={() => {
                          setProductInfo((prev) => ({
                            ...prev,
                            budget: "100+万",
                          }));
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            budget: false,
                          }));
                        }}
                      />
                      <span className="radio-label">100+ 万</span>
                    </label>
                    <label className="radio-item">
                      <input
                        type="radio"
                        name="budget"
                        value="other"
                        onChange={() => {
                          setShowOtherInputs((prev) => ({
                            ...prev,
                            budget: true,
                          }));
                          setProductInfo((prev) => ({
                            ...prev,
                            budget: "",
                          }));
                        }}
                      />
                      <span className="radio-label">其他</span>
                    </label>
                  </div>
                  {showOtherInputs.budget && (
                    <div className="other-input-wrapper show">
                      <input
                        type="text"
                        className="other-input"
                        placeholder="请输入"
                        maxLength={50}
                        value={productInfo.budget}
                        onChange={(e) =>
                          setProductInfo((prev) => ({
                            ...prev,
                            budget: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <div className="form-title">他们属于哪些行业？</div>
                  <div className="tag-group">
                    {industryOptions.map((industry) => (
                      <div
                        key={industry}
                        className={`tag-item ${
                          productInfo.industries.includes(industry) ? "active" : ""
                        }`}
                        onClick={() => toggleTag(industry, "industry")}
                      >
                        {industry}
                      </div>
                    ))}
                    <div
                      className={`tag-item ${showOtherInputs.industry ? "active" : ""}`}
                      onClick={() => toggleTag("其他", "industry", true)}
                    >
                      其他
                    </div>
                  </div>
                  {showOtherInputs.industry && (
                    <div className="other-input-wrapper show">
                      <input
                        type="text"
                        className="other-input"
                        placeholder="请输入（多个用逗号分隔）"
                        maxLength={100}
                        onChange={(e) => {
                          const otherValue = e.target.value;
                          if (otherValue) {
                            const industries = otherValue
                              .split(",")
                              .map((i) => i.trim())
                              .filter((i) => i);
                            const existingIndustries = industryOptions.filter((ind) =>
                              productInfo.industries.includes(ind),
                            );
                            setProductInfo((prev) => ({
                              ...prev,
                              industries: [...existingIndustries, ...industries],
                            }));
                          }
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="form-section">
                  <div className="form-title">还有其他想告诉我的吗？</div>
                  <div className="form-desc">比如竞品、特殊需求等</div>
                  <textarea
                    className="textarea"
                    placeholder="选填..."
                    maxLength={200}
                    value={productInfo.remark}
                    onChange={(e) => updateCharCount(e.target.value)}
                  />
                  <div className="char-count">{charCount}/200</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <div className={`bottom-actions ${state.selectedTable ? "show" : ""}`}>
        <div className="bottom-two-btn">
          <button className="action-btn secondary" onClick={goBack}>
            返回
          </button>
          <button className="action-btn primary" onClick={submitForm} disabled={isSubmitDisabled}>
            {isSubmitting ? "提交中..." : "开始分析 →"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectPlanPage;
