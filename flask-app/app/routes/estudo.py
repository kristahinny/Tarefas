from datetime import date

from flask import Blueprint, render_template, redirect, url_for, request, flash
from flask_login import login_required, current_user

from app import db
from app.models import Materia, RegistroEstudo, ChecklistDiario, TIPOS_ESTUDO
from app.services import garantir_checklist_do_dia, meta_minutos_dia, minutos_estudados_no_dia

estudo_bp = Blueprint("estudo", __name__)


def _parse_tempo(texto):
    """Converte '1h30', '1:30', '90', '1h' em minutos."""
    texto = (texto or "").strip().lower().replace(" ", "")
    if not texto:
        return 0
    if "h" in texto:
        partes = texto.split("h")
        horas = int(partes[0]) if partes[0] else 0
        minutos = int(partes[1]) if len(partes) > 1 and partes[1] else 0
        return horas * 60 + minutos
    if ":" in texto:
        h, m = texto.split(":")
        return int(h) * 60 + int(m)
    return int(texto)


@estudo_bp.route("/registrar", methods=["GET", "POST"])
@login_required
def registrar():
    materias = Materia.query.filter_by(usuario_id=current_user.id).order_by(Materia.nome).all()

    if request.method == "POST":
        materia_id = request.form.get("materia_id") or None
        materia_nome_livre = request.form.get("materia_nome_livre", "").strip()
        tempo_texto = request.form.get("tempo", "")
        tipo = request.form.get("tipo", TIPOS_ESTUDO[0])
        observacao = request.form.get("observacao", "").strip()
        data_texto = request.form.get("data") or date.today().isoformat()

        try:
            minutos = _parse_tempo(tempo_texto)
        except ValueError:
            minutos = 0

        if minutos <= 0:
            flash("Informe um tempo de estudo válido (ex: 1h30).", "error")
            return render_template("registrar.html", materias=materias, tipos=TIPOS_ESTUDO)

        data_ref = date.fromisoformat(data_texto)

        registro = RegistroEstudo(
            usuario_id=current_user.id,
            materia_id=int(materia_id) if materia_id else None,
            materia_nome_livre=materia_nome_livre if not materia_id else None,
            data=data_ref,
            minutos=minutos,
            tipo=tipo,
            observacao=observacao or None,
        )
        db.session.add(registro)
        db.session.commit()

        # marca automaticamente o item "Estudo" do checklist se a meta do dia foi batida
        garantir_checklist_do_dia(current_user.id, data_ref)
        meta = meta_minutos_dia(data_ref.weekday())
        se_estudou = minutos_estudados_no_dia(current_user.id, data_ref)
        if meta and se_estudou >= meta:
            item = ChecklistDiario.query.filter_by(
                usuario_id=current_user.id, data=data_ref, tipo="estudo"
            ).first()
            if item:
                item.concluido = True
                db.session.commit()

        flash("Estudo registrado com sucesso!", "success")
        return redirect(url_for("main.hoje"))

    return render_template("registrar.html", materias=materias, tipos=TIPOS_ESTUDO)
