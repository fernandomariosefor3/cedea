import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import LoginPage from "../pages/login/page";
import EscolasPage from "../pages/escolas/page";
import FluxoPage from "../pages/fluxo/page";
import NotasPage from "../pages/notas/page";
import CdGPage from "../pages/cdg/page";
import VisitasPage from "../pages/visitas/page";
import BuscaAtivaPage from "../pages/busca-ativa/page";
import PPDTPage from "../pages/ppdt/page";
import RecomposicaoPage from "../pages/recomposicao/page";
import RelatoriosPage from "../pages/relatorios/page";
import ProtectedRoute from "../components/feature/ProtectedRoute";

const routes: RouteObject[] = [
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "/escolas",
    element: (
      <ProtectedRoute>
        <EscolasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/fluxo-escolar",
    element: (
      <ProtectedRoute>
        <FluxoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/notas",
    element: (
      <ProtectedRoute>
        <NotasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/cdg",
    element: (
      <ProtectedRoute>
        <CdGPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/visitas",
    element: (
      <ProtectedRoute>
        <VisitasPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/busca-ativa",
    element: (
      <ProtectedRoute>
        <BuscaAtivaPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/ppdt",
    element: (
      <ProtectedRoute>
        <PPDTPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/recomposicao",
    element: (
      <ProtectedRoute>
        <RecomposicaoPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/relatorios",
    element: (
      <ProtectedRoute>
        <RelatoriosPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;
