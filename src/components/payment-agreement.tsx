/**
 * 支付协议组件
 * 显示支付协议链接，点击可打开协议详情
 */
export const PaymentAgreement = () => {
  const agreementUrl = "https://feichuangtech.feishu.cn/wiki/QF1kwEhsNiGDvzkFiOzcQkflnLe";

  return (
    <div className={`flex w-full justify-center text-sm text-muted-foreground`}>
      <span>确认支付即同意</span>
      <span
        className="cursor-pointer leading-5 text-indigo-500 hover:underline"
        onClick={() => {
          window.open(agreementUrl, "_blank");
        }}
      >
        《购买协议》
      </span>
    </div>
  );
};

export default PaymentAgreement;
