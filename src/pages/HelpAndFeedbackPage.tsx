import React, { useContext, useState } from "react";
import styles from "./HelpAndFeedbackPage.module.css";
import UserContext from "@/context/UserContext";
import { Toast } from "@douyinfe/semi-ui";

const HelpAndFeedbackPage = () => {
  const content = useContext(UserContext);
  const [copyButtonText, setCopyButtonText] = useState("📋 复制ID");

  // FAQ数据
  const faqs = [
    {
      question: "如何购买积分？",
      answer: '点击"充值购买"选择适合的套餐，支持微信/支付宝支付，1分钟到账。',
    },
    {
      question: "积分会过期吗？",
      answer: "不会。购买的积分永久有效，您可以随时使用。",
    },
    {
      question: "分析失败会扣积分吗？",
      answer: "不会。只有成功返回数据时才会扣除积分，分析失败不收费。",
    },
    {
      question: "如何查看历史企业分析记录？",
      answer: '点击右上角头像，选择"历史分析"即可查看所有分析记录。',
    },
  ];

  // 返回
  const goBack = () => {
    window.history.back();
  };

  // 复制USER ID
  // 兼容性复制：优先使用 Clipboard API，失败时回退到 textarea + execCommand
  const copyText = async (text: string): Promise<boolean> => {
    if (!text) return false;
    // 首选现代 Clipboard API（需要 https / 合适的权限）
    try {
      if (
        typeof navigator !== "undefined" &&
        navigator.clipboard &&
        navigator.clipboard.writeText
      ) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (err) {
      // 可能因为权限策略或在 iframe 中被阻止，继续走回退方案
      console.warn(
        "navigator.clipboard.writeText failed, falling back to execCommand",
        err
      );
    }

    // 回退到 textarea + execCommand
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      // 避免页面跳动
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "1px";
      textarea.style.height = "1px";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.outline = "none";
      textarea.style.boxShadow = "none";
      textarea.style.background = "transparent";
      document.body.appendChild(textarea);
      textarea.select();

      const successful = document.execCommand && document.execCommand("copy");
      document.body.removeChild(textarea);
      return !!successful;
    } catch (err) {
      console.error("Fallback copy failed:", err);
      return false;
    }
  };

  const copyUserId = async (userId: string) => {
    const ok = await copyText(userId);
    if (ok) {
      setCopyButtonText("✓ 已复制");
      setTimeout(() => {
        setCopyButtonText("📋 复制ID");
      }, 2000);
      Toast.success("USER ID 已复制");
    } else {
      Toast.error("复制失败，请手动复制");
    }
  };

  // 复制邮箱
  const copyEmail = async () => {
    const ok = await copyText("ai@feichuangtech.com");
    if (ok) {
      Toast.success("邮箱已复制");
    } else {
      Toast.error("复制失败，请手动复制");
    }
  };

  return (
    <>
      {/* Styles moved to HelpAndFeedbackPage.module.css to avoid leaking to other pages */}

      <div className={styles.container}>
        {/* 顶部导航 */}
        <div className={styles.header}>
          <div className={styles.backBtn} onClick={goBack}>
            ←
          </div>
          <div className={styles.headerTitle}>帮助与反馈</div>
        </div>

        {/* 内容区域 */}
        <div className={styles.content}>
          {/* USER ID 卡片 */}
          <div className={`${styles.card} ${styles.userIdCard}`}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIcon}>🆔</span>
              我的 USER ID
            </div>
            <div className={styles.userIdValue}>
              {content?.user?.userCode || ""}
            </div>
            <button
              className={styles.copyBtn}
              onClick={() => {
                copyUserId(content?.user?.userCode || "");
              }}
            >
              <span>{copyButtonText}</span>
            </button>
            <div className={styles.userIdTip}>
              💡 遇到问题时，请将此ID提供给客服
            </div>
          </div>

          {/* 常见问题 */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIcon}>📚</span>
              常见问题
            </div>

            {faqs.map((faq, index) => (
              <div key={index} className={styles.faqItem}>
                <div className={styles.faqQuestion}>{faq.question}</div>
                <div className={styles.faqAnswer}>{faq.answer}</div>
              </div>
            ))}
          </div>

          {/* 联系客服 */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>
              <span className={styles.cardIcon}>💬</span>
              联系客服
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactLabel}>
                <span className={styles.contactLabelIcon}>📧</span>
                邮箱
              </div>
              <div className={styles.contactValue}>ai@feichuangtech.com</div>
              <button className={styles.contactBtn} onClick={copyEmail}>
                复制邮箱
              </button>
            </div>

            <div className={styles.contactItem}>
              <div className={styles.contactLabel}>
                <span className={styles.contactLabelIcon}>💬</span>
                飞书群聊
              </div>
              <div className={styles.contactValue}>
                <a
                  href="https://applink.feishu.cn/client/chat/chatter/add_by_link?link_token=YOUR_TOKEN"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactLink}
                >
                  点击加入飞书群聊
                </a>
              </div>
            </div>

            <div className={styles.workTime}>工作时间：工作日 9:00-18:00</div>
          </div>

          {/* 法律文档链接 */}
          <div className={styles.legalLinks}>
            <div className={styles.legalLinksTitle}>法律条款</div>
            <div className={styles.legalLinksList}>
              <a
                href="/agreement/user"
                className={styles.legalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                用户协议
              </a>
              <span className={styles.legalSeparator}>|</span>
              <a
                href="/agreement/privacy"
                className={styles.legalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                隐私政策
              </a>
              <span className={styles.legalSeparator}>|</span>
              <a
                href="/agreement/payment"
                className={styles.legalLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                付费协议
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpAndFeedbackPage;
