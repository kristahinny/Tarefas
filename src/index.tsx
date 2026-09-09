import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Context } from "hono";
import { Layout } from "./views/layout";
import { LoginView } from "./views/login";
import { HojeView } from "./views/hoje";
import { SemanaView } from "./views/semana";
import { HistoricoView } from "./views/historico";
import { MateriasView } from "./views/materias";
import { PerfilView } from "./views/perfil";
import { RegistrarView } from "./views/registrar";
import * as db from "./db";
import type { Usuario, RegistroEstudo } from "./db";
import * as svc from "./services";
import { checkSenha, criarSessionCookie, lerSessionCookie } from "./auth";
import { setFlash, consumeFlash } from "./flash";

type Bindings = {
  DB: D1Database;
  SESSION_SECRET: string;
};

type Variables = {
  usuario: Usuario;
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

const SESSION_COOKIE = "session";

async function getUsuarioAtual(c: Context<{ Bindings: Bindings; Variables: Variables }>): Promise<Usuario | null> {
  const valor = getCookie(c, SESSION_COOKIE);
  const userId = await lerSessionCookie(valor, c.env.SESSION_SECRET);
  if (!userId) return null;
  return db.getUsuarioById(c.env.DB, userId);
}

const requireAuth = async (c: Context<{ Bindings: Bindings; Variables: Variables }>, next: () => Promise<void>) => {
  const usuario = await getUsuarioAtual(c);
  if (!usuario) {
    return c.redirect("/login");
  }
  c.set("usuario", usuario);
  await next();
};

// ---------- AUTH ----------

app.get("/login", async (c) => {
  const usuario = await getUsuarioAtual(c);
  if (usuario) return c.redirect("/");
  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Entrar · Meu Plano TCE-GO" authenticated={false} flash={flash}>
      <LoginView />
    </Layout>
  );
});

app.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email ?? "").trim().toLowerCase();
  const senha = String(body.senha ?? "");

  const usuario = await db.getUsuarioByEmail(c.env.DB, email);
  if (usuario && (await checkSenha(senha, usuario.senha_hash))) {
    const cookieVal = await criarSessionCookie(usuario.id, c.env.SESSION_SECRET);
    setCookie(c, SESSION_COOKIE, cookieVal, {
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: new URL(c.req.url).protocol === "https:",
      maxAge: 60 * 60 * 24 * 30,
    });
    return c.redirect("/");
  }

  setFlash(c, "error", "E-mail ou senha inválidos.");
  return c.redirect("/login");
});

app.get("/logout", async (c) => {
  deleteCookie(c, SESSION_COOKIE, { path: "/" });
  return c.redirect("/login");
});

// ---------- MAIN ----------

app.get("/", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const hoje = svc.hojeISO();
  await svc.garantirChecklistDoDia(c.env.DB, usuario.id, hoje);

  const itens = await db.listChecklistDoDia(c.env.DB, usuario.id, hoje);
  const diaSemana = svc.diaSemanaDe(hoje);
  const rotinasHojeList = await db.listRotinaPorDia(c.env.DB, diaSemana);
  const rotinasHoje = new Map(rotinasHojeList.map((r) => [r.atividade, r]));

  const { concluidos, total, pct } = await svc.progressoDia(c.env.DB, usuario.id, hoje);
  const metaMin = await svc.metaMinutosDia(c.env.DB, diaSemana);
  const estudadoMin = await db.minutosEstudadosNoDia(c.env.DB, usuario.id, hoje);
  const itemEstudo = itens.find((i) => i.tipo === "estudo") ?? null;
  void estudadoMin;

  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Hoje · Meu Plano TCE-GO" authenticated activeNav="hoje" flash={flash}>
      <HojeView
        primeiroNome={usuario.nome.split(" ")[0]}
        nomeDia={svc.NOME_DIA_PT[diaSemana]}
        metaLabel={metaMin ? svc.fmtMinutos(metaMin) : "Descanso"}
        metaMin={metaMin}
        itens={itens}
        rotinasHoje={rotinasHoje}
        pct={pct}
        concluidos={concluidos}
        total={total}
        itemEstudo={itemEstudo}
      />
    </Layout>
  );
});

app.post("/checklist/:id/toggle", async (c) => {
  const usuario = await getUsuarioAtual(c);
  if (!usuario) return c.json({ ok: false }, 401);

  const id = parseInt(c.req.param("id"), 10);
  const item = await db.getChecklistItem(c.env.DB, id, usuario.id);
  if (!item) return c.json({ ok: false }, 404);

  const novoConcluido = !item.concluido;
  await db.setChecklistConcluido(c.env.DB, id, novoConcluido);

  const { concluidos, total, pct } = await svc.progressoDia(c.env.DB, usuario.id, item.data);
  return c.json({ ok: true, concluido: novoConcluido, pct, concluidos, total });
});

app.get("/semana", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const resumo = await svc.resumoSemana(c.env.DB, usuario.id, svc.hojeISO());
  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Minha Semana · Meu Plano TCE-GO" authenticated activeNav="semana" flash={flash}>
      <SemanaView resumo={resumo} />
    </Layout>
  );
});

app.get("/historico", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const registros = await db.listRegistrosRecentes(c.env.DB, usuario.id, 60);
  const hoje = svc.hojeISO();
  const ontem = svc.somaDias(hoje, -1);

  const gruposMap = new Map<string, RegistroEstudo[]>();
  for (const r of registros) {
    let chave: string;
    if (r.data === hoje) chave = "Hoje";
    else if (r.data === ontem) chave = "Ontem";
    else chave = svc.formatarDataBR(r.data);
    if (!gruposMap.has(chave)) gruposMap.set(chave, []);
    gruposMap.get(chave)!.push(r);
  }
  const grupos = Array.from(gruposMap.entries()).map(([chave, regs]) => ({ chave, registros: regs }));

  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Histórico · Meu Plano TCE-GO" authenticated flash={flash}>
      <HistoricoView grupos={grupos} />
    </Layout>
  );
});

app.get("/perfil", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const hoje = svc.hojeISO();
  const resumo = await svc.resumoSemana(c.env.DB, usuario.id, hoje);
  const seq = await svc.sequenciaDias(c.env.DB, usuario.id);
  const questoes = await db.totalQuestoes(c.env.DB, usuario.id);
  const estudadoHoje = await db.minutosEstudadosNoDia(c.env.DB, usuario.id, hoje);
  const metaHoje = await svc.metaMinutosDia(c.env.DB, svc.diaSemanaDe(hoje));

  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Perfil · Meu Plano TCE-GO" authenticated activeNav="perfil" flash={flash}>
      <PerfilView usuario={usuario} resumo={resumo} seq={seq} questoes={questoes} estudadoHoje={estudadoHoje} metaHoje={metaHoje} />
    </Layout>
  );
});

// ---------- MATERIAS ----------

app.get("/materias", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const materias = await db.listMaterias(c.env.DB, usuario.id);
  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Matérias · Meu Plano TCE-GO" authenticated activeNav="materias" flash={flash}>
      <MateriasView materias={materias} />
    </Layout>
  );
});

app.post("/materias/nova", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const body = await c.req.parseBody();
  const nome = String(body.nome ?? "").trim();
  if (nome) {
    await db.criarMateria(c.env.DB, usuario.id, nome);
    setFlash(c, "success", "Matéria adicionada.");
  }
  return c.redirect("/materias");
});

app.post("/materias/:id/editar", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const materiaId = parseInt(c.req.param("id")!, 10);
  const body = await c.req.parseBody();
  const nome = String(body.nome ?? "").trim();
  const materia = await db.getMateria(c.env.DB, materiaId, usuario.id);
  if (materia && nome) {
    await db.editarMateria(c.env.DB, materiaId, usuario.id, nome);
  }
  return c.redirect("/materias");
});

app.post("/materias/:id/excluir", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const materiaId = parseInt(c.req.param("id")!, 10);
  const materia = await db.getMateria(c.env.DB, materiaId, usuario.id);
  if (materia) {
    await db.excluirMateria(c.env.DB, materiaId, usuario.id);
    setFlash(c, "success", "Matéria removida.");
  }
  return c.redirect("/materias");
});

// ---------- ESTUDO ----------

app.get("/registrar", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const materias = await db.listMaterias(c.env.DB, usuario.id);
  const flash = consumeFlash(c);
  return c.html(
    <Layout title="Registrar Estudo · Meu Plano TCE-GO" authenticated flash={flash}>
      <RegistrarView materias={materias} tipos={svc.TIPOS_ESTUDO} hojeISO={svc.hojeISO()} />
    </Layout>
  );
});

app.post("/registrar", requireAuth, async (c) => {
  const usuario = c.get("usuario");
  const body = await c.req.parseBody();
  const materiaIdRaw = String(body.materia_id ?? "").trim();
  const materiaNomeLivre = String(body.materia_nome_livre ?? "").trim();
  const tempoTexto = String(body.tempo ?? "");
  const tipo = String(body.tipo ?? svc.TIPOS_ESTUDO[0]);
  const observacao = String(body.observacao ?? "").trim();
  const dataTexto = String(body.data ?? "") || svc.hojeISO();

  const minutos = svc.parseTempo(tempoTexto);

  if (minutos <= 0) {
    const materias = await db.listMaterias(c.env.DB, usuario.id);
    const flash = [{ category: "error", message: "Informe um tempo de estudo válido (ex: 1h30)." }];
    return c.html(
      <Layout title="Registrar Estudo · Meu Plano TCE-GO" authenticated flash={flash}>
        <RegistrarView materias={materias} tipos={svc.TIPOS_ESTUDO} hojeISO={svc.hojeISO()} />
      </Layout>
    );
  }

  const materiaId = materiaIdRaw ? parseInt(materiaIdRaw, 10) : null;

  await db.criarRegistroEstudo(c.env.DB, {
    usuarioId: usuario.id,
    materiaId,
    materiaNomeLivre: materiaId ? null : materiaNomeLivre || null,
    data: dataTexto,
    minutos,
    tipo,
    observacao: observacao || null,
  });

  await svc.garantirChecklistDoDia(c.env.DB, usuario.id, dataTexto);
  const meta = await svc.metaMinutosDia(c.env.DB, svc.diaSemanaDe(dataTexto));
  const estudado = await db.minutosEstudadosNoDia(c.env.DB, usuario.id, dataTexto);
  if (meta && estudado >= meta) {
    await db.marcarChecklistEstudoConcluido(c.env.DB, usuario.id, dataTexto);
  }

  setFlash(c, "success", "Estudo registrado com sucesso!");
  return c.redirect("/");
});

export default app;
