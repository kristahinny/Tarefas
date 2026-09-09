-- Popula o banco com a rotina original, 1 usuário e matérias padrão.
-- E-mail: aluno@planotcego.com | Senha: tcego2026

INSERT INTO usuario (nome, email, senha_hash, meta_semanal_minutos)
VALUES ('Estudante', 'aluno@planotcego.com', 'pbkdf2$100000$Xcov0Nh1DeFe2UmMKlWaTg==$XrtN2xHlcnG1zBqtBWzUcEtBgkds8VcxvlI5qX8xGyg=', 810);

INSERT INTO materia (nome, usuario_id)
SELECT nome, (SELECT id FROM usuario WHERE email = 'aluno@planotcego.com')
FROM (
  SELECT 'Português' AS nome
  UNION ALL SELECT 'Direito Administrativo'
  UNION ALL SELECT 'Direito Constitucional'
  UNION ALL SELECT 'Controle Externo'
  UNION ALL SELECT 'AFO'
);

-- dia_semana: 0=Segunda 1=Terça 2=Quarta 3=Quinta 4=Sexta 5=Sábado 6=Domingo

-- SEGUNDA
INSERT INTO rotina (dia_semana, horario_inicio, horario_fim, atividade, tipo, ordem) VALUES
  (0, '04:30', NULL, 'Acordar', 'acordar', 1),
  (0, '04:40', '06:10', 'Estudo', 'estudo', 2),
  (0, '06:10', NULL, 'Trabalho', 'trabalho', 3),
  (0, NULL, NULL, 'Questões no almoço', 'almoco', 4);

-- TERÇA
INSERT INTO rotina (dia_semana, horario_inicio, horario_fim, atividade, tipo, ordem) VALUES
  (1, '06:15', '07:00', 'Personal', 'personal', 1),
  (1, NULL, NULL, 'Trabalho', 'trabalho', 2),
  (1, '20:00', '21:30', 'Estudo', 'estudo', 3),
  (1, NULL, NULL, 'Questões no almoço', 'almoco', 4);

-- QUARTA
INSERT INTO rotina (dia_semana, horario_inicio, horario_fim, atividade, tipo, ordem) VALUES
  (2, '04:30', NULL, 'Acordar', 'acordar', 1),
  (2, '04:40', '06:10', 'Estudo', 'estudo', 2),
  (2, '06:10', NULL, 'Trabalho', 'trabalho', 3),
  (2, NULL, NULL, 'Questões no almoço', 'almoco', 4);

-- QUINTA
INSERT INTO rotina (dia_semana, horario_inicio, horario_fim, atividade, tipo, ordem) VALUES
  (3, '06:15', '07:00', 'Personal', 'personal', 1),
  (3, NULL, NULL, 'Trabalho', 'trabalho', 2),
  (3, '20:00', '21:30', 'Estudo', 'estudo', 3),
  (3, NULL, NULL, 'Questões no almoço', 'almoco', 4);

-- SEXTA
INSERT INTO rotina (dia_semana, horario_inicio, horario_fim, atividade, tipo, ordem) VALUES
  (4, '04:30', NULL, 'Acordar', 'acordar', 1),
  (4, '04:40', '06:10', 'Estudo', 'estudo', 2),
  (4, '06:10', NULL, 'Trabalho', 'trabalho', 3),
  (4, NULL, NULL, 'Questões no almoço', 'almoco', 4);

-- SÁBADO — 3h de estudo
INSERT INTO rotina (dia_semana, duracao_minutos, atividade, tipo, ordem) VALUES
  (5, 180, 'Estudo (teoria, questões, revisão, anki)', 'estudo', 1);

-- DOMINGO — 3h de estudo
INSERT INTO rotina (dia_semana, duracao_minutos, atividade, tipo, ordem) VALUES
  (6, 180, 'Estudo (revisão da semana, questões, anki, redação)', 'estudo', 1);
