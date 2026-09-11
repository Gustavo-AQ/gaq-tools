import { Route, Routes } from "react-router";
import AppLayout from "./layouts/AppLayout";
import Home from "./pages/Home";
import Salary from "./pages/Salary";
import Json from "./pages/Json";
import { lazy, Suspense } from "react";
const Timezones = lazy(() => import("./pages/Timezones"));
import NotFound from "./pages/NotFound";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="salary" element={<Salary />} />
        <Route
          path="timezones"
          element={
            <Suspense
              fallback={<p role="status">Carregando conversor de fusos…</p>}
            >
              <Timezones />
            </Suspense>
          }
        />
        <Route path="json" element={<Json />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
