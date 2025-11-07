import React from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import SelectPlanPage from "../pages/SelectPlanPage";
import ProcessingPage from "../pages/ProcessingPage";
import CompletePage from "../pages/CompletePage";
import BuyCreditsPage from "../pages/BuyCreditsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "select-plan",
        element: <SelectPlanPage />,
      },
      {
        path: "processing",
        // index: true,
        element: <ProcessingPage />,
      },
      {
        path: "complete",
        element: <CompletePage />,
      },
      {
        path: "buy-credits",
        element: <BuyCreditsPage />,
      },
    ],
  },
]);

export default router;
