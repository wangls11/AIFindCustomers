import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const MenuButtonWithDropdown: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownMenuRef = useRef<HTMLDivElement | null>(null);
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
        dropdownMenuRef.current &&
        !dropdownMenuRef.current.contains(target)
      ) {
        closeMenu();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const goToAccount = () => {
    closeMenu();
    try {
      navigate("/account");
    } catch (_) {
      window.location.href = "/account";
    }
  };

  const goToHistory = () => {
    closeMenu();
    try {
      navigate("/history");
    } catch (_) {
      window.location.href = "/history";
    }
  };

  return (
    <>
      <style>{`
        .icon { background: transparent; border: none; cursor: pointer; font-size: 20px; padding: 6px 10px; border-radius: 6px; }
        .icon:hover { background: #f5f5f5; }
        .dropdown-menu { position: absolute; top: 40px; left: -150px; width: 180px; background: white; border: 1px solid #e8e8e8; border-radius: 8px; box-shadow: 0 6px 18px rgba(0,0,0,0.08); display: none; z-index: 2000; }
        .dropdown-menu.show { display: block; }
        .menu-item { padding: 12px 14px; display:flex; align-items:center; gap:8px; cursor:pointer; border-bottom:1px solid #f0f0f0 }
        .menu-item:last-child{ border-bottom: none }
        .menu-item:hover{ background:#f5f5f5 }
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
          ref={dropdownMenuRef}
          className={`dropdown-menu ${showMenu ? "show" : ""}`}
          role="menu"
        >
          <div className="menu-item" onClick={goToAccount} role="menuitem">
            <span>👤</span>
            <span>账户信息</span>
          </div>
          <div className="menu-item" onClick={goToHistory} role="menuitem">
            <span>📋</span>
            <span>历史分析</span>
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
