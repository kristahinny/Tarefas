import type { FC } from "hono/jsx";

export type FlashMessage = { category: string; message: string };

type LayoutProps = {
  title?: string;
  activeNav?: "hoje" | "semana" | "materias" | "perfil" | null;
  authenticated: boolean;
  flash?: FlashMessage[];
  children: any;
};

export const Layout: FC<LayoutProps> = ({ title, activeNav, authenticated, flash, children }) => {
  return (
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <title>{title ?? "Meu Plano TCE-GO"}</title>
        <meta name="theme-color" content="#1B2A4A" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700;9..144,900&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/static/css/style.css" />
      </head>
      <body>
        <div class="app-shell">
          {flash?.map((f) => (
            <div class={`flash flash-${f.category}`}>{f.message}</div>
          ))}

          {children}

          {authenticated && (
            <nav class="bottom-nav">
              <a class={`nav-item ${activeNav === "hoje" ? "active" : ""}`} href="/">
                <span class="ic">🏠</span> Hoje
              </a>
              <a class={`nav-item ${activeNav === "semana" ? "active" : ""}`} href="/semana">
                <span class="ic">📅</span> Semana
              </a>
              <a class="nav-item fab" href="/registrar">
                <span class="ic">➕</span> Registrar
              </a>
              <a class={`nav-item ${activeNav === "materias" ? "active" : ""}`} href="/materias">
                <span class="ic">📚</span> Matérias
              </a>
              <a class={`nav-item ${activeNav === "perfil" ? "active" : ""}`} href="/perfil">
                <span class="ic">👤</span> Perfil
              </a>
            </nav>
          )}
        </div>
        <script src="/static/js/app.js"></script>
      </body>
    </html>
  );
};
