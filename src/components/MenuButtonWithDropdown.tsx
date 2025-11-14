import UserContext from "@/context/UserContext";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "./MenuButtonWithDropdown.css";

interface MenuProps {}

const MenuButtonWithDropdown: React.FC<MenuProps> = () => {
  const content = useContext(UserContext);
  const [showMenu, setShowMenu] = useState(false);
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

  const goToPricing = () => {
    closeMenu();
    try {
      navigate("/recharge");
    } catch (_) {
      window.location.href = "/recharge";
    }
  };

  const goToHistory = () => {
    closeMenu();
    try {
      window.dispatchEvent(new CustomEvent("open-invite-code"));
    } catch (_) {}
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
        className={`menu-dropdown-user-menu ${
          showMenu ? "menu-dropdown-show" : ""
        }`}
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
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <div style={{ fontSize: 13, color: "#666" }}>当前积分:</div>
                <div className="menu-dropdown-credits">
                  <div className="credits">
                    {content?.user?.integral || 0} 积分
                  </div>
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

        <div
          className="menu-dropdown-menu-item"
          onClick={() => navigate("/invite")}
          role="menuitem"
        >
          <div className="menu-dropdown-menu-item-icon">🎁</div>
          <div className="menu-dropdown-menu-item-content">
            <div className="menu-dropdown-menu-item-title">使用邀请码</div>
            <div className="menu-dropdown-menu-item-desc">
              输入邀请码领取奖励
            </div>
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
            <div className="menu-dropdown-menu-item-desc">
              遇到问题？联系我们
            </div>
          </div>
        </div>
      </div>

      <div
        className={`menu-dropdown-overlay ${
          showMenu ? "menu-dropdown-show" : ""
        }`}
        onClick={closeMenu}
        aria-hidden
      />
    </div>
  );
};

export default MenuButtonWithDropdown;
