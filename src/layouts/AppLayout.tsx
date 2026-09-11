import { useEffect, useRef } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router";
import { Icon } from "../components/Icon";

export default function AppLayout() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "Início",
      "/salary": "Salário e moedas",
      "/timezones": "Fusos horários",
      "/json": "JSON Formatter",
    };
    document.title = `${titles[pathname] ?? "Página não encontrada"} · GAQ Tools`;
    if (previousPath.current !== pathname) {
      window.scrollTo(0, 0);
      main.current?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <aside className="sidebar">
        <Link to="/" className="brand" aria-label="GAQ Tools — início">
          <span className="brand-mark">
            <Icon name="cloud" />
          </span>
          <span>
            GAQ<span className="brand-light"> CLOUD</span>
            <small>TOOLS WORKSPACE</small>
          </span>
        </Link>
        <div className="nav-label">WORKSPACE</div>
        <nav aria-label="Navegação principal">
          <NavLink to="/" end>
            <Icon name="grid" />
            Visão geral
          </NavLink>
          <span className="nav-label tools-label">FERRAMENTAS</span>
          <NavLink to="/salary">
            <Icon name="salary" />
            Salário e moedas
          </NavLink>
          <NavLink to="/timezones">
            <Icon name="clock" />
            Fusos horários
          </NavLink>
          <NavLink to="/json">
            <Icon name="json" />
            JSON Formatter
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <span className="mini-label">SEU ECOSSISTEMA</span>
          <a href="https://home.gaqtech.dev">
            <Icon name="cloud" />
            <span>Portal GAQ CLOUD</span>
            <span aria-hidden="true">↗</span>
          </a>
          <p>Suas ferramentas. Seu espaço.</p>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span>{" "}
            <strong>GAQ Tools</strong>
          </span>
          <span className="version">
            <i />
            Versão inicial
          </span>
        </header>
        <main id="main" ref={main} tabIndex={-1}>
          <Outlet />
        </main>
        <footer>
          <span>
            GAQ Tools <span className="muted">· Parte da GAQ CLOUD</span>
          </span>
          <span>Feito para simplificar o dia a dia.</span>
        </footer>
      </div>
    </div>
  );
}
