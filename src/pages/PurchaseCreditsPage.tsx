import { useNavigate } from "react-router";
import { useState, useCallback, useEffect } from "react";
import { Modal, Button, Toast } from "@douyinfe/semi-ui";
import "./PurchaseCreditsPage.css";
import MenuButtonWithDropdown from "@/components/MenuButtonWithDropdown";
import PaymentMethodCards from "@/components/payment-method-cards";
import { PaymentQRCode } from "@/components/payment-qrcode";
import PaymentAgreement from "@/components/payment-agreement";
import { defaultPaymentMethodList } from "@/components/payment-method-cards";
import { AppPricePayType, fetchAppPricePay } from "@/api/payment";

// 套餐数据类型定义
interface Package {
  id: string;
  title: string;
  subtitle: string;
  credits: number;
  companies: number;
  price: number;
  costPerCompany: number;
  bonus: string | null;
  savings: string | null;
  recommended: boolean;
}

// FAQ数据类型定义
interface FAQ {
  question: string;
  answer: string;
}

// 套餐数据
const packages: Package[] = [
  {
    id: "STANDARD",
    title: "标准包",
    subtitle: "性价比之选",
    credits: 3300,
    companies: 132,
    price: 299,
    costPerCompany: 2.27,
    bonus: "+310 限时赠送",
    savings: "立省 ¥30",
    recommended: true,
  },
  {
    id: "BASIC",
    title: "基础包",
    subtitle: "新手首选，立即开始",
    credits: 1000,
    companies: 40,
    price: 99,
    costPerCompany: 2.48,
    bonus: null,
    savings: null,
    recommended: false,
  },

  {
    id: "SPECIALIZED",
    title: "专业包",
    subtitle: "💎 重度用户专享",
    credits: 8000,
    companies: 320,
    price: 699,
    costPerCompany: 2.18,
    bonus: "+1010 限时赠送",
    savings: "立省 ¥100",
    recommended: false,
  },
];

// FAQ数据
const faqs: FAQ[] = [
  {
    question: "数据来源是哪里？",
    answer:
      "我们整合了工商、招聘、融资、舆情等20+权威数据源，通过AI找客深度分析，生成企业多维度画像。",
  },
  {
    question: "积分会过期吗？",
    answer: "不会。购买的积分永久有效，可以随时使用。",
  },
  {
    question: "分析失败会扣积分吗？",
    answer: "不会。只有成功返回数据时才会扣除积分。",
  },
  {
    question: "如何查看积分余额？",
    answer: "点击右上角账户信息，即可查看当前积分余额和消费记录。",
  },
];

const PurchaseCreditsPage = () => {
  const navigate = useNavigate();

  // 支付相关状态
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("alipay");
  const [price, setPrice] = useState(0);
  const [paymentHtml, setPaymentHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentOrderId, setPaymentOrderId] = useState("");
  const [planId, setPlanId] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // 购买套餐
  const buyPackage = (plan: Package) => {
    setPlanId(plan.id);
    setPrice(plan.price);
    setIsPaymentOpen(true);

    // 移动端不自动创建订单，等用户选择支付方式后再创建
    if (!isMobile) {
      createPaymentOrder(plan.id, paymentMethod);
    }
  };

  // 支付方法变更
  const handlePaymentMethodChange = (value: string) => {
    if (value === paymentMethod) return;

    setPaymentMethod(value);
    // 根据支付方式重新获取支付二维码
    createPaymentOrder(planId, value);
  };

  // 创建支付订单
  const createPaymentOrder = async (planId: string, payType = paymentMethod) => {
    setLoading(true);

    try {
      const resp = await fetchAppPricePay({
        payType: planId,
        orderType: payType.toUpperCase(),
        tradeType: isMobile ? "MWEB" : "NATIVE",
      });

      if (!resp) return;

      const { codeUrl, orderNo } = resp;

      if (isMobile) {
        window.location.href = codeUrl;
        setTimeout(() => {
          setIsPaymentOpen(false);
        }, 5000);
      } else {
        // 设置支付表单 HTML 并打开弹窗
        setPaymentHtml(codeUrl);
        setPaymentOrderId(orderNo);
        setIsPaymentOpen(true);
      }
    } catch (error: any) {
      Toast.error({ content: error.message || "支付请求失败，请稍后重试！" });
    } finally {
      setLoading(false);
    }
  };

  // 支付成功处理
  const handlePaymentSuccess = () => {
    setTimeout(() => {
      setIsSuccessOpen(true);
      setIsPaymentOpen(false);
      setPaymentMethod("alipay");
    }, 0);
  };

  // 关闭支付对话框
  const handlePaymentClose = useCallback(() => {
    setIsPaymentOpen(false);
    setPaymentHtml("");
    setPaymentOrderId("");
    setLoading(false);
    setPaymentMethod("alipay");
  }, []);

  // 检测移动端
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  // 返回上一页
  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="purchase-credits-page">
      {/* 顶部标题 */}
      <header className="pcp-top">
        <button
          className="pcp-back-btn"
          onClick={goBack}
          style={{ marginRight: "8px" }}
          aria-label="返回"
        >
          ←
        </button>
        <div className="pcp-header-title">购买积分</div>
        <div className="pcp-spacer">
          <MenuButtonWithDropdown />
        </div>
      </header>
      <div className="pcp-header-subtitle">按需付费 · 用多少买多少 · 永久有效</div>

      <div style={{ padding: "0 20px" }}>
        {/* 营销内容 */}
        <div className="pcp-card pcp-marketing-card">
          <div className="pcp-marketing-title">从海量企业中，精准找到你的下一个客户</div>
          <div className="pcp-marketing-subtitle">5分钟获得完整企业画像 · AI驱动的智能分析</div>
        </div>

        {/* 方案区域标题 */}
        <div className="pcp-pricing-header">选择适合你的方案，立即开始</div>

        {/* 套餐卡片 - 按顺序：基础包、标准包（推荐）、专业包 */}
        <div className="pcp-packages-section">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`pcp-card pcp-package-card ${pkg.recommended ? "pcp-recommended" : ""}`}
            >
              {pkg.recommended && <div className="pcp-recommend-badge">最受欢迎</div>}

              <div className="pcp-package-content">
                <div>
                  <div className="pcp-package-title">{pkg.title}</div>
                  <div className="pcp-package-subtitle">{pkg.subtitle}</div>
                </div>

                <div className="pcp-package-params">
                  <div className="pcp-param-item">
                    <div className="pcp-param-label">获得积分</div>
                    <div className="pcp-param-value">
                      {pkg.credits.toLocaleString()}
                      <span>分</span>
                    </div>
                  </div>
                  <div className="pcp-param-item">
                    <div className="pcp-param-label">可分析</div>
                    <div className="pcp-param-value">
                      {pkg.companies}
                      <span>家</span>
                    </div>
                  </div>
                  <div className="pcp-param-item">
                    <div className="pcp-param-label">有效期</div>
                    <div className="pcp-param-value">永久</div>
                  </div>
                  <div className="pcp-param-item">
                    <div className="pcp-param-label">单家成本</div>
                    <div className="pcp-param-value">¥{pkg.costPerCompany}</div>
                  </div>
                </div>

                <div className="pcp-price-section">
                  <div className="pcp-current-price">¥{pkg.price}</div>
                </div>

                <div className="pcp-benefits-tags">
                  {pkg.bonus && <span className="pcp-bonus-tag">{pkg.bonus}</span>}
                  {pkg.savings && <span className="pcp-savings-tag">{pkg.savings}</span>}
                </div>

                <button className="pcp-buy-button" onClick={() => buyPackage(pkg)}>
                  立即购买{pkg.title}
                </button>

                <div className="pcp-payment-tips">
                  支持微信/支付宝 · 1分钟到账立即可用 · 支持开发票
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="pcp-card pcp-faq-section">
          <div className="pcp-faq-title">💡 常见问题</div>

          <div className="pcp-faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="pcp-faq-item">
                <div className="pcp-faq-question">{faq.question}</div>
                <div className="pcp-faq-answer">{faq.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 支付组件 */}
      <Modal
        title="支付订单"
        visible={isPaymentOpen}
        onCancel={handlePaymentClose}
        footer={null}
        width={isMobile ? "90%" : 544}
        centered
        bodyStyle={{ paddingBottom: "28px" }}
      >
        {!isMobile && (
          <PaymentMethodCards
            paymentMethod={paymentMethod}
            paymentMethodList={defaultPaymentMethodList}
            onClick={handlePaymentMethodChange}
          />
        )}

        <div className="mt-2 flex h-full w-full flex-col items-center">
          <div className="h-10 text-2xl font-semibold">支付金额：{price}元</div>
          {!isMobile && (
            <PaymentQRCode
              codeUrl={paymentHtml}
              paymentMethod={paymentMethod}
              loading={loading}
              orderId={paymentOrderId}
              isMobile={isMobile}
              countdown={false}
              continueQuery={isPaymentOpen} // 当对话框关闭时，停止查询订单状态
              onSuccess={handlePaymentSuccess}
              onClose={handlePaymentClose}
            />
          )}
        </div>

        {isMobile ? (
          <>
            <PaymentAgreement />
            <PaymentMethodCards
              paymentMethod={paymentMethod}
              paymentMethodList={defaultPaymentMethodList.filter(
                (item: any) => (isMobile && item.value === "alipay") || !isMobile,
              )}
              onClick={(method: string) => createPaymentOrder(planId, method)}
            />
          </>
        ) : (
          <PaymentAgreement />
        )}
      </Modal>

      <Modal
        visible={isSuccessOpen}
        onOk={() => setIsSuccessOpen(false)}
        onCancel={() => setIsSuccessOpen(false)}
        footer={
          <Button
            theme="solid"
            type="primary"
            style={{ marginLeft: "0" }}
            block
            onClick={() => setIsSuccessOpen(false)}
          >
            我知道了
          </Button>
        }
        closable={false}
        centered
      >
        <div className="flex flex-col items-center justify-center">
          <img src="/clap_hands.svg" alt="" width={230} height={64} />
          <div className="w-full text-center text-sm">
            恭喜您
            <br />
            本次交易支付成功！
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PurchaseCreditsPage;
