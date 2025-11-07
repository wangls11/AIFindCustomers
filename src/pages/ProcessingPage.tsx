import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { Toast, Modal } from "@douyinfe/semi-ui";
import {
  DataDTO,
  getUserAnalysisPlan,
  startDataStream,
  terminateData,
  abortData,
  checkResume,
  type UserAnalysisPlanVO,
} from "@/api";
import "./ProcessingPage.css";
import { bitable, FieldType } from "@lark-base-open/js-sdk";

// ==================== 数据 ====================
type Tag = { text: string; type: "positive" | "warning" | "danger" };
type Company = {
  rank: number;
  name: string;
  score: number;
  financing: string;
  employees: string;
  founded: string;
  completeness: string;
  risk: string;
  tags: Tag[];
  archive?: string;
  recordId?: string;
  tableId?: string;
};

const companiesData: Company[] = [
  {
    rank: 1,
    name: "海康威视",
    score: 92,
    financing: "A轮",
    employees: "50-99人",
    founded: "2021年1月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "融资强", type: "positive" },
      { text: "客户多", type: "positive" },
      { text: "产品新", type: "positive" },
      { text: "风险低", type: "positive" },
    ],
  },
  {
    rank: 2,
    name: "腾讯控股",
    score: 88,
    financing: "已上市",
    employees: "10000+人",
    founded: "1998年11月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "全面优秀", type: "positive" },
      { text: "战略清晰", type: "positive" },
      { text: "采购能力强", type: "positive" },
    ],
  },
  {
    rank: 3,
    name: "网易",
    score: 78,
    financing: "已上市",
    employees: "5000-9999人",
    founded: "2000年6月",
    completeness: "部分",
    risk: "低风险",
    tags: [
      { text: "创新强", type: "positive" },
      { text: "市场认可", type: "positive" },
      { text: "数据缺失", type: "warning" },
    ],
  },
  {
    rank: 4,
    name: "字节跳动",
    score: 72,
    financing: "C轮",
    employees: "5000-9999人",
    founded: "2012年3月",
    completeness: "部分",
    risk: "中风险",
    tags: [
      { text: "产品多元", type: "positive" },
      { text: "融资强", type: "positive" },
      { text: "数据缺失", type: "warning" },
    ],
  },
  {
    rank: 5,
    name: "小米集团",
    score: 68,
    financing: "已上市",
    employees: "10000+人",
    founded: "2010年4月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "融资完成", type: "positive" },
      { text: "团队大", type: "positive" },
      { text: "风险低", type: "positive" },
    ],
  },
  {
    rank: 6,
    name: "阿里巴巴",
    score: 65,
    financing: "已上市",
    employees: "10000+人",
    founded: "1999年9月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "全球企业", type: "positive" },
      { text: "融资充足", type: "positive" },
      { text: "产品多", type: "positive" },
    ],
  },
  {
    rank: 7,
    name: "B站",
    score: 62,
    financing: "已上市",
    employees: "1000-4999人",
    founded: "2010年6月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "创新平台", type: "positive" },
      { text: "社区强", type: "positive" },
      { text: "潜力股", type: "positive" },
    ],
  },
  {
    rank: 8,
    name: "快手",
    score: 58,
    financing: "D轮",
    employees: "1000-4999人",
    founded: "2011年3月",
    completeness: "部分",
    risk: "低风险",
    tags: [
      { text: "短视频", type: "positive" },
      { text: "融资强", type: "positive" },
      { text: "数据不全", type: "warning" },
    ],
  },
  {
    rank: 9,
    name: "滴滴出行",
    score: 55,
    financing: "私募",
    employees: "5000-9999人",
    founded: "2012年9月",
    completeness: "完整",
    risk: "中风险",
    tags: [
      { text: "平台型", type: "positive" },
      { text: "融资多", type: "positive" },
      { text: "政策风险", type: "warning" },
    ],
  },
  {
    rank: 10,
    name: "美团",
    score: 52,
    financing: "已上市",
    employees: "5000-9999人",
    founded: "2010年3月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "多业务", type: "positive" },
      { text: "融资充足", type: "positive" },
      { text: "稳健", type: "positive" },
    ],
  },
  {
    rank: 11,
    name: "蚂蚁集团",
    score: 48,
    financing: "私募",
    employees: "1000-4999人",
    founded: "2004年",
    completeness: "部分",
    risk: "高风险",
    tags: [
      { text: "金融科技", type: "positive" },
      { text: "数据缺失", type: "warning" },
      { text: "政策风险", type: "danger" },
    ],
  },
  {
    rank: 12,
    name: "旷视科技",
    score: 45,
    financing: "C轮",
    employees: "500-999人",
    founded: "2011年10月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "AI专家", type: "positive" },
      { text: "融资充足", type: "positive" },
      { text: "技术强", type: "positive" },
    ],
  },
  {
    rank: 13,
    name: "商汤科技",
    score: 42,
    financing: "C轮",
    employees: "500-999人",
    founded: "2014年4月",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "AI领军", type: "positive" },
      { text: "融资强", type: "positive" },
      { text: "技术领先", type: "positive" },
    ],
  },
  {
    rank: 14,
    name: "拼多多",
    score: 38,
    financing: "已上市",
    employees: "1000-4999人",
    founded: "2015年9月",
    completeness: "完整",
    risk: "中风险",
    tags: [
      { text: "增速快", type: "positive" },
      { text: "融资多", type: "positive" },
      { text: "竞争激烈", type: "warning" },
    ],
  },
  {
    rank: 15,
    name: "知乎",
    score: 35,
    financing: "已上市",
    employees: "500-999人",
    founded: "2010年12月",
    completeness: "部分",
    risk: "中风险",
    tags: [
      { text: "知识平台", type: "positive" },
      { text: "社区强", type: "positive" },
      { text: "数据缺失", type: "warning" },
    ],
  },
  {
    rank: 16,
    name: "大疆创新",
    score: 32,
    financing: "私募",
    employees: "1000-4999人",
    founded: "2006年",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "硬件企业", type: "positive" },
      { text: "融资多", type: "positive" },
      { text: "全球布局", type: "positive" },
    ],
  },
  {
    rank: 17,
    name: "顺丰速运",
    score: 28,
    financing: "已上市",
    employees: "10000+人",
    founded: "1993年",
    completeness: "完整",
    risk: "低风险",
    tags: [
      { text: "物流龙头", type: "positive" },
      { text: "融资完成", type: "positive" },
      { text: "稳健运营", type: "positive" },
    ],
  },
];

// ==================== 档案生成函数 ====================
const generateArchive = (name: string, score: number) => `
<div class="score-section">
    <div class="score-section-label">综合评分</div>
    <div class="score-section-value">${score}</div>
    <div class="score-section-stars">${"⭐".repeat(Math.ceil(score / 20))}</div>
</div>
<div class="section-title">企业阶段判定</div>
<div class="info-row">
    <span class="info-label">发展阶段</span>
    <span class="info-value">${
      score > 85 ? "大型成熟企业" : score > 70 ? "成长期企业" : "早期创业"
    }</span>
</div>
<div class="info-row">
    <span class="info-label">评分等级</span>
    <span class="info-value">${
      score > 85 ? "优秀" : score > 70 ? "良好" : "中等"
    }</span>
</div>
<div class="section-title">7维度详细评分</div>
<div class="dimension-item">
    <div class="dimension-name">📊 市场认可度：${Math.max(
      score - 7,
      70
    )}分</div>
    <div class="dimension-desc">核心客户数量、行业认证、媒体关注度</div>
</div>
<div class="dimension-item">
    <div class="dimension-name">🎯 战略方向：${Math.max(score - 17, 65)}分</div>
    <div class="dimension-desc">发展方向、新业务布局、生态扩展</div>
</div>
<div class="dimension-item">
    <div class="dimension-name">💡 创新实力：${Math.max(score - 12, 70)}分</div>
    <div class="dimension-desc">产品迭代速度、技术突破、研发投入</div>
</div>
<div class="dimension-item">
    <div class="dimension-name">💰 融资能力：${Math.max(score - 12, 70)}分</div>
    <div class="dimension-desc">融资轮次、融资金额、投资方质量</div>
</div>
<div class="dimension-item">
    <div class="dimension-name">📰 舆情健康：${Math.max(score - 2, 90)}分</div>
    <div class="dimension-desc">正面新闻比例、风险评级、信用记录</div>
</div>
<div class="section-title">销售建议</div>
<div class="list-item">深入了解企业的核心产品和客户群体特征</div>
<div class="list-item">分析其招聘信息推断技术投资方向和优先级</div>
<div class="list-item">基于融资时间评估当前采购预算可用性</div>
<div class="list-item">优先接触产品负责人或技术决策者</div>
<div class="list-item">预计采购周期：2-3个月</div>
<div class="section-title">采购可能性评估</div>
<div class="list-item">采购概率：${
  score > 80 ? "高(75-80%)" : score > 70 ? "中(50-70%)" : "较低(30-50%)"
}</div>
<div class="list-item">合作稳定性：${
  score > 80 ? "中-高(70%)" : "中(50-60%)"
}</div>
<div class="list-item">采购决策周期：通常需要3-6周完成评估</div>
<div class="section-title">跟进验证清单</div>
<div class="list-item">深入研究该企业的具体业务流程和存在的痛点</div>
<div class="list-item">验证采购预算（基于融资情况和扩张迹象）</div>
<div class="list-item">准备行业解决方案和成功案例</div>
<div class="list-item">定位优先接触的核心部门负责人</div>
<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 16px 0;">
<div style="font-size: 12px; color: #999; text-align: right;">
档案最后更新：2025-11-04 14:00
</div>
`;

// 定义字段数组
const fieldsToAdd = [
  {
    type: FieldType.Text,
    name: "企业名称",
  },
  {
    type: FieldType.Text,
    name: "企业状态",
  },
  {
    type: FieldType.DateTime,
    name: "成立时间",
  },
  {
    type: FieldType.Text,
    name: "当前员工规模",
  },
  {
    type: FieldType.Text,
    name: "注册资本",
  },
  {
    type: FieldType.Text,
    name: "融资轮次",
  },
  {
    type: FieldType.Text,
    name: "是否上市",
  },
  {
    type: FieldType.Text,
    name: "法人",
  },
  {
    type: FieldType.Text,
    name: "企业电话",
  },
  {
    type: FieldType.Text,
    name: "官网链接",
  },
  {
    type: FieldType.Text,
    name: "企业邮箱",
  },
  {
    type: FieldType.DateTime,
    name: "融资时间",
  },
  {
    type: FieldType.Text,
    name: "融资热度评分",
  },
  {
    type: FieldType.Number,
    name: "综合评分",
  },
  {
    type: FieldType.Text,
    name: "客户优先级",
  },
  {
    type: FieldType.Text,
    name: "融资热度",
  },
  {
    type: FieldType.Text,
    name: "增长热度",
  },
  {
    type: FieldType.Text,
    name: "风险评级",
  },
  {
    type: FieldType.Text,
    name: "核心结论",
  },
  {
    type: FieldType.Text,
    name: "销售建议",
  },
];

// ==================== 主组件 ====================
const ProcessingPage: React.FC = () => {
  const navigate = useNavigate();
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalRecords, setTotalRecords] = useState(20); // 总记录数，默认为 20
  const [isLoading, setIsLoading] = useState(true);
  const [terminating, setTerminating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [progressPercents, setProgressPercents] = useState({
    p1: 0,
    p2: 0,
    p3: 0,
    p4: 0,
  });
  const [progressWidth, setProgressWidth] = useState(0);
  const [isProgressCollapsed, setIsProgressCollapsed] = useState(false);
  const [filteredData, setFilteredData] = useState<Company[]>([]);
  const [tableName, setTableName] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSort, setCurrentSort] = useState("score");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [archiveLoadingStates, setArchiveLoadingStates] = useState<
    Record<string, boolean>
  >({});
  const [archiveShown, setArchiveShown] = useState(false);
  const [selectedArchive, setSelectedArchive] = useState<{
    name: string;
    content: string;
  } | null>(null);
  const [sortDropdownShow, setSortDropdownShow] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null); // 任务 ID
  const [currentTableId, setCurrentTableId] = useState<string>(""); // 当前表格 ID

  const pageSize = 10;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const isTerminatedRef = useRef<boolean>(false);
  const tableRef = useRef<any>(null);
  const requestIdRef = useRef<string | null>(null);

  const goBack = () => {
    if (isLoading && !isTerminated) {
      Modal.confirm({
        title: "确认终止当前的分析任务吗？",
        content:
          "现在返回上一页，已处理的数据将全部保留，未处理的数据将不再继续分析。",
        okText: "返回并终止分析",
        cancelText: "继续分析",
        okButtonProps: { theme: "solid", type: "danger" as any },
        cancelButtonProps: { theme: "light" },
        onOk: async () => {
          try {
            setTerminating(true);
            // 若需通知后端终止，可在此调用 terminateData
            const processedCount = loadedCount;
            const hasProcessed = processedCount > 0;

            // 停止后续处理并保留已完成数据
            setIsTerminated(true);
            setIsLoading(false);
            setProgressPercents({ p1: 100, p2: 100, p3: 100, p4: 100 });
            setProgressWidth(100);
            setFilteredData((prev) => prev.slice(0, processedCount));
            setCurrentPage(1);

            Toast.info({
              content: hasProcessed
                ? "处理已终止，已处理的数据已保留，未处理部分已停止"
                : "处理已终止，没有已处理的数据",
              duration: 3,
            });

            // 返回第二页（方案选择页）
            navigate("/select-plan");
          } finally {
            setTerminating(false);
          }
        },
      });
      return;
    }
    navigate(-1);
  };

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    isTerminatedRef.current = isTerminated;
  }, [isTerminated]);

  useEffect(() => {
    requestIdRef.current = requestId;
  }, [requestId]);

  useEffect(() => {
    (async () => {
      const sdk: any = bitable ?? (window as any).bitable;
      const userId = await sdk.bridge.getUserId();

      const recordList = JSON.parse(
        localStorage.getItem("selectedRecords") || "[]"
      );

      const res = (await getUserAnalysisPlan(userId)) as UserAnalysisPlanVO;

      const table = await sdk.base.getTable(res.tableId);
      tableRef.current = table; // 保存 table 对象到 ref
      try {
        const meta = await table.getMeta?.();
        const name = meta?.name ?? (await table.getName?.());
        if (name) setTableName(name);
      } catch {}

      // 遍历 fieldsToAdd，创建字段（并行执行；若已存在则跳过）

      // 获取表的所有字段信息
      const allFieldMetaList = await table.getFieldMetaList();
      const existingFieldNames = new Set(
        allFieldMetaList.map((f: any) => f.name)
      );
      await Promise.all(
        fieldsToAdd
          .filter((field) => !existingFieldNames.has(field.name))
          .map((field) =>
            table
              .addField({ type: field.type, name: field.name })
              .catch((e: unknown) =>
                console.warn("addField 失败，已跳过：", field.name, e)
              )
          )
      );

      // 解析 res.fieldList，获取需要处理的字段ID列表
      const selectedFieldIds: string[] = res.fieldList
        ? JSON.parse(res.fieldList)
        : [];

      // 过滤出只在 fieldList 中的字段
      const fieldMetaList = allFieldMetaList.filter((fieldMeta: any) =>
        selectedFieldIds.includes(fieldMeta.id)
      );

      // 根据 recordList 获取记录的详细信息
      if (recordList && recordList.length > 0) {
        // 批量获取所有记录，然后过滤出选中的记录
        const allRecords = await table.getRecords({});
        const selectedRecordsData = allRecords.records.filter((record: any) =>
          recordList.includes(record.recordId)
        );

        // 处理每条记录的字段信息，格式化为目标数据结构
        const recordsWithFields: Array<{
          recordId: string;
          fields: Array<{
            fieldId: string;
            fieldName: string;
            fieldValue: Record<string, any>;
          }>;
        }> = selectedRecordsData.map((record: any) => {
          const recordData = {
            recordId: record.recordId,
            fields: [] as Array<{
              fieldId: string;
              fieldName: string;
              fieldValue: Record<string, any>;
            }>,
          };

          // 只遍历 fieldList 中包含的字段，获取该记录的字段值
          allFieldMetaList.forEach((fieldMeta: any) => {
            const fieldValue = record.fields[fieldMeta.id];
            // 将字段值转换为对象格式
            let fieldValueObj: Record<string, any> = {};

            if (fieldValue !== undefined && fieldValue !== null) {
              if (Array.isArray(fieldValue)) {
                // 如果是数组（bitable常见格式），将数组内容转换为对象
                // 如果数组只有一个元素且是对象，直接使用该对象
                if (
                  fieldValue.length === 1 &&
                  typeof fieldValue[0] === "object"
                ) {
                  if (fieldValue[0] && fieldValue[0].type === "text") {
                    fieldValueObj = fieldValue[0].text;
                  }
                } else {
                  // 否则将数组拼接成文本
                  const textParts = fieldValue.map((item: any) => {
                    if (typeof item === "object" && item !== null) {
                      // 如果是对象，尝试提取text属性或其他属性
                      return item.text || item.name || JSON.stringify(item);
                    }
                    return String(item);
                  });
                  fieldValueObj = textParts.join("") as any;
                }
              } else if (typeof fieldValue === "object") {
                // 如果已经是对象，直接使用
                if (fieldValue.type === "text") {
                  fieldValueObj = fieldValue.text;
                }
              } else {
                // 如果是基本类型，包装成对象
                fieldValueObj = fieldValue;
              }
            }
            // 过滤空对象和空值
            const isValid =
              fieldValueObj !== null &&
              fieldValueObj !== undefined &&
              (typeof fieldValueObj !== "object" ||
                Object.keys(fieldValueObj).length > 0);
            if (isValid) {
              recordData.fields.push({
                fieldId: fieldMeta.id,
                fieldName: fieldMeta.name,
                fieldValue: fieldValueObj,
              });
            }
          });

          return recordData;
        });

        console.log("记录及其字段信息:", recordsWithFields);
        // 获取 bitable URL（需要 recordId, fieldId, tableId 和 viewId）

        if (
          recordsWithFields.length > 0 &&
          recordsWithFields[0].fields.length > 0
        ) {
          const firstRecord = recordsWithFields[0];
          const firstField = firstRecord.fields[0];
          const bitableUrl = await bitable.bridge.getBitableUrl({
            recordId: firstRecord.recordId,
            fieldId: firstField.fieldId,
            tableId: res.tableId || "",
            viewId: res.viewId || null,
          });
          function extractDynamicId(url = window.location.href) {
            // 去掉查询参数和哈希部分
            const cleanUrl = url.split(/[?#]/)[0];

            // 按路径拆分，取最后一个非空片段
            const parts = cleanUrl.split("/").filter(Boolean);
            const lastPart = parts[parts.length - 1];

            // 检查格式：通常是字母 + 数字构成的 20-30 位字符串（飞书 ID 格式）
            if (/^[A-Za-z0-9]{20,30}$/.test(lastPart)) {
              return lastPart;
            }

            return null;
          }
          // 提取所有字段名称
          const fieldNameList = allFieldMetaList.map((fieldMeta: any) => {
            return {
              fieldName: fieldMeta.name,
              fieldId: fieldMeta.id,
            };
          });

          // 保存 tableId 到 state
          setCurrentTableId(res.tableId || "");

          startProcessing({
            appToken: extractDynamicId(bitableUrl) || "",
            tableId: res.tableId || "",
            viewId: res.viewId || "",
            userAnalysisId: res.id || "",
            fieldList: fieldNameList,
            dataItems: recordsWithFields,
          });
        }

        // 返回格式化后的数据，可以根据需要使用
        // return recordsWithFields;
      }
    })();
  }, []);

  const handlePauseToggle = async () => {
    const currentRequestId = requestIdRef.current;
    if (!currentRequestId) {
      Toast.warning({ content: "任务 ID 未获取，无法暂停/继续", duration: 3 });
      return;
    }

    if (!isPaused) {
      // 暂停
      try {
        await abortData(currentRequestId);
        Toast.info({ content: "分析已暂停，您可随时继续", duration: 3 });
        setIsPaused(true);
      } catch (error) {
        console.error("暂停失败:", error);
        Toast.error({ content: "暂停失败，请重试", duration: 3 });
      }
    } else {
      // 继续
      try {
        const canResume = await checkResume(currentRequestId);
        if (canResume?.data) {
          setIsPaused(false);
          Toast.success({ content: "分析已继续", duration: 3 });
        } else {
          Toast.warning({ content: "无法继续，任务可能已终止", duration: 3 });
        }
      } catch (error) {
        console.error("继续失败:", error);
        Toast.error({ content: "继续失败，请重试", duration: 3 });
      }
    }
  };

  // 注释掉初始化档案数据的逻辑，因为现在档案数据是在 SSE 数据转换为 Company 对象时实时生成的
  // useEffect(() => {
  //   companiesData.forEach((company) => {
  //     company.archive = generateArchive(company.name, company.score);
  //   });
  // }, []);

  // 注释掉模拟数据加载逻辑，因为现在数据从 SSE 流中实时获取
  // useEffect(() => {
  //   let index = 0;
  //   let count = 0;
  //   const interval = setInterval(() => {
  //     if (isTerminatedRef.current) {
  //       clearInterval(interval);
  //       return;
  //     }
  //     if (isPausedRef.current) {
  //       return;
  //     }
  //     if (index < companiesData.length) {
  //       count++;
  //       setLoadedCount(count);
  //       const company = companiesData[index];
  //       setArchiveLoadingStates((prev) => ({ ...prev, [company.name]: true }));
  //       setTimeout(() => {
  //         setArchiveLoadingStates((prev) => ({
  //           ...prev,
  //           [company.name]: false,
  //         }));
  //       }, Math.random() * 5000 + 2000);

  //       const percent1 = Math.ceil((Math.min(count, 5) / 5) * 100);
  //       const percent2 = Math.ceil(
  //         (Math.min(Math.max(count - 5, 0), 5) / 5) * 100
  //       );
  //       const percent3 = Math.ceil(
  //         (Math.min(Math.max(count - 10, 0), 5) / 5) * 100
  //       );
  //       const percent4 = Math.ceil(
  //         (Math.min(Math.max(count - 15, 0), companiesData.length - 15) /
  //           (companiesData.length - 15)) *
  //           100
  //       );
  //       setProgressPercents({
  //         p1: Math.min(percent1, 100),
  //         p2: Math.min(percent2, 100),
  //         p3: Math.min(percent3, 100),
  //         p4: Math.min(percent4, 100),
  //       });
  //       setProgressWidth((count / companiesData.length) * 100);
  //       index++;
  //     } else {
  //       clearInterval(interval);
  //       finishLoading();
  //     }
  //   }, 150);
  //   return () => clearInterval(interval);
  // }, []);

  // 点击外部关闭排序下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as any).contains(e.target)
      ) {
        setSortDropdownShow(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // 按 Escape 关闭档案
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeArchive();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // 更新多维表格记录字段
  const updateRecordFields = async (
    table: any,
    recordId: string,
    fields: Array<{
      fieldId: string;
      type: string | null;
      fieldName: string;
      fieldValue: string | null;
    }>
  ) => {
    try {
      // 获取记录 - 使用 getRecords 方法，传入 recordIds 参数
      let recordsResult;
      try {
        // 尝试使用 recordIds 参数
        recordsResult = await table.getRecords({ recordIds: [recordId] });
      } catch (e) {
        // 如果 recordIds 参数不支持，则获取所有记录后过滤
        const allRecords = await table.getRecords({});
        recordsResult = {
          records: allRecords.records.filter(
            (r: any) => r.recordId === recordId
          ),
        };
      }

      const records = recordsResult.records || [];
      if (records.length === 0) {
        console.warn(`未找到记录: ${recordId}`);
        return;
      }

      const record = records[0];

      // 获取所有字段元数据，用于确定字段类型
      const fieldMetaList = await table.getFieldMetaList();
      const fieldMetaMap = new Map<string, any>();
      fieldMetaList.forEach((meta: any) => {
        fieldMetaMap.set(meta.id, meta);
      });

      // 构建要更新的字段值对象
      const fieldsToUpdate: Record<string, any> = {};

      // 遍历字段并准备更新数据
      for (const field of fields) {
        // 跳过空值
        if (field.fieldValue === null || field.fieldValue === undefined) {
          continue;
        }

        const fieldId = field.fieldId;
        const fieldValue = field.fieldValue;
        const fieldMeta = fieldMetaMap.get(fieldId);

        if (!fieldMeta) {
          console.warn(`未找到字段元数据: ${fieldId} (${field.fieldName})`);
          continue;
        }

        try {
          // 根据字段类型设置值
          const fieldType = fieldMeta.type;
          let valueToSet: any = fieldValue;

          // 处理不同字段类型（支持数字枚举值和 FieldType 枚举）
          if (fieldType === FieldType.Number || fieldType === 2) {
            // 数字字段：尝试转换为数字
            const numValue = parseFloat(String(fieldValue));
            if (!isNaN(numValue)) {
              valueToSet = numValue;
            } else {
              console.warn(
                `无法将值转换为数字: ${fieldValue} (字段: ${field.fieldName})`
              );
              continue;
            }
          } else if (fieldType === FieldType.DateTime || fieldType === 5) {
            // 日期时间字段：转换为时间戳（毫秒）
            const dateValue = new Date(String(fieldValue));
            if (!isNaN(dateValue.getTime())) {
              valueToSet = dateValue.getTime();
            } else {
              console.warn(
                `无法将值转换为日期: ${fieldValue} (字段: ${field.fieldName})`
              );
              continue;
            }
          } else if (fieldType === FieldType.Text || fieldType === 1) {
            // 文本字段：直接使用字符串
            valueToSet = String(fieldValue);
          } else {
            // 其他类型：尝试直接使用字符串
            valueToSet = String(fieldValue);
          }

          fieldsToUpdate[fieldId] = valueToSet;
        } catch (error) {
          console.error(`处理字段失败: ${field.fieldName} (${fieldId})`, error);
        }
      }

      // 批量更新字段值
      if (Object.keys(fieldsToUpdate).length > 0) {
        try {
          // 尝试使用 setRecords 方法更新记录
          if (typeof table.setRecords === "function") {
            await table.setRecords([
              {
                recordId: recordId,
                fields: fieldsToUpdate,
              },
            ]);
          } else if (record && typeof record.setCellValue === "function") {
            // 如果 setRecords 不存在，尝试使用 record.setCellValue 逐个更新
            for (const [fieldId, value] of Object.entries(fieldsToUpdate)) {
              await record.setCellValue(fieldId, value);
            }
          } else {
            // 如果都不存在，尝试使用 addRecords 的更新模式或其他方法
            console.warn("未找到可用的更新记录方法");
            // 尝试直接调用可能存在的更新方法
            if (typeof table.updateRecords === "function") {
              await table.updateRecords([
                {
                  recordId: recordId,
                  fields: fieldsToUpdate,
                },
              ]);
            } else {
              throw new Error("未找到可用的更新记录方法");
            }
          }
        } catch (updateError) {
          console.error("更新记录时出错:", updateError);
          throw updateError;
        }
      }
    } catch (error) {
      console.error(`更新记录失败: ${recordId}`, error);
      throw error;
    }
  };

  // 将字段数组转换为 Company 对象
  const convertFieldsToCompany = (
    fields: Array<{
      fieldId: string;
      type: string;
      fieldName: string;
      fieldValue: string;
    }>,
    rank: number,
    recordId?: string,
    tableId?: string
  ): Company => {
    // 创建一个字段映射对象，方便查找
    const fieldMap = new Map<string, string>();
    fields.forEach((field) => {
      fieldMap.set(field.fieldName, field.fieldValue);
    });

    // 获取字段值的辅助函数
    const getField = (name: string, defaultValue: string = "") => {
      return fieldMap.get(name) || defaultValue;
    };

    // 企业名称
    const name = getField("企业名称", "未知企业");

    // 综合评分：将"高"、"中"、"低"转换为分数
    const scoreText = getField("综合评分", "中");
    let score = 50; // 默认中等分数
    if (scoreText?.includes("高")) {
      score = 85;
    } else if (scoreText?.includes("中")) {
      score = 65;
    } else if (scoreText?.includes("低")) {
      score = 45;
    }

    // 融资轮次
    const financing = getField("融资轮次", "未知");

    // 当前员工规模
    const employees = getField("当前员工规模", "未知");

    // 成立时间：格式化日期
    const foundedDate = getField("成立时间", "");
    let founded = foundedDate;
    if (foundedDate) {
      // 处理 "YYYY-MM-DD" 格式
      if (/^\d{4}-\d{2}-\d{2}$/.test(foundedDate)) {
        const [year, month] = foundedDate.split("-");
        founded = `${year}年${parseInt(month)}月`;
      }
      // 处理 "YYYY-MM" 格式（融资时间）
      else if (/^\d{4}-\d{2}$/.test(foundedDate)) {
        const [year, month] = foundedDate.split("-");
        founded = `${year}年${parseInt(month)}月`;
      }
      // 如果已经是格式化的日期，直接使用
      else if (foundedDate.includes("年")) {
        founded = foundedDate;
      }
    }

    // 风险评级：转换为 "低风险"、"中风险"、"高风险"
    const riskText = getField("风险评级", "中");
    let risk = "中风险";
    if (riskText.includes("低")) {
      risk = "低风险";
    } else if (riskText.includes("中")) {
      risk = "中风险";
    } else if (riskText.includes("高")) {
      risk = "高风险";
    }

    // 数据完整度：根据字段完整性判断，或者可以从某个字段获取
    let completeness = "完整";
    const requiredFields = ["企业名称", "成立时间", "融资轮次"];
    const missingFields = requiredFields.filter((field) => !getField(field));
    if (missingFields.length === 0) {
      completeness = "完整";
    } else if (missingFields.length <= 2) {
      completeness = "部分";
    } else {
      completeness = "缺失";
    }

    // 生成标签
    const tags: Tag[] = [];
    const financingHeat = getField("融资热度", "");
    const growthHeat = getField("增长热度", "");
    const riskRating = getField("风险评级", "");

    if (financingHeat.includes("高")) {
      tags.push({ text: "融资强", type: "positive" });
    }
    if (growthHeat.includes("高")) {
      tags.push({ text: "增长快", type: "positive" });
    }
    if (riskRating.includes("低")) {
      tags.push({ text: "风险低", type: "positive" });
    } else if (riskRating.includes("高")) {
      tags.push({ text: "风险高", type: "danger" });
    }
    if (completeness === "部分") {
      tags.push({ text: "数据缺失", type: "warning" });
    }

    // 如果没有标签，添加一些默认标签
    if (tags.length === 0) {
      tags.push({ text: "企业信息", type: "positive" });
    }

    return {
      rank,
      name,
      score,
      financing,
      employees,
      founded,
      completeness,
      risk,
      tags,
      recordId,
      tableId,
    };
  };

  const startProcessing = (data: DataDTO) => {
    let processedCount = 0;
    let currentRank = 1;

    // 设置总记录数
    const total = data.dataItems?.length || 20;
    setTotalRecords(total);

    startDataStream(
      data,
      (eventData: string) => {
        console.log("收到消息:", eventData);
        try {
          // 解析 SSE 消息
          const parsedData = JSON.parse(eventData);

          // 处理 REQUEST_ID 事件，获取任务 ID
          if (
            parsedData &&
            (parsedData.event === "REQUEST_ID" ||
              parsedData.event === "request_id")
          ) {
            const taskId = parsedData.data;
            if (taskId) {
              setRequestId(taskId);
              requestIdRef.current = taskId;
              console.log("获取到任务 ID:", taskId);
            }
            return; // REQUEST_ID 事件不需要继续处理
          }

          // 检查是否有 field 数组
          if (
            parsedData &&
            parsedData.data &&
            Array.isArray(parsedData.data.fields)
          ) {
            // 更新多维表格记录字段
            if (parsedData.data.recordId && tableRef.current) {
              updateRecordFields(
                tableRef.current,
                parsedData.data.recordId,
                parsedData.data.fields
              ).catch((error) => {
                console.error("更新记录字段失败:", error);
              });
            }

            // 转换为 Company 对象
            const company = convertFieldsToCompany(
              parsedData.data.fields,
              currentRank,
              parsedData.data.recordId,
              data.tableId
            );

            // 生成档案内容
            company.archive = generateArchive(company.name, company.score);

            // 更新状态
            setFilteredData((prev) => {
              // 检查是否已存在相同的 recordId
              const existingIndex = prev.findIndex(
                (item) => item.recordId === company.recordId
              );

              if (existingIndex !== -1) {
                // 如果存在，更新原有的 item 内容
                const newData = [...prev];
                newData[existingIndex] = company;
                return newData;
              } else {
                // 如果不存在，添加新的 item
                const newData = [...prev, company];
                return newData;
              }
            });

            // 更新加载计数
            processedCount++;
            setLoadedCount(processedCount);

            // 更新进度
            const totalRecords = data.dataItems?.length || 20;
            const progress = Math.min(
              (processedCount / totalRecords) * 100,
              100
            );

            // 更新四个阶段的进度
            const percent1 = Math.ceil((Math.min(processedCount, 5) / 5) * 100);
            const percent2 = Math.ceil(
              (Math.min(Math.max(processedCount - 5, 0), 5) / 5) * 100
            );
            const percent3 = Math.ceil(
              (Math.min(Math.max(processedCount - 10, 0), 5) / 5) * 100
            );
            const percent4 = Math.ceil(
              (Math.min(Math.max(processedCount - 15, 0), totalRecords - 15) /
                (totalRecords - 15)) *
                100
            );
            setProgressPercents({
              p1: Math.min(percent1, 100),
              p2: Math.min(percent2, 100),
              p3: Math.min(percent3, 100),
              p4: Math.min(percent4, 100),
            });
            setProgressWidth(progress);

            // 设置档案加载状态
            setArchiveLoadingStates((prev) => ({
              ...prev,
              [company.name]: true,
            }));
            setTimeout(() => {
              setArchiveLoadingStates((prev) => ({
                ...prev,
                [company.name]: false,
              }));
            }, Math.random() * 5000 + 2000);

            // 更新排名
            currentRank++;

            // 检查是否全部完成
            if (processedCount >= totalRecords) {
              finishLoading();
            }
          } else {
            console.warn("收到非标准格式的数据:", parsedData);
          }
        } catch (error) {
          console.error("解析 SSE 消息失败:", error, eventData);
        }
      },
      (error: unknown) => {
        // 处理错误
        console.error("SSE 错误:", error);
        Toast.error("数据处理出错");
      }
    );
  };

  const finishLoading = () => {
    setIsLoading(false);
    // 使用函数式更新，确保使用最新的 filteredData
    setFilteredData((prev) => {
      const sorted = [...prev].sort((a, b) => b.score - a.score);
      return sorted;
    });
    setTimeout(() => {
      setIsProgressCollapsed(true);
    }, 1000);
  };

  // 排序逻辑
  const applySort = (data: Company[], sortType: string): Company[] => {
    const sorted = [...data].sort((a, b) => {
      switch (sortType) {
        case "score":
          return b.score - a.score;
        case "completeness":
          const completenessOrder: Record<string, number> = {
            完整: 3,
            部分: 2,
            缺失: 1,
          } as any;
          return (
            (completenessOrder[b.completeness] || 0) -
            (completenessOrder[a.completeness] || 0)
          );
        case "financing":
          const financingOrder: Record<string, number> = {
            已上市: 5,
            D轮: 4,
            C轮: 3,
            B轮: 2,
            A轮: 1,
            天使: 0,
          } as any;
          return (
            (financingOrder[b.financing] || 0) -
            (financingOrder[a.financing] || 0)
          );
        case "employees":
          const employeeOrder: Record<string, number> = {
            "10000+人": 5,
            "5000-9999人": 4,
            "1000-4999人": 3,
            "500-999人": 2,
            "50-99人": 1,
          } as any;
          return (
            (employeeOrder[b.employees] || 0) -
            (employeeOrder[a.employees] || 0)
          );
        case "risk":
          const riskOrder: Record<string, number> = {
            低风险: 3,
            中风险: 2,
            高风险: 1,
          } as any;
          return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
        case "founded":
          return parseInt(b.founded) - parseInt(a.founded);
        default:
          return b.score - a.score;
      }
    });
    return sorted;
  };

  // 搜索处理
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1);
    // 使用函数式更新，基于当前的 filteredData 进行搜索
    setFilteredData((prev) => {
      if (keyword) {
        const filtered = prev.filter((c) =>
          c.name.toLowerCase().includes(keyword.toLowerCase())
        );
        return applySort(filtered, currentSort);
      } else {
        return applySort([...prev], currentSort);
      }
    });
  };

  // 排序处理
  const handleSort = (sortType: string) => {
    setCurrentSort(sortType);
    setCurrentPage(1);
    setFilteredData((prev) => applySort(prev, sortType));
    setSortDropdownShow(false);
  };

  const getBadge = (rank: number) => {
    const badges = ["🥇", "🥈", "🥉"] as const;
    return rank <= 3 ? (badges[rank - 1] as any) : (rank as any);
  };

  const getStars = (score: number) => {
    return "⭐".repeat(Math.ceil(score / 20));
  };

  // 档案操作
  const showArchive = (companyName: string) => {
    const company = filteredData.find((c) => c.name === companyName);
    if (company && company.archive) {
      setSelectedArchive({ name: companyName, content: company.archive });
      setArchiveShown(true);
    }
  };

  const closeArchive = () => {
    setArchiveShown(false);
  };

  const copyArchive = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!selectedArchive) return;
    const div = document.createElement("div");
    div.innerHTML = selectedArchive.content;
    const text = div.innerText;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        const btn = e.currentTarget;
        const originalText = btn.textContent || "复制全部内容";
        btn.textContent = "已复制！";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("复制失败:", err);
      });
  };

  const openInFeishu = async (companyName: string) => {
    const company = filteredData.find((c) => c.name === companyName);
    if (!company || !company.recordId) {
      Toast.warning({ content: "未找到记录信息", duration: 3 });
      return;
    }

    const tableId = company.tableId || currentTableId;
    if (!tableId) {
      Toast.warning({ content: "未找到表格信息", duration: 3 });
      return;
    }

    try {
      const sdk: any = bitable ?? (window as any).bitable;
      if (!sdk?.ui?.showRecordDetailDialog) {
        Toast.warning({ content: "当前环境不支持显示详情弹窗", duration: 3 });
        return;
      }

      await sdk.ui.showRecordDetailDialog({
        tableId: tableId,
        recordId: company.recordId,
      });
    } catch (error) {
      console.error("打开详情弹窗失败:", error);
      Toast.error({ content: "打开详情弹窗失败，请重试", duration: 3 });
    }
  };

  // 终止处理
  const handleTerminate = async () => {
    if (terminating) return;
    // const params = new URLSearchParams(window.location.search);
    // const id = params.get("id");
    // if (!id) {
    //   Toast.error("缺少任务 id，无法终止");
    //   return;
    // }

    Modal.confirm({
      title: "确认终止当前的分析任务吗？",
      content: "已处理的数据将全部保留，未处理的数据将不再继续分析。",
      okText: "确认终止",
      cancelText: "继续处理",
      okButtonProps: { theme: "solid", type: "danger" as any },
      cancelButtonProps: { theme: "light" },
      onOk: async () => {
        try {
          setTerminating(true);
          const currentRequestId = requestIdRef.current;

          // 调用后端终止接口
          if (currentRequestId) {
            try {
              await terminateData(currentRequestId);
            } catch (error) {
              console.error("终止任务失败:", error);
              // 即使 API 调用失败，也继续执行本地终止逻辑
            }
          }

          const processedCount = loadedCount;
          const hasProcessed = processedCount > 0;
          Toast.info({
            content: hasProcessed
              ? "处理已终止，已处理的数据已保留，未处理部分已停止"
              : "处理已终止，没有已处理的数据",
            duration: 3,
          });

          // 重置进度为 100%
          setProgressPercents({ p1: 100, p2: 100, p3: 100, p4: 100 });
          setProgressWidth(100);

          // 仅展示已完成的数据
          setFilteredData((prev) => prev.slice(0, processedCount));
          setCurrentPage(1);

          // 标记终止，停止后续自动推进
          setIsTerminated(true);
          setIsLoading(false);
        } catch (e) {
          // 统一错误提示在拦截器中（如有）
        } finally {
          setTerminating(false);
        }
      },
    });
  };

  // 分页计算
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageData = filteredData.slice(start, end);
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const sortOptions = [
    { label: "按综合评分", value: "score" },
    { label: "按数据完整度", value: "completeness" },
    { label: "按融资轮次", value: "financing" },
    { label: "按员工规模", value: "employees" },
    { label: "按风险等级", value: "risk" },
    { label: "按成立时间", value: "founded" },
  ];

  return (
    <div className={`container ${isPaused ? "paused" : ""}`}>
      <div className="progress-header">
        <div className="progress-title">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="back-btn" onClick={goBack} aria-label="返回">
              ←
            </button>
            <div className="header-title">{tableName || "AI找客"}</div>
          </div>
          <span className="title-stats">
            <span id="completedCount">{loadedCount}</span>/{totalRecords} 完成
          </span>
        </div>
        <div className="progress-info">
          <div className="info-left">
            <span id="statusText">
              {isLoading ? (
                isPaused ? (
                  "已暂停"
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span className="stage-status loading">⟳</span>{" "}
                    AI找客全力分析中！
                  </div>
                )
              ) : (
                "分析完成"
              )}
            </span>
          </div>
          <div className="info-right">
            <span id="timeText">
              {isLoading ? (isPaused ? "暂停中" : "预计 30 秒完成") : "已完成"}
            </span>
          </div>
        </div>
      </div>

      <div className="companies-container" ref={containerRef}>
        {isPaused && <div className="paused-overlay"></div>}
        <div style={{ padding: "16px 24px" }}>
          <div className="progress-controls">
            <button
              className="btn-pause"
              id="pauseBtn"
              onClick={handlePauseToggle}
              title={isPaused ? "点击继续恢复分析" : "点击暂停分析"}
            >
              {isPaused ? (
                <>
                  <span className="icon-play" aria-hidden="true"></span>
                  <span className="sr-only">继续</span>
                </>
              ) : (
                <>
                  <span className="icon-pause" aria-hidden="true"></span>
                  <span className="sr-only">暂停</span>
                </>
              )}
            </button>
            <button
              className="btn-stop"
              id="stopBtn"
              onClick={handleTerminate}
              disabled={terminating || !isLoading}
            >
              <span
                className={`icon-stop${terminating ? " spinning" : ""}`}
                aria-hidden="true"
              ></span>
              <span className="sr-only">
                {terminating ? "正在终止" : "终止"}
              </span>
            </button>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              id="progressFill"
              style={{ width: `${progressWidth}%` }}
            ></div>
          </div>
          <div className="progress-toggle">
            <button
              className="toggle-btn"
              id="toggleBtn"
              onClick={() => setIsProgressCollapsed(!isProgressCollapsed)}
            >
              <span
                className="toggle-label"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <span className="stage-status">
                  {progressPercents.p4 >= 100 ? (
                    "📊"
                  ) : (
                    <span className="stage-status loading">⟳</span>
                  )}
                </span>{" "}
                AI找客实时分析中 ...
              </span>
              <span
                className={`toggle-arrow ${
                  !isProgressCollapsed ? "expanded" : ""
                }`}
              >
                ▲
              </span>
            </button>
          </div>
          {!isProgressCollapsed && (
            <div className="progress-steps" id="progressSteps">
              <div className="progress-stage">
                <div className="stage-left">
                  <span
                    className={`stage-status ${
                      progressPercents.p1 >= 100 ? "done" : "loading"
                    }`}
                  >
                    {progressPercents.p1 >= 100 ? "✓" : "⟳"}
                  </span>
                  <span className="stage-name">企业信息采集</span>
                </div>
                <span className="stage-desc">融资、规模、行业、电话 ...</span>
                <span className="stage-percent" id="percent1">
                  {progressPercents.p1}%
                </span>
              </div>
              <div className="progress-stage">
                <div className="stage-left">
                  <span
                    className={`stage-status ${
                      progressPercents.p2 >= 100 ? "done" : "loading"
                    }`}
                  >
                    {progressPercents.p2 >= 100 ? "✓" : "⟳"}
                  </span>
                  <span className="stage-name">官网信息分析</span>
                </div>
                <span className="stage-desc">产品、招聘、客户、新闻 ...</span>
                <span className="stage-percent" id="percent2">
                  {progressPercents.p2}%
                </span>
              </div>
              <div className="progress-stage">
                <div className="stage-left">
                  <span
                    className={`stage-status ${
                      progressPercents.p3 >= 100 ? "done" : "loading"
                    }`}
                  >
                    {progressPercents.p3 >= 100 ? "✓" : "⟳"}
                  </span>
                  <span className="stage-name">风险舆情分析</span>
                </div>
                <span className="stage-desc">风险评级、媒体热度 ...</span>
                <span className="stage-percent" id="percent3">
                  {progressPercents.p3}%
                </span>
              </div>
              <div className="progress-stage">
                <div className="stage-left">
                  <span
                    className={`stage-status ${
                      progressPercents.p4 >= 100 ? "done" : "loading"
                    }`}
                  >
                    {progressPercents.p4 >= 100 ? "✓" : "⟳"}
                  </span>
                  <span className="stage-name">客户档案生成</span>
                </div>
                <span className="stage-desc">评分、建议、评估 ...</span>
                <span className="stage-percent" id="percent4">
                  {progressPercents.p4}%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="filter-section">
          <input
            type="text"
            id="searchInput"
            className="search-input"
            placeholder="搜索企业名称..."
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {/* <div className="sort-select" ref={dropdownRef}>
          <button
          className="sort-button"
          id="sortButton"
          onClick={() => setSortDropdownShow(!sortDropdownShow)}
          >
          {sortOptions.find((opt) => opt.value === currentSort)?.label}{" "}
          <span>▼</span>
          </button>
          {sortDropdownShow && (
            <div className="sort-dropdown show" id="sortDropdown">
            {sortOptions.map((opt) => (
              <div
              key={opt.value}
              className={`sort-option ${
                currentSort === opt.value ? "selected" : ""
                }`}
                data-sort={opt.value}
                onClick={() => handleSort(opt.value)}
                >
                <span>{opt.label}</span>
                </div>
                ))}
                </div>
                )}
                </div> */}
        </div>
        <div id="companiesList" className="companies-list">
          {pageData.map((company) => {
            const badge = getBadge(company.rank);
            const stars = getStars(company.score);
            const isArchiveLoading = archiveLoadingStates[company.name];
            return (
              <div
                key={company.name}
                className="company-card"
                onClick={() => showArchive(company.name)}
              >
                <div style={{ flexGrow: 1 }}>
                  <div className="card-top">
                    <div className="company-name">{company.name}</div>
                    <div className="score-badge">
                      <span className="score-value">{company.score}分</span>
                      {/* <span className="score-stars">{stars}</span> */}
                    </div>
                  </div>
                  <div className="card-tags">
                    {company.tags.map((tag, i) => (
                      <span key={i} className={`tag ${tag.type}`}>
                        ✓{tag.text}
                      </span>
                    ))}
                  </div>
                  <div className="card-meta">
                    <span>{company.financing}</span>
                    <span>{company.employees}</span>
                    <span>{company.founded}成立</span>
                  </div>
                </div>
                <div
                  className="card-buttons"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="btn-feishu"
                    onClick={() => openInFeishu(company.name)}
                  >
                    在飞书打开
                  </button>
                  <button
                    className={`btn-archive ${
                      isArchiveLoading ? "loading" : ""
                    }`}
                    disabled={isArchiveLoading}
                    onClick={() => showArchive(company.name)}
                  >
                    {isArchiveLoading ? (
                      <>
                        <span className="loading-spinner">⏳</span>
                        <span className="btn-text">加载中...</span>
                      </>
                    ) : (
                      <>
                        <span>📋 查看客户档案</span>
                        <span className="btn-check">✓</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div id="pagination" className="pagination">
        <span className="pagination-info">
          第 {start + 1}-{Math.min(end, filteredData.length)} 条 | 共{" "}
          {filteredData.length} 条
        </span>
        <button
          className="page-btn"
          disabled={currentPage === 1}
          onClick={() => {
            setCurrentPage(currentPage - 1);
            containerRef.current?.scrollTo(0, 0);
          }}
        >
          {"< 上一页"}
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(
          (i) => (
            <button
              key={i}
              className={`page-btn ${currentPage === i ? "active" : ""}`}
              onClick={() => {
                setCurrentPage(i);
                containerRef.current?.scrollTo(0, 0);
              }}
            >
              {i}
            </button>
          )
        )}
        <button
          className="page-btn"
          disabled={currentPage === totalPages}
          onClick={() => {
            setCurrentPage(currentPage + 1);
            containerRef.current?.scrollTo(0, 0);
          }}
        >
          {"下一页 >"}
        </button>
      </div>

      {archiveShown && selectedArchive && (
        <div className="archive-modal show" onClick={closeArchive}>
          <div
            className="archive-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="archive-header">
              <h2 id="archiveTitle">{selectedArchive.name} - 企业档案</h2>
              <button className="archive-close" onClick={closeArchive}>
                ✕
              </button>
            </div>
            <div
              className="archive-content"
              id="archiveContent"
              dangerouslySetInnerHTML={{ __html: selectedArchive.content }}
            />
            <div className="archive-footer">
              <button className="btn-copy" onClick={copyArchive}>
                复制全部内容
              </button>
              <button className="btn-close" onClick={closeArchive}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessingPage;
