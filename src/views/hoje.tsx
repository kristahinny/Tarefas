import type { ChecklistItem, RotinaItem } from "../db";
import { horarioLabel } from "../db";

const ICONES: Record<string, string> = {
  acordar: "⏰",
  personal: "🏋️",
  estudo: "📚",
  trabalho: "💼",
  almoco: "🍽️",
  descanso: "🌙",
  geral: "☐",
};

type Props = {
  primeiroNome: string;
  nomeDia: string;
  metaLabel: string;
  metaMin: number;
  itens: ChecklistItem[];
  rotinasHoje: Map<string, RotinaItem>;
  pct: number;
  concluidos: number;
  total: number;
  itemEstudo: ChecklistItem | null;
};

export const HojeView = ({ primeiroNome, nomeDia, metaLabel, metaMin, itens, rotinasHoje, pct, concluidos, total, itemEstudo }: Props) => (
  <>
    <div class="topbar">
      <p class="greeting">Olá, {primeiroNome} 👋</p>
      <h1 class="day-title">{nomeDia}</h1>
    </div>

    <div class="card-goal">
      <div class="num">{metaLabel}</div>
      <div class="txt">
        <b>Meta de hoje</b>
        {metaMin ? "de estudo focado" : "dia de descanso — aproveite!"}
      </div>
    </div>

    <div class="section-label">Rotina de hoje</div>
    {itens.length > 0 ? (
      <ul class="checklist">
        {itens.map((item) => {
          const rotina = rotinasHoje.get(item.atividade);
          return (
            <li class={`checklist-item ${item.concluido ? "done" : ""}`} data-id={item.id}>
              <div class="checkbox">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
              <span class="tag-icon">{ICONES[item.tipo] ?? "☐"}</span>
              <div class="info">
                <div class="titulo">{item.atividade}</div>
                {rotina && horarioLabel(rotina) && <div class="horario">{horarioLabel(rotina)}</div>}
              </div>
            </li>
          );
        })}
      </ul>
    ) : (
      <div class="empty-state">
        <div class="emoji">🌤️</div>
        Nenhuma atividade cadastrada para hoje.
      </div>
    )}

    <div class="section-label" style="margin-top:6px;">
      Progresso do dia
    </div>
    <div class="progress-wrap">
      <div class="labels">
        <span data-progress-count>
          {concluidos}/{total}
        </span>
        <span class="pct" data-progress-pct>
          {pct}%
        </span>
      </div>
      <div class="progress-bar">
        <div class="fill" data-progress-fill style={`width:${pct}%;`}></div>
      </div>
    </div>

    {itemEstudo && (
      <div class="btn-block-wrap">
        <button class={`btn ${itemEstudo.concluido ? "btn-outline" : "btn-gold"}`} id="btn-concluir-estudo" data-id={itemEstudo.id}>
          {itemEstudo.concluido ? "✓ ESTUDO CONCLUÍDO" : "CONCLUIR ESTUDO"}
        </button>
      </div>
    )}

    <div class="btn-block-wrap" style="margin-top:-8px;">
      <a class="btn btn-primary" href="/registrar">
        ➕ REGISTRAR ESTUDO
      </a>
    </div>

    <script
      dangerouslySetInnerHTML={{
        __html: `
      const btnConcluir = document.getElementById("btn-concluir-estudo");
      if (btnConcluir) {
        btnConcluir.addEventListener("click", async () => {
          if (btnConcluir.disabled) return; // evita duplo toque disparar dois toggles
          btnConcluir.disabled = true;
          const id = btnConcluir.dataset.id;
          try {
            await fetch(\`/checklist/\${id}/toggle\`, { method: "POST" });
          } finally {
            window.location.reload();
          }
        });
      }
    `,
      }}
    ></script>
  </>
);
