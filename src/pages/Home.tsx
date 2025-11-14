import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import "./Home.scss";
import { bitable } from "@lark-base-open/js-sdk";
import MenuButtonWithDropdown from "../components/MenuButtonWithDropdown";

const AiZhaoKe: React.FC = () => {
  const [count, setCount] = useState(0);
  const [companyList, setCompanyList] = useState<{ id: string; name: string }[]>([]);

  // 从飞书多维表拉取公司名称
  useEffect(() => {
    async function fetchCompanyNames() {
      try {
        const table = await bitable.base.getActiveTable();
        const fields = await table.getFieldMetaList();
        const companyField = fields.find((field: any) => field.name === "企业名称");
        if (!companyField) {
          setCompanyList([]);
          return;
        }
        const companyNameFieldId = companyField.id;
        const res = await table.getRecords({});
        let orderedRecords = res.records;
        if (typeof table.getActiveView === "function") {
          const view = await table.getActiveView();
          if (view && typeof view.getVisibleRecordIdList === "function") {
            const recordIds = await view.getVisibleRecordIdList();
            const id2record = Object.fromEntries(
              res.records.map((rec: any) => [rec.recordId, rec]),
            );
            orderedRecords = recordIds.map((rid) => rid && id2record[rid]).filter(Boolean);
          }
        }
        const companyNames = orderedRecords
          .map((rec: any) => {
            const name = rec.fields[companyNameFieldId]?.[0]?.text || "";
            return { id: name, name };
          })
          .filter((item: { name: string }) => item.name);
        setCompanyList(companyNames);
      } catch (e) {
        setCompanyList([]);
      }
    }
    fetchCompanyNames();
  }, []);

  // 数字递增动画
  useEffect(() => {
    const target = 1247;
    const duration = 2000;
    const step = Math.ceil(target / (duration / 16));
    let n = 0;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const timer = setTimeout(() => {
      intervalId = setInterval(() => {
        n += step;
        if (n >= target) {
          setCount(target);
          if (intervalId) clearInterval(intervalId);
        } else {
          setCount(Math.floor(n));
        }
      }, 16);
    }, 400);

    return () => {
      clearTimeout(timer);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const navigate = useNavigate();
  const companyNames = companyList.map((c) => c.name);
  const shownNames = companyNames.slice(0, 6);

  const handlePrimaryCta = () => {
    navigate("/select-plan");
  };

  return (
    <div className="project-home">
      <header className="top">
        <div className="logo">
          <img
            src="logo.svg"
            alt="AI找客Logo"
            style={{
              height: "30px",
              userSelect: "none",
              marginRight: "6px",
              backgroundColor: "#fff",
            }}
          />
          <div className="brand" style={{ fontFamily: "MyFont" }}>
            AI找客
          </div>
        </div>
        <MenuButtonWithDropdown />
      </header>

      <main className="wrap">
        <div className="badge-wrapper">
          <div className="badge">
            <span className="achievement-icon">🚀</span>
            <span>
              已协助 <strong>{count.toLocaleString()}</strong>+ 位销售 找到目标客户
            </span>
          </div>
          <span className="growth-tag">
            <span className="growth-arrow">↗</span>
            <span>持续增长</span>
          </span>
          <span className="sparkle sparkle-1">✨</span>
          <span className="sparkle sparkle-2">✨</span>
          <span className="sparkle sparkle-3">✨</span>
        </div>

        <h1 className="h1">
          100家公司线索 <span className="hl">不知道该先联系谁</span>
        </h1>

        <section className="co">
          <div className="co-h">
            🔍 <div className="co-t">检测到当前多维表中有{companyNames.length}家公司</div>
          </div>
          <div className="co-tags">
            {shownNames.map((name, i) => (
              <div key={i} className="tag">
                {i === 5 && companyNames.length > 6 ? `+${companyNames.length - 5}家` : name}
              </div>
            ))}
          </div>
        </section>

        <section className="benefits">
          <ul>
            <li>
              <span className="b-ico">✓</span>
              连接飞书多维表格，AI自动监听你的客户数据，无需手动导入
            </li>
            <li>
              <span className="b-ico">✓</span>
              多维分析每家公司成交概率，智能推荐优先级客户
            </li>
            <li>
              <span className="b-ico">✓</span>
              生成定制打单策略和话术，优先推进最易成交的客户
            </li>
          </ul>
        </section>

        <button className="btn-primary" onClick={handlePrimaryCta}>
          🤝 帮我找好客户
        </button>
        <div className="hint">
          <b>限时免费体验</b> · 马上看到结果
        </div>

        <section className="feat-list">
          <article className="feat">
            <div className="fi">📊</div>
            <div>
              <div className="fhead">
                <div className="fno">1</div>
                <div className="ft">精准匹配度评分</div>
              </div>
              <div className="fd">自动评估每家客户的匹配度，0-100分一眼看出谁最值得跟</div>
            </div>
          </article>
          <article className="feat">
            <div className="fi">📋</div>
            <div>
              <div className="fhead">
                <div className="fno">2</div>
                <div className="ft">AI智能打单策略</div>
              </div>
              <div className="fd">分析客户需求与产品契合度，推荐最值得跟进的前5名</div>
            </div>
          </article>
          <article className="feat">
            <div className="fi">💬</div>
            <div>
              <div className="fhead">
                <div className="fno">3</div>
                <div className="ft">个性化话术生成</div>
              </div>
              <div className="fd">根据客户画像生成开场白，一键复制，提升3倍接通率</div>
            </div>
          </article>
          <article className="feat">
            <div className="fi">🚀</div>
            <div>
              <div className="fhead">
                <div className="fno">4</div>
                <div className="ft">行动计划指导</div>
              </div>
              <div className="fd">实时同步到飞书多维表格，推荐最优跟进顺序和时机</div>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
};

export default AiZhaoKe;
