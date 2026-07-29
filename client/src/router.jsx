import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./components/AppLayout.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { CaseDetailPage } from "./pages/CaseDetailPage.jsx";
import { CasesPage } from "./pages/CasesPage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { NewCasePage } from "./pages/NewCasePage.jsx";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/cases" replace /> },
      { path: "cases", element: <CasesPage /> },
      { path: "cases/new", element: <NewCasePage /> },
      { path: "cases/:id", element: <CaseDetailPage /> }
    ]
  }
]);
