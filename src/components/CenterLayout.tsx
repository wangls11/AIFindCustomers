import { Spin } from "@douyinfe/semi-ui";
import "./CenterLayout.css";

// CenterLayout Props 接口
interface CenterLayoutProps {
  status: 'loading' | 'error' | 'success';
  loadingText?: string;
  errorTitle?: string;
  errorMessage?: string;
  onReload?: () => void;
  successContent?: React.ReactNode;
}

/**
 * 居中布局组件
 * 用于显示loading、错误或成功状态
 */
export default function CenterLayout({
  status,
  loadingText = "正在加载...",
  errorTitle = "加载失败",
  errorMessage = "",
  onReload,
  successContent
}: CenterLayoutProps) {
  // Loading 状态
  if (status === 'loading') {
    return (
      <div className="center-layout">
        <Spin size="large" />
        <div className="center-layout__loading-text">
          {loadingText}
        </div>
      </div>
    );
  }

  // 错误状态
  if (status === 'error') {
    return (
      <div className="center-layout center-layout--error">
        <div className="center-layout__error-title">
          {errorTitle}
        </div>
        {errorMessage && (
          <div className="center-layout__error-message">
            {errorMessage}
          </div>
        )}
        {onReload && (
          <button
            onClick={onReload}
            className="center-layout__reload-button"
          >
            重新加载
          </button>
        )}
      </div>
    );
  }

  // 成功状态
  if (status === 'success') {
    return (
      <div className="center-layout">
        {successContent}
      </div>
    );
  }

  return null;
}