CREATE TABLE usuario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  meta_semanal_minutos INTEGER DEFAULT 810
);

CREATE TABLE materia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE
);

CREATE TABLE registro_estudo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  materia_id INTEGER REFERENCES materia(id) ON DELETE SET NULL,
  materia_nome_livre TEXT,
  data TEXT NOT NULL,
  minutos INTEGER NOT NULL,
  tipo TEXT NOT NULL,
  observacao TEXT,
  criado_em TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE checklist_diario (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  data TEXT NOT NULL,
  atividade TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'geral',
  ordem INTEGER DEFAULT 0,
  concluido INTEGER NOT NULL DEFAULT 0,
  UNIQUE (usuario_id, data, atividade)
);

CREATE TABLE rotina (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dia_semana INTEGER NOT NULL,
  horario_inicio TEXT,
  horario_fim TEXT,
  atividade TEXT NOT NULL,
  tipo TEXT NOT NULL,
  duracao_minutos INTEGER,
  icone TEXT,
  ordem INTEGER DEFAULT 0
);

CREATE INDEX idx_registro_usuario_data ON registro_estudo(usuario_id, data);
CREATE INDEX idx_checklist_usuario_data ON checklist_diario(usuario_id, data);
CREATE INDEX idx_rotina_dia ON rotina(dia_semana);
