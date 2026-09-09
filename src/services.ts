import type { D1Database } from "@cloudflare/workers-types";
import * as db from "./db";

export const DIAS_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const NOME_DIA_PT = [
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
];
export const TIPOS_ESTUDO = ["Teoria", "Questões", "Revisão", "Anki", "Redação"];

// data no formato ISO "YYYY-MM-DD", sempre em relação ao fuso horário de São Paulo.
export function hojeISO(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" });
  return fmt.format(new Date()); // en-CA -> YYYY-MM-DD
}

export function diaSemanaDe(dataISO: string): number {
  // 0=Segunda ... 6=Domingo
  const [y, m, d] = dataISO.split("-").map(Number);
  const jsDay = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Domingo ... 6=Sábado
  return (jsDay + 6) % 7;
}

export function somaDias(dataISO: string, dias: number): string {
  const [y, m, d] = dataISO.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + dias);
  return dt.toISOString().slice(0, 10);
}

export function inicioDaSemana(dataISO: string): string {
  const diaSemana = diaSemanaDe(dataISO);
  return somaDias(dataISO, -diaSemana);
}

export function formatarDataBR(dataISO: string): string {
  const [y, m, d] = dataISO.split("-");
  return `${d}/${m}/${y}`;
}

export function formatarDataBRCurta(dataISO: string): string {
  const [, m, d] = dataISO.split("-");
  return `${d}/${m}`;
}

export async function metaMinutosDia(database: D1Database, usuarioId: number, diaSemana: number): Promise<number> {
  const rotinas = await db.listRotinaPorDiaETipo(database, usuarioId, diaSemana, "estudo");
  return rotinas.reduce((acc, r) => acc + db.duracaoRotina(r), 0);
}

export async function garantirChecklistDoDia(database: D1Database, usuarioId: number, dataRef: string): Promise<void> {
  const existentes = await db.contarChecklistDoDia(database, usuarioId, dataRef);
  if (existentes > 0) return;

  const diaSemana = diaSemanaDe(dataRef);
  const rotinas = await db.listRotinaPorDia(database, usuarioId, diaSemana);
  for (const r of rotinas) {
    await db.criarChecklistItem(database, usuarioId, dataRef, r.atividade, r.tipo, r.ordem);
  }
}

export async function progressoDia(
  database: D1Database,
  usuarioId: number,
  dataRef: string
): Promise<{ concluidos: number; total: number; pct: number }> {
  const itens = await db.listChecklistDoDia(database, usuarioId, dataRef);
  const total = itens.length;
  const concluidos = itens.filter((i) => i.concluido).length;
  const pct = total ? Math.round((concluidos / total) * 100) : 0;
  return { concluidos, total, pct };
}

export interface DiaResumo {
  data: string;
  nome: string;
  metaMinutos: number;
  estudadoMinutos: number;
  concluido: boolean;
  ehHoje: boolean;
}

export interface ResumoSemana {
  dias: DiaResumo[];
  totalEstudado: number;
  totalMeta: number;
  pct: number;
  inicio: string;
  fim: string;
}

export async function resumoSemana(database: D1Database, usuarioId: number, dataRef: string): Promise<ResumoSemana> {
  const seg = inicioDaSemana(dataRef);
  const hoje = hojeISO();
  const dias: DiaResumo[] = [];
  let totalEstudado = 0;
  let totalMeta = 0;

  for (let i = 0; i < 7; i++) {
    const d = somaDias(seg, i);
    const meta = await metaMinutosDia(database, usuarioId, i);
    const estudado = await db.minutosEstudadosNoDia(database, usuarioId, d);
    const concluido = meta > 0 && estudado >= meta;
    dias.push({ data: d, nome: DIAS_SEMANA[i], metaMinutos: meta, estudadoMinutos: estudado, concluido, ehHoje: d === hoje });
    totalEstudado += estudado;
    totalMeta += meta;
  }

  const pct = totalMeta ? Math.round((totalEstudado / totalMeta) * 100) : 0;
  return {
    dias,
    totalEstudado,
    totalMeta,
    pct: Math.min(pct, 100),
    inicio: seg,
    fim: somaDias(seg, 6),
  };
}

export async function sequenciaDias(database: D1Database, usuarioId: number): Promise<number> {
  let dias = 0;
  let d = hojeISO();
  while (true) {
    const meta = await metaMinutosDia(database, usuarioId, diaSemanaDe(d));
    const estudado = await db.minutosEstudadosNoDia(database, usuarioId, d);
    if (meta > 0 && estudado >= meta) {
      dias += 1;
      d = somaDias(d, -1);
    } else {
      break;
    }
  }
  return dias;
}

export function fmtMinutos(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h && m) return `${h}h${String(m).padStart(2, "0")}`;
  if (h) return `${h}h`;
  return `${m}min`;
}

export function parseTempo(texto: string): number {
  const t = (texto || "").trim().toLowerCase().replace(/\s+/g, "");
  if (!t) return 0;
  if (t.includes("h")) {
    const [horasStr, minutosStr] = t.split("h");
    const horas = horasStr ? parseInt(horasStr, 10) : 0;
    const minutos = minutosStr ? parseInt(minutosStr, 10) : 0;
    return (Number.isNaN(horas) ? 0 : horas) * 60 + (Number.isNaN(minutos) ? 0 : minutos);
  }
  if (t.includes(":")) {
    const [h, m] = t.split(":");
    return (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
  }
  const n = parseInt(t, 10);
  return Number.isNaN(n) ? 0 : n;
}
