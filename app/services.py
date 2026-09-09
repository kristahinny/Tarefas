from datetime import date, timedelta

from app import db
from app.models import ChecklistDiario, Rotina, RegistroEstudo, DIAS_SEMANA, DIAS_SEMANA_ABREV


def meta_minutos_dia(dia_semana):
    """Soma a duração de todos os blocos de tipo 'estudo' de um dia da semana (0=Segunda)."""
    total = 0
    for r in Rotina.query.filter_by(dia_semana=dia_semana, tipo="estudo").all():
        total += r.duracao
    return total


def meta_semanal_minutos():
    return sum(meta_minutos_dia(d) for d in range(7))


def garantir_checklist_do_dia(usuario_id, data_ref):
    """Cria (se ainda não existirem) os itens de checklist do dia a partir da Rotina."""
    dia_semana = data_ref.weekday()  # 0=Segunda ... 6=Domingo
    existentes = ChecklistDiario.query.filter_by(usuario_id=usuario_id, data=data_ref).count()
    if existentes > 0:
        return

    rotinas = Rotina.query.filter_by(dia_semana=dia_semana).order_by(Rotina.ordem).all()
    for r in rotinas:
        item = ChecklistDiario(
            usuario_id=usuario_id,
            data=data_ref,
            atividade=r.atividade,
            tipo=r.tipo,
            ordem=r.ordem,
            concluido=False,
        )
        db.session.add(item)
    db.session.commit()


def progresso_dia(usuario_id, data_ref):
    itens = ChecklistDiario.query.filter_by(usuario_id=usuario_id, data=data_ref).all()
    total = len(itens)
    concluidos = sum(1 for i in itens if i.concluido)
    pct = int(round((concluidos / total) * 100)) if total else 0
    return concluidos, total, pct


def minutos_estudados_no_dia(usuario_id, data_ref):
    registros = RegistroEstudo.query.filter_by(usuario_id=usuario_id, data=data_ref).all()
    return sum(r.minutos for r in registros)


def inicio_da_semana(data_ref):
    """Retorna a segunda-feira da semana de data_ref."""
    return data_ref - timedelta(days=data_ref.weekday())


def resumo_semana(usuario_id, data_ref):
    seg = inicio_da_semana(data_ref)
    dias = []
    total_estudado = 0
    total_meta = 0
    for i in range(7):
        d = seg + timedelta(days=i)
        meta = meta_minutos_dia(i)
        estudado = minutos_estudados_no_dia(usuario_id, d)
        concluido = estudado >= meta and meta > 0
        dias.append({
            "data": d,
            "nome": DIAS_SEMANA[i],
            "abrev": DIAS_SEMANA_ABREV[i],
            "meta_minutos": meta,
            "estudado_minutos": estudado,
            "concluido": concluido,
            "eh_hoje": d == date.today(),
        })
        total_estudado += estudado
        total_meta += meta
    pct = int(round((total_estudado / total_meta) * 100)) if total_meta else 0
    return {
        "dias": dias,
        "total_estudado": total_estudado,
        "total_meta": total_meta,
        "pct": min(pct, 100),
        "inicio": seg,
        "fim": seg + timedelta(days=6),
    }


def sequencia_dias(usuario_id):
    """Conta quantos dias seguidos (a partir de hoje, para trás) a meta de estudo foi batida."""
    dias = 0
    d = date.today()
    while True:
        meta = meta_minutos_dia(d.weekday())
        estudado = minutos_estudados_no_dia(usuario_id, d)
        if meta > 0 and estudado >= meta:
            dias += 1
            d = d - timedelta(days=1)
        else:
            break
    return dias


def total_questoes(usuario_id):
    registros = RegistroEstudo.query.filter_by(usuario_id=usuario_id, tipo="Questões").all()
    return len(registros)


def fmt_minutos(minutos):
    h = minutos // 60
    m = minutos % 60
    if h and m:
        return f"{h}h{m:02d}"
    if h:
        return f"{h}h"
    return f"{m}min"


NOME_DIA_PT = ["Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado", "Domingo"]
