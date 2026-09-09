-- Torna a rotina (metas/horários semanais) específica de cada usuário,
-- em vez de compartilhada globalmente entre todos.

CREATE TABLE rotina_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL,
  horario_inicio TEXT,
  horario_fim TEXT,
  atividade TEXT NOT NULL,
  tipo TEXT NOT NULL,
  duracao_minutos INTEGER,
  icone TEXT,
  ordem INTEGER DEFAULT 0
);

-- a rotina existente (criada antes desta migração) pertencia globalmente
-- ao usuário padrão "aluno@planotcego.com"
INSERT INTO rotina_new (id, usuario_id, dia_semana, horario_inicio, horario_fim, atividade, tipo, duracao_minutos, icone, ordem)
SELECT id, (SELECT id FROM usuario WHERE email = 'aluno@planotcego.com'),
       dia_semana, horario_inicio, horario_fim, atividade, tipo, duracao_minutos, icone, ordem
FROM rotina;

DROP TABLE rotina;
ALTER TABLE rotina_new RENAME TO rotina;

CREATE INDEX idx_rotina_usuario_dia ON rotina(usuario_id, dia_semana);

-- demais usuários que ainda não tinham rotina própria recebem uma cópia
-- da rotina do "aluno" como ponto de partida
INSERT INTO rotina (usuario_id, dia_semana, horario_inicio, horario_fim, atividade, tipo, duracao_minutos, icone, ordem)
SELECT u.id, r.dia_semana, r.horario_inicio, r.horario_fim, r.atividade, r.tipo, r.duracao_minutos, r.icone, r.ordem
FROM usuario u
CROSS JOIN rotina r
WHERE r.usuario_id = (SELECT id FROM usuario WHERE email = 'aluno@planotcego.com')
  AND u.email <> 'aluno@planotcego.com'
  AND NOT EXISTS (SELECT 1 FROM rotina WHERE usuario_id = u.id);
