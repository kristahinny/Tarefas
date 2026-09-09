from datetime import date, datetime

from flask import Blueprint, render_template, redirect, url_for, request, jsonify
from flask_login import login_required, current_user

from app import db
from app.models import ChecklistDiario, RegistroEstudo, Rotina, DIAS_SEMANA
from app.services import (
    garantir_checklist_do_dia,
    progresso_dia,
    minutos_estudados_no_dia,
    meta_minutos_dia,
    resumo_semana,
    sequencia_dias,
    total_questoes,
    fmt_minutos,
    NOME_DIA_PT,
)

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
@login_required
def hoje():
    hoje_data = date.today()
    garantir_checklist_do_dia(current_user.id, hoje_data)

    itens = ChecklistDiario.query.filter_by(
        usuario_id=current_user.id, data=hoje_data
    ).order_by(ChecklistDiario.ordem).all()

    rotinas_hoje = {
        r.atividade: r for r in Rotina.query.filter_by(dia_semana=hoje_data.weekday()).all()
    }

    concluidos, total, pct = progresso_dia(current_user.id, hoje_data)
    meta_min = meta_minutos_dia(hoje_data.weekday())
    estudado_min = minutos_estudados_no_dia(current_user.id, hoje_data)

    item_estudo = next((i for i in itens if i.tipo == "estudo"), None)

    return render_template(
        "hoje.html",
        itens=itens,
        rotinas_hoje=rotinas_hoje,
        pct=pct,
        concluidos=concluidos,
        total=total,
        meta_min=meta_min,
        estudado_min=estudado_min,
        meta_label=fmt_minutos(meta_min) if meta_min else "Descanso",
        estudado_label=fmt_minutos(estudado_min),
        nome_dia=NOME_DIA_PT[hoje_data.weekday()],
        item_estudo=item_estudo,
    )


@main_bp.route("/checklist/<int:item_id>/toggle", methods=["POST"])
@login_required
def toggle_checklist(item_id):
    item = ChecklistDiario.query.filter_by(id=item_id, usuario_id=current_user.id).first_or_404()
    item.concluido = not item.concluido
    db.session.commit()

    concluidos, total, pct = progresso_dia(current_user.id, item.data)
    return jsonify({"ok": True, "concluido": item.concluido, "pct": pct, "concluidos": concluidos, "total": total})


@main_bp.route("/semana")
@login_required
def semana():
    ref = date.today()
    resumo = resumo_semana(current_user.id, ref)
    return render_template("semana.html", resumo=resumo, fmt_minutos=fmt_minutos)


@main_bp.route("/historico")
@login_required
def historico():
    registros = RegistroEstudo.query.filter_by(usuario_id=current_user.id).order_by(
        RegistroEstudo.data.desc(), RegistroEstudo.criado_em.desc()
    ).limit(60).all()

    grupos = {}
    for r in registros:
        if r.data == date.today():
            chave = "Hoje"
        elif (date.today() - r.data).days == 1:
            chave = "Ontem"
        else:
            chave = r.data.strftime("%d/%m/%Y")
        grupos.setdefault(chave, []).append(r)

    return render_template("historico.html", grupos=grupos, fmt_minutos=fmt_minutos)


@main_bp.route("/perfil")
@login_required
def perfil():
    hoje_data = date.today()
    _, _, pct_dia = progresso_dia(current_user.id, hoje_data)
    resumo = resumo_semana(current_user.id, hoje_data)
    seq = sequencia_dias(current_user.id)
    questoes = total_questoes(current_user.id)
    estudado_hoje = minutos_estudados_no_dia(current_user.id, hoje_data)
    meta_hoje = meta_minutos_dia(hoje_data.weekday())

    return render_template(
        "perfil.html",
        resumo=resumo,
        seq=seq,
        questoes=questoes,
        estudado_hoje=estudado_hoje,
        meta_hoje=meta_hoje,
        fmt_minutos=fmt_minutos,
    )
