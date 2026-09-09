import type { RegistroEstudo } from "../db";
import { materiaDisplay } from "../db";
import { fmtMinutos } from "../services";

type Grupo = { chave: string; registros: RegistroEstudo[] };

export const HistoricoView = ({ grupos }: { grupos: Grupo[] }) => (
  <>
    <div class="topbar">
      <p class="greeting">Seus últimos registros</p>
      <h1 class="day-title">Histórico</h1>
    </div>

    {grupos.length > 0 ? (
      grupos.map((g) => (
        <>
          <div class="hist-group-title">{g.chave}</div>
          {g.registros.map((r) => (
            <div class="hist-item">
              <span class="tipo-dot"></span>
              <div class="info">
                <div class="materia">{materiaDisplay(r)}</div>
                <div class="meta">
                  {r.tipo}
                  {r.observacao ? ` · ${r.observacao}` : ""}
                </div>
              </div>
              <div class="tempo">{fmtMinutos(r.minutos)}</div>
            </div>
          ))}
        </>
      ))
    ) : (
      <div class="empty-state">
        <div class="emoji">🗂️</div>
        Nenhum estudo registrado ainda.
      </div>
    )}
  </>
);
