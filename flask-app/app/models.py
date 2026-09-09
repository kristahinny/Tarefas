from datetime import datetime

from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from app import db

# Segunda = 0 ... Domingo = 6
DIAS_SEMANA = [
    "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"
]
DIAS_SEMANA_ABREV = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

TIPOS_ESTUDO = ["Teoria", "Questões", "Revisão", "Anki", "Redação"]


class Usuario(UserMixin, db.Model):
    __tablename__ = "usuario"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(160), unique=True, nullable=False)
    senha_hash = db.Column(db.String(255), nullable=False)
    meta_semanal_minutos = db.Column(db.Integer, default=810)  # 13h30

    materias = db.relationship("Materia", backref="usuario", lazy=True, cascade="all, delete-orphan")
    registros = db.relationship("RegistroEstudo", backref="usuario", lazy=True, cascade="all, delete-orphan")
    checklist = db.relationship("ChecklistDiario", backref="usuario", lazy=True, cascade="all, delete-orphan")

    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)

    def check_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)


class Materia(db.Model):
    __tablename__ = "materia"

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(120), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)

    registros = db.relationship("RegistroEstudo", backref="materia", lazy=True)


class RegistroEstudo(db.Model):
    __tablename__ = "registro_estudo"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    materia_id = db.Column(db.Integer, db.ForeignKey("materia.id"), nullable=True)
    materia_nome_livre = db.Column(db.String(120), nullable=True)
    data = db.Column(db.Date, nullable=False)
    minutos = db.Column(db.Integer, nullable=False)
    tipo = db.Column(db.String(30), nullable=False)
    observacao = db.Column(db.String(300), nullable=True)
    criado_em = db.Column(db.DateTime, default=datetime.utcnow)

    @property
    def materia_display(self):
        if self.materia:
            return self.materia.nome
        return self.materia_nome_livre or "Matéria"


class ChecklistDiario(db.Model):
    __tablename__ = "checklist_diario"

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey("usuario.id"), nullable=False)
    data = db.Column(db.Date, nullable=False)
    atividade = db.Column(db.String(120), nullable=False)
    tipo = db.Column(db.String(30), nullable=False, default="geral")
    ordem = db.Column(db.Integer, default=0)
    concluido = db.Column(db.Boolean, default=False)

    __table_args__ = (
        db.UniqueConstraint("usuario_id", "data", "atividade", name="uq_checklist_usuario_data_atividade"),
    )


class Rotina(db.Model):
    __tablename__ = "rotina"

    id = db.Column(db.Integer, primary_key=True)
    dia_semana = db.Column(db.Integer, nullable=False)  # 0=Segunda ... 6=Domingo
    horario_inicio = db.Column(db.String(5), nullable=True)  # "HH:MM"
    horario_fim = db.Column(db.String(5), nullable=True)
    atividade = db.Column(db.String(160), nullable=False)
    tipo = db.Column(db.String(30), nullable=False)  # acordar, personal, estudo, trabalho, almoco, descanso
    duracao_minutos = db.Column(db.Integer, nullable=True)  # usado quando não há horário fixo (fim de semana)
    icone = db.Column(db.String(10), nullable=True)
    ordem = db.Column(db.Integer, default=0)

    @property
    def duracao(self):
        if self.duracao_minutos:
            return self.duracao_minutos
        if self.horario_inicio and self.horario_fim:
            h1, m1 = map(int, self.horario_inicio.split(":"))
            h2, m2 = map(int, self.horario_fim.split(":"))
            return (h2 * 60 + m2) - (h1 * 60 + m1)
        return 0

    @property
    def horario_label(self):
        if self.horario_inicio and self.horario_fim:
            return f"{self.horario_inicio} → {self.horario_fim}"
        if self.horario_inicio:
            return self.horario_inicio
        return ""
