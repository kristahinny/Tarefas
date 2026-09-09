import type { ResumoSemana } from "../services";
import { fmtMinutos } from "../services";
import type { Usuario } from "../db";

type Props = {
  usuario: Usuario;
  resumo: ResumoSemana;
  seq: number;
  questoes: number;
  estudadoHoje: number;
  metaHoje: number;
};

export const PerfilView = ({ usuario, resumo, seq, questoes, estudadoHoje, metaHoje }: Props) => (
  <>
    <div class="profile-header">
      <div class="profile-avatar">{usuario.nome[0]?.toUpperCase()}</div>
      <h1 class="day-title" style="font-size:20px; text-transform:none;">
        {usuario.nome}
      </h1>
      <p class="greeting">{usuario.email}</p>
    </div>

    <div class="section-label" style="margin-top:14px;">
      Seu progresso
    </div>
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Hoje</div>
        <div class="stat-value">
          {fmtMinutos(estudadoHoje)} <span style="font-size:14px; color:var(--ink-soft);">/ {metaHoje ? fmtMinutos(metaHoje) : "—"}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Semana</div>
        <div class="stat-value">
          {fmtMinutos(resumo.totalEstudado)} <span style="font-size:14px; color:var(--ink-soft);">/ {fmtMinutos(resumo.totalMeta)}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Questões</div>
        <div class="stat-value gold">{questoes}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sequência</div>
        <div class="stat-value coral">
          🔥 {seq} {seq === 1 ? "dia" : "dias"}
        </div>
      </div>
    </div>

    <div class="btn-block-wrap">
      <a class="btn btn-outline" href="/historico">
        📂 VER HISTÓRICO COMPLETO
      </a>
    </div>

    <div class="btn-block-wrap" style="margin-top:-4px;">
      <a class="btn btn-danger-text" href="/logout">
        Sair da conta
      </a>
    </div>
  </>
);
