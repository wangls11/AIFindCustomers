import React, { useState } from "react";
import styles from "./HelpAndFeedbackPage.module.css";

const HelpAndFeedbackPage = ({ userId = "U20251112001" }) => {
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
  const copyUserId = () => {
    navigator.clipboard
      .writeText(userId)
      .then(() => {
        setCopyButtonText("✓ 已复制");
        setTimeout(() => {
          setCopyButtonText("📋 复制ID");
        }, 2000);
        showToast("USER ID 已复制");
      })
      .catch((err) => {
        console.error("复制失败:", err);
        showToast("复制失败，请手动复制");
      });
  };

  // 复制邮箱
  const copyEmail = () => {
    navigator.clipboard
      .writeText("ai@feichuangtech.com")
      .then(() => {
        showToast("邮箱已复制");
      })
      .catch((err) => {
        console.error("复制失败:", err);
        showToast("复制失败，请手动复制");
      });
  };

  // 显示提示（实际项目中使用Toast组件）
  const showToast = (message: string) => {
    alert(message);
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
            <div className={styles.userIdValue}>{userId}</div>
            <button className={styles.copyBtn} onClick={copyUserId}>
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
