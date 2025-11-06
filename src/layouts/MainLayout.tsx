import React from "react";
import { Outlet, Link } from "react-router";
import "./MainLayout.css";

const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
