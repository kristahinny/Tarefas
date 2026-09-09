"""
Cria o banco de dados e popula com:
- 1 usuário inicial
- a rotina semanal original (Meu Plano TCE-GO)
- matérias padrão

Rode com:  python seed.py
"""
from app import create_app, db
from app.models import Usuario, Materia, Rotina

app = create_app()

EMAIL_PADRAO = "aluno@planotcego.com"
SENHA_PADRAO = "tcego2026"

MATERIAS_PADRAO = [
    "Português",
    "Direito Administrativo",
    "Direito Constitucional",
    "Controle Externo",
    "AFO",
]

# dia_semana: 0=Segunda 1=Terça 2=Quarta 3=Quinta 4=Sexta 5=Sábado 6=Domingo
ROTINA_PADRAO = [
    # SEGUNDA
    dict(dia_semana=0, horario_inicio="04:30", horario_fim=None, atividade="Acordar", tipo="acordar", ordem=1),
    dict(dia_semana=0, horario_inicio="04:40", horario_fim="06:10", atividade="Estudo", tipo="estudo", ordem=2),
    dict(dia_semana=0, horario_inicio="06:10", horario_fim=None, atividade="Trabalho", tipo="trabalho", ordem=3),
    dict(dia_semana=0, horario_inicio=None, horario_fim=None, atividade="Questões no almoço", tipo="almoco", ordem=4),

    # TERÇA
    dict(dia_semana=1, horario_inicio="06:15", horario_fim="07:00", atividade="Personal", tipo="personal", ordem=1),
    dict(dia_semana=1, horario_inicio=None, horario_fim=None, atividade="Trabalho", tipo="trabalho", ordem=2),
    dict(dia_semana=1, horario_inicio="20:00", horario_fim="21:30", atividade="Estudo", tipo="estudo", ordem=3),
    dict(dia_semana=1, horario_inicio=None, horario_fim=None, atividade="Questões no almoço", tipo="almoco", ordem=4),

    # QUARTA
    dict(dia_semana=2, horario_inicio="04:30", horario_fim=None, atividade="Acordar", tipo="acordar", ordem=1),
    dict(dia_semana=2, horario_inicio="04:40", horario_fim="06:10", atividade="Estudo", tipo="estudo", ordem=2),
    dict(dia_semana=2, horario_inicio="06:10", horario_fim=None, atividade="Trabalho", tipo="trabalho", ordem=3),
    dict(dia_semana=2, horario_inicio=None, horario_fim=None, atividade="Questões no almoço", tipo="almoco", ordem=4),

    # QUINTA
    dict(dia_semana=3, horario_inicio="06:15", horario_fim="07:00", atividade="Personal", tipo="personal", ordem=1),
    dict(dia_semana=3, horario_inicio=None, horario_fim=None, atividade="Trabalho", tipo="trabalho", ordem=2),
    dict(dia_semana=3, horario_inicio="20:00", horario_fim="21:30", atividade="Estudo", tipo="estudo", ordem=3),
    dict(dia_semana=3, horario_inicio=None, horario_fim=None, atividade="Questões no almoço", tipo="almoco", ordem=4),

    # SEXTA
    dict(dia_semana=4, horario_inicio="04:30", horario_fim=None, atividade="Acordar", tipo="acordar", ordem=1),
    dict(dia_semana=4, horario_inicio="04:40", horario_fim="06:10", atividade="Estudo", tipo="estudo", ordem=2),
    dict(dia_semana=4, horario_inicio="06:10", horario_fim=None, atividade="Trabalho", tipo="trabalho", ordem=3),
    dict(dia_semana=4, horario_inicio=None, horario_fim=None, atividade="Questões no almoço", tipo="almoco", ordem=4),

    # SÁBADO — 3h de estudo (teoria, questões, revisão, anki)
    dict(dia_semana=5, horario_inicio=None, horario_fim=None, duracao_minutos=180,
         atividade="Estudo (teoria, questões, revisão, anki)", tipo="estudo", ordem=1),

    # DOMINGO — 3h de estudo (revisão da semana, questões, anki, redação)
    dict(dia_semana=6, horario_inicio=None, horario_fim=None, duracao_minutos=180,
         atividade="Estudo (revisão da semana, questões, anki, redação)", tipo="estudo", ordem=1),
]


def seed():
    with app.app_context():
        db.create_all()

        if not Rotina.query.first():
            for r in ROTINA_PADRAO:
                db.session.add(Rotina(**r))
            db.session.commit()
            print(f"✔ Rotina padrão criada ({len(ROTINA_PADRAO)} atividades).")
        else:
            print("• Rotina já existia — nada foi alterado.")

        usuario = Usuario.query.filter_by(email=EMAIL_PADRAO).first()
        if not usuario:
            usuario = Usuario(nome="Estudante", email=EMAIL_PADRAO)
            usuario.set_senha(SENHA_PADRAO)
            db.session.add(usuario)
            db.session.commit()
            print(f"✔ Usuário criado -> e-mail: {EMAIL_PADRAO} | senha: {SENHA_PADRAO}")
        else:
            print("• Usuário padrão já existia — nada foi alterado.")

        if not Materia.query.filter_by(usuario_id=usuario.id).first():
            for nome in MATERIAS_PADRAO:
                db.session.add(Materia(nome=nome, usuario_id=usuario.id))
            db.session.commit()
            print(f"✔ {len(MATERIAS_PADRAO)} matérias padrão criadas.")
        else:
            print("• Matérias já existiam — nada foi alterado.")

        print("\nBanco de dados pronto! Rode 'python run.py' para iniciar o sistema.")


if __name__ == "__main__":
    seed()
