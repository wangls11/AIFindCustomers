/**
 * 支付方式卡片组件的属性接口
 */
export type PaymentMethodCardsProps = {
  className?: string;
  paymentMethod: string;
  paymentMethodList: Array<{ value: string; label: string }>;
  onClick: (method: string) => void;
};

/**
 * 支付方式选择卡片组件
 * 显示不同的支付方式选项，并高亮当前选中的方式
 */
export const PaymentMethodCards = ({
  className,
  paymentMethod,
  paymentMethodList,
  onClick,
}: PaymentMethodCardsProps) => {
  return (
    <div className={`flex w-full flex-col gap-4 md:flex-row ${className}`}>
      {paymentMethodList.map((item) => {
        const isSelected = paymentMethod === item.value;
        return (
          <div
            key={item.value}
            className={`flex h-16 w-full cursor-pointer select-none flex-col items-center justify-center gap-2 text-sm font-medium transition-all hover:shadow-md md:flex-row ${
              isSelected
                ? "border-2 border-blue-500 shadow-md rounded"
                : "border border-gray-300 rounded"
            }`}
            onClick={() => onClick(item.value)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              height: "100%",
              justifyContent: "center",
              padding: "16px",
            }}
          >
            <img src={`/${item.value}.svg`} alt={item.value} width={20} height={20} />
            <span>{item.label}</span>
          </div>
        );
      })}
    </div>
  );
};

/**
 * 默认的支付方式列表
 */
export const defaultPaymentMethodList = [
  { label: "支付宝", value: "alipay" },
  { label: "微信支付", value: "wechat" },
];

export default PaymentMethodCards;
