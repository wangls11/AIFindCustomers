import UserContext from "@/context/UserContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useUser } from "@/contexts/UserContext";
import { Modal, Button, Input, Toast } from "@douyinfe/semi-ui";
import { exchange } from "@/api/user";
import "./MenuButtonWithDropdown.css";

interface MenuProps {}

const MenuButtonWithDropdown: React.FC<MenuProps> = () => {
  const content = useContext(UserContext);
  const [showMenu, setShowMenu] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { userInfo, refreshUserInfo } = useUser();
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((s) => !s);
  };

  const closeMenu = () => setShowMenu(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuButtonRef.current &&
        !menuButtonRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // navigation helpers used inside menu items
  const navigateTo = (path: string) => {
    closeMenu();
    try {
      navigate(path);
    } catch (_) {
      window.location.href = path;
    }
  };

  const showInviteCodeModal = () => {
    closeMenu();
    setShowInviteModal(true);
  };

  const closeInviteCodeModal = () => {
    setShowInviteModal(false);
    setInviteCode("");
  };

  const handleInviteCodeChange = (value: string) => {
    setInviteCode(value);
  };

  const activateInviteCode = async () => {
    const trimmedCode = inviteCode.trim();
    if (!trimmedCode) {
      Toast.error({ content: "请输入邀请码" });
      return;
    }

    setLoading(true);
    try {
      await exchange(trimmedCode);
      closeInviteCodeModal();
      await refreshUserInfo();
      Toast.success({ content: "邀请码激活成功！" });
    } catch (error: any) {
      console.error("邀请码激活失败:", error);
      Toast.error({ content: error.message || "邀请码无效或已被使用" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        className="menu-dropdown-icon"
        aria-label="菜单"
        ref={menuButtonRef}
        onClick={toggleMenu}
      >
        ☰
      </button>

      <div
        ref={dropdownRef}
        className={`menu-dropdown-user-menu ${showMenu ? "menu-dropdown-show" : ""}`}
        role="menu"
        aria-hidden={!showMenu}
      >
        <div
          className="menu-dropdown-menu-item"
          onClick={() => navigateTo("/credits")}
          role="menuitem"
        >
          <div className="menu-dropdown-menu-item-icon">💎</div>
          <div className="menu-dropdown-menu-item-content">
            <div className="menu-dropdown-menu-item-title">我的积分</div>
            <div className="menu-dropdown-menu-item-desc">
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ fontSize: 13, color: "#666" }}>当前积分:</div>
                <div className="menu-dropdown-credits">
                  {(userInfo?.integral || 0).toLocaleString()} 积分
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="menu-dropdown-menu-item"
          onClick={() => navigateTo("/history")}
          role="menuitem"
        >
          <div className="menu-dropdown-menu-item-icon">📋</div>
          <div className="menu-dropdown-menu-item-content">
            <div className="menu-dropdown-menu-item-title">历史分析</div>
            <div className="menu-dropdown-menu-item-desc">查看所有分析记录</div>
          </div>
        </div>

        <div
          className="menu-dropdown-menu-item"
          onClick={() => navigateTo("/recharge")}
          role="menuitem"
        >
          <div className="menu-dropdown-menu-item-icon">💳</div>
          <div className="menu-dropdown-menu-item-content">
            <div className="menu-dropdown-menu-item-title">充值购买</div>
            <div className="menu-dropdown-menu-item-desc">购买积分套餐</div>
          </div>
        </div>

        <div className="menu-dropdown-menu-item" onClick={showInviteCodeModal} role="menuitem">
          <div className="menu-dropdown-menu-item-icon">🎁</div>
          <div className="menu-dropdown-menu-item-content">
            <div className="menu-dropdown-menu-item-title">使用邀请码</div>
            <div className="menu-dropdown-menu-item-desc">输入邀请码领取奖励</div>
          </div>
        </div>

        <div
          className="menu-dropdown-menu-item"
          onClick={() => navigateTo("/help-feedback")}
          role="menuitem"
        >
          <div className="menu-dropdown-menu-item-icon">❓</div>
          <div className="menu-dropdown-menu-item-content">
            <div className="menu-dropdown-menu-item-title">帮助与反馈</div>
            <div className="menu-dropdown-menu-item-desc">遇到问题？联系我们</div>
          </div>
        </div>
      </div>

      <div
        className={`menu-dropdown-overlay ${showMenu ? "menu-dropdown-show" : ""}`}
        onClick={closeMenu}
        aria-hidden
      />

      {/* 邀请码弹窗 */}
      <Modal
        title="使用邀请码"
        visible={showInviteModal}
        onCancel={closeInviteCodeModal}
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button onClick={closeInviteCodeModal}>取消</Button>
            <Button
              theme="solid"
              type="primary"
              onClick={activateInviteCode}
              disabled={!inviteCode.trim() || loading}
              loading={loading}
            >
              确认激活
            </Button>
          </div>
        }
        centered
      >
        <div style={{ marginBottom: "16px" }}>
          <Input
            placeholder="请输入邀请码"
            value={inviteCode}
            onChange={handleInviteCodeChange}
            style={{ width: "100%" }}
          />
        </div>
        <div className="modal-tips">
          <div className="modal-tips-title">💡 使用邀请码即可获得：</div>
          <div className="modal-tips-list">
            • 免费领 200 积分（原价 ¥20）
            <br />• 可免费体验 8 家企业分析
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuButtonWithDropdown;
