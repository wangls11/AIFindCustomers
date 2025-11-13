import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

interface MenuProps {
  credits?: number;
}

const MenuButtonWithDropdown: React.FC<MenuProps> = ({ credits = 1250 }) => {
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
    <>
      <style>{`
        .icon { background: transparent; border: none; cursor: pointer; font-size: 20px; padding: 6px 10px; border-radius: 6px; }
        .icon:hover { background: #f5f5f5; }

        .user-menu {
          position: absolute;
          top: 40px;
          right: 0px;
          width: 320px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 6px 20px rgba(0,0,0,0.08);
          overflow: hidden;
          z-index: 2000;
          display: none;
        }

        .user-menu.show { display: block; }

        .user-menu .menu-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f5f5f5;
          display:flex;
          justify-content:space-between;
          align-items:center;
        }

        .user-menu .menu-header .credits {
          font-weight:700;
          color:#111;
        }

        .menu-item {
          padding: 14px 20px;
          border-bottom: 1px solid #f7f7f7;
          cursor: pointer;
          transition: background 0.15s ease;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .menu-item:last-child { border-bottom: none; }

        .menu-item:hover { background: #fbfbfb; }

        .menu-item-icon {
          font-size: 18px;
          width: 28px;
          text-align: center;
          flex-shrink: 0;
        }

        .menu-item-title { font-size: 14px; font-weight: 600; color: #111; }
        .menu-item-desc { font-size: 12px; color: #888; margin-top: 4px; }
        .menu-item-content { flex: 1; }

        .overlay { position: fixed; inset: 0; background: transparent; display: none; z-index: 1500 }
        .overlay.show { display: block }
      `}</style>

      <div style={{ position: "relative" }}>
        <button
          className="icon"
          aria-label="菜单"
          ref={menuButtonRef}
          onClick={toggleMenu}
        >
          ☰
        </button>

        <div
          ref={dropdownRef}
          className={`user-menu ${showMenu ? "show" : ""}`}
          role="menu"
          aria-hidden={!showMenu}
        >
          {/* <div className="menu-header">
            <div>
              <div style={{ fontSize: 13, color: "#666" }}>当前积分</div>
              <div className="credits">{credits.toLocaleString()} 积分</div>
            </div>
          </div> */}

          <div
            className="menu-item"
            onClick={() => navigateTo("/credits")}
            role="menuitem"
          >
            <div className="menu-item-icon">💎</div>
            <div className="menu-item-content">
              <div className="menu-item-title">我的积分</div>
              <div className="menu-item-desc">
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div style={{ fontSize: 13, color: "#666" }}>当前积分:</div>
                  <div className="credits">{credits.toLocaleString()} 积分</div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="menu-item"
            onClick={() => navigateTo("/history")}
            role="menuitem"
          >
            <div className="menu-item-icon">📋</div>
            <div className="menu-item-content">
              <div className="menu-item-title">历史分析</div>
              <div className="menu-item-desc">查看所有分析记录</div>
            </div>
          </div>

          <div
            className="menu-item"
            onClick={() => navigateTo("/recharge")}
            role="menuitem"
          >
            <div className="menu-item-icon">💳</div>
            <div className="menu-item-content">
              <div className="menu-item-title">充值购买</div>
              <div className="menu-item-desc">购买积分套餐</div>
            </div>
          </div>

          <div
            className="menu-item"
            onClick={() => navigate("/invite")}
            role="menuitem"
          >
            <div className="menu-item-icon">🎁</div>
            <div className="menu-item-content">
              <div className="menu-item-title">使用邀请码</div>
              <div className="menu-item-desc">输入邀请码领取奖励</div>
            </div>
          </div>

          <div
            className="menu-item"
            onClick={() => navigateTo("/help-feedback")}
            role="menuitem"
          >
            <div className="menu-item-icon">❓</div>
            <div className="menu-item-content">
              <div className="menu-item-title">帮助与反馈</div>
              <div className="menu-item-desc">遇到问题？联系我们</div>
            </div>
          </div>
        </div>

        <div
          className={`overlay ${showMenu ? "show" : ""}`}
          onClick={closeMenu}
          aria-hidden
        />
      </div>
    </>
  );
};

export default MenuButtonWithDropdown;
