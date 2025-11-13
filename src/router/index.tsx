import React from "react";
import { createBrowserRouter } from "react-router";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import SelectPlanPage from "../pages/SelectPlanPage";
import ProcessingPage from "../pages/ProcessingPage";
import CompletePage from "../pages/CompletePage";
import HistoryAnalysisPage from "@/pages/HistoryAnalysisPage";
import PurchaseCreditsPage from "@/pages/PurchaseCreditsPage";
import CreditsDetailPage from "@/pages/CreditsDetailPage";
import HelpAndFeedbackPage from "@/pages/HelpAndFeedbackPage";

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
        path: "credits",
        element: <CreditsDetailPage />,
      },
      {
        path: "recharge",
        element: <PurchaseCreditsPage />,
      },
      {
        path: "history",
        element: <HistoryAnalysisPage />,
      },
      {
        path: "help-feedback",
        element: <HelpAndFeedbackPage />,
      },
    ],
  },
]);

export default router;
