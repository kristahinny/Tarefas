from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user

from app import db
from app.models import Materia

materias_bp = Blueprint("materias", __name__)


@materias_bp.route("/materias")
@login_required
def listar():
    materias = Materia.query.filter_by(usuario_id=current_user.id).order_by(Materia.nome).all()
    return render_template("materias.html", materias=materias)


@materias_bp.route("/materias/nova", methods=["POST"])
@login_required
def nova():
    nome = request.form.get("nome", "").strip()
    if nome:
        db.session.add(Materia(nome=nome, usuario_id=current_user.id))
        db.session.commit()
        flash("Matéria adicionada.", "success")
    return redirect(url_for("materias.listar"))


@materias_bp.route("/materias/<int:materia_id>/editar", methods=["POST"])
@login_required
def editar(materia_id):
    materia = Materia.query.filter_by(id=materia_id, usuario_id=current_user.id).first_or_404()
    nome = request.form.get("nome", "").strip()
    if nome:
        materia.nome = nome
        db.session.commit()
    return redirect(url_for("materias.listar"))


@materias_bp.route("/materias/<int:materia_id>/excluir", methods=["POST"])
@login_required
def excluir(materia_id):
    materia = Materia.query.filter_by(id=materia_id, usuario_id=current_user.id).first_or_404()
    db.session.delete(materia)
    db.session.commit()
    flash("Matéria removida.", "success")
    return redirect(url_for("materias.listar"))
