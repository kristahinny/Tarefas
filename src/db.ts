export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha_hash: string;
  meta_semanal_minutos: number;
}

export interface Materia {
  id: number;
  nome: string;
  usuario_id: number;
}

export interface RegistroEstudo {
  id: number;
  usuario_id: number;
  materia_id: number | null;
  materia_nome_livre: string | null;
  data: string;
  minutos: number;
  tipo: string;
  observacao: string | null;
  criado_em: string;
  materia_nome: string | null;
}

export interface ChecklistItem {
  id: number;
  usuario_id: number;
  data: string;
  atividade: string;
  tipo: string;
  ordem: number;
  concluido: number;
}

export interface RotinaItem {
  id: number;
  usuario_id: number;
  dia_semana: number;
  horario_inicio: string | null;
  horario_fim: string | null;
  atividade: string;
  tipo: string;
  duracao_minutos: number | null;
  icone: string | null;
  ordem: number;
}

export function materiaDisplay(r: RegistroEstudo): string {
  return r.materia_nome || r.materia_nome_livre || "Matéria";
}

export function duracaoRotina(r: RotinaItem): number {
  if (r.duracao_minutos) return r.duracao_minutos;
  if (r.horario_inicio && r.horario_fim) {
    const [h1, m1] = r.horario_inicio.split(":").map(Number);
    const [h2, m2] = r.horario_fim.split(":").map(Number);
    return h2 * 60 + m2 - (h1 * 60 + m1);
  }
  return 0;
}

export function horarioLabel(r: RotinaItem): string {
  if (r.horario_inicio && r.horario_fim) return `${r.horario_inicio} → ${r.horario_fim}`;
  if (r.horario_inicio) return r.horario_inicio;
  return "";
}

export async function getUsuarioByEmail(db: D1Database, email: string): Promise<Usuario | null> {
  const row = await db.prepare("SELECT * FROM usuario WHERE email = ?").bind(email).first<Usuario>();
  return row ?? null;
}

export async function getUsuarioById(db: D1Database, id: number): Promise<Usuario | null> {
  const row = await db.prepare("SELECT * FROM usuario WHERE id = ?").bind(id).first<Usuario>();
  return row ?? null;
}

export async function listMaterias(db: D1Database, usuarioId: number): Promise<Materia[]> {
  const { results } = await db
    .prepare("SELECT * FROM materia WHERE usuario_id = ? ORDER BY nome")
    .bind(usuarioId)
    .all<Materia>();
  return results;
}

export async function criarMateria(db: D1Database, usuarioId: number, nome: string): Promise<void> {
  await db.prepare("INSERT INTO materia (nome, usuario_id) VALUES (?, ?)").bind(nome, usuarioId).run();
}

export async function editarMateria(db: D1Database, materiaId: number, usuarioId: number, nome: string): Promise<void> {
  await db
    .prepare("UPDATE materia SET nome = ? WHERE id = ? AND usuario_id = ?")
    .bind(nome, materiaId, usuarioId)
    .run();
}

export async function excluirMateria(db: D1Database, materiaId: number, usuarioId: number): Promise<void> {
  await db.prepare("DELETE FROM materia WHERE id = ? AND usuario_id = ?").bind(materiaId, usuarioId).run();
}

export async function getMateria(db: D1Database, materiaId: number, usuarioId: number): Promise<Materia | null> {
  const row = await db
    .prepare("SELECT * FROM materia WHERE id = ? AND usuario_id = ?")
    .bind(materiaId, usuarioId)
    .first<Materia>();
  return row ?? null;
}

export async function listRotinaPorDia(db: D1Database, usuarioId: number, diaSemana: number): Promise<RotinaItem[]> {
  const { results } = await db
    .prepare("SELECT * FROM rotina WHERE usuario_id = ? AND dia_semana = ? ORDER BY ordem")
    .bind(usuarioId, diaSemana)
    .all<RotinaItem>();
  return results;
}

export async function listRotinaPorDiaETipo(
  db: D1Database,
  usuarioId: number,
  diaSemana: number,
  tipo: string
): Promise<RotinaItem[]> {
  const { results } = await db
    .prepare("SELECT * FROM rotina WHERE usuario_id = ? AND dia_semana = ? AND tipo = ?")
    .bind(usuarioId, diaSemana, tipo)
    .all<RotinaItem>();
  return results;
}

export async function contarChecklistDoDia(db: D1Database, usuarioId: number, data: string): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM checklist_diario WHERE usuario_id = ? AND data = ?")
    .bind(usuarioId, data)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function criarChecklistItem(
  db: D1Database,
  usuarioId: number,
  data: string,
  atividade: string,
  tipo: string,
  ordem: number
): Promise<void> {
  await db
    .prepare(
      "INSERT INTO checklist_diario (usuario_id, data, atividade, tipo, ordem, concluido) VALUES (?, ?, ?, ?, ?, 0)"
    )
    .bind(usuarioId, data, atividade, tipo, ordem)
    .run();
}

export async function listChecklistDoDia(db: D1Database, usuarioId: number, data: string): Promise<ChecklistItem[]> {
  const { results } = await db
    .prepare("SELECT * FROM checklist_diario WHERE usuario_id = ? AND data = ? ORDER BY ordem")
    .bind(usuarioId, data)
    .all<ChecklistItem>();
  return results;
}

export async function getChecklistItem(db: D1Database, id: number, usuarioId: number): Promise<ChecklistItem | null> {
  const row = await db
    .prepare("SELECT * FROM checklist_diario WHERE id = ? AND usuario_id = ?")
    .bind(id, usuarioId)
    .first<ChecklistItem>();
  return row ?? null;
}

export async function setChecklistConcluido(db: D1Database, id: number, concluido: boolean): Promise<void> {
  await db.prepare("UPDATE checklist_diario SET concluido = ? WHERE id = ?").bind(concluido ? 1 : 0, id).run();
}

export async function marcarChecklistEstudoConcluido(db: D1Database, usuarioId: number, data: string): Promise<void> {
  await db
    .prepare("UPDATE checklist_diario SET concluido = 1 WHERE usuario_id = ? AND data = ? AND tipo = 'estudo'")
    .bind(usuarioId, data)
    .run();
}

export async function minutosEstudadosNoDia(db: D1Database, usuarioId: number, data: string): Promise<number> {
  const row = await db
    .prepare("SELECT COALESCE(SUM(minutos), 0) AS total FROM registro_estudo WHERE usuario_id = ? AND data = ?")
    .bind(usuarioId, data)
    .first<{ total: number }>();
  return row?.total ?? 0;
}

export async function criarRegistroEstudo(
  db: D1Database,
  params: {
    usuarioId: number;
    materiaId: number | null;
    materiaNomeLivre: string | null;
    data: string;
    minutos: number;
    tipo: string;
    observacao: string | null;
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO registro_estudo (usuario_id, materia_id, materia_nome_livre, data, minutos, tipo, observacao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      params.usuarioId,
      params.materiaId,
      params.materiaNomeLivre,
      params.data,
      params.minutos,
      params.tipo,
      params.observacao
    )
    .run();
}

export async function listRegistrosRecentes(db: D1Database, usuarioId: number, limite: number): Promise<RegistroEstudo[]> {
  const { results } = await db
    .prepare(
      `SELECT re.*, m.nome AS materia_nome
       FROM registro_estudo re
       LEFT JOIN materia m ON m.id = re.materia_id
       WHERE re.usuario_id = ?
       ORDER BY re.data DESC, re.criado_em DESC
       LIMIT ?`
    )
    .bind(usuarioId, limite)
    .all<RegistroEstudo>();
  return results;
}

export async function totalQuestoes(db: D1Database, usuarioId: number): Promise<number> {
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM registro_estudo WHERE usuario_id = ? AND tipo = 'Questões'")
    .bind(usuarioId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}
