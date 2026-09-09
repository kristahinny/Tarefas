import type { ResumoSemana } from "../services";
import { fmtMinutos, formatarDataBRCurta } from "../services";

export const SemanaView = ({ resumo }: { resumo: ResumoSemana }) => (
  <>
    <div class="topbar">
      <p class="greeting">
        {formatarDataBRCurta(resumo.inicio)} — {formatarDataBRCurta(resumo.fim)}
      </p>
      <h1 class="day-title">Minha Semana</h1>
    </div>

    <div class="section-label" style="margin-top:8px;">
      Dias da semana
    </div>
    {resumo.dias.map((dia) => (
      <div class={`week-day-card ${dia.ehHoje ? "today" : ""}`}>
        <div class="dia-nome">{dia.nome}</div>
        <div class="dia-meta">
          {dia.metaMinutos ? `${fmtMinutos(dia.estudadoMinutos)} / ${fmtMinutos(dia.metaMinutos)}` : "Descanso"}
        </div>
        {dia.metaMinutos ? (
          dia.concluido ? (
            <span class="status-pill ok">✓ concluído</span>
          ) : (
            <span class="status-pill pend">pendente</span>
          )
        ) : null}
      </div>
    ))}

    <div class="week-summary">
      <div class="top">
        <span class="label">Meta semanal</span>
        <span class="value">
          {fmtMinutos(resumo.totalEstudado)} / {fmtMinutos(resumo.totalMeta)}
        </span>
      </div>
      <div class="progress-bar">
        <div class="fill" style={`width:${resumo.pct}%;`}></div>
      </div>
      <div class="pct-line">{resumo.pct}% da meta semanal</div>
    </div>
  </>
);
