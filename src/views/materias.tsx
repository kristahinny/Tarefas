import type { Materia } from "../db";

export const MateriasView = ({ materias }: { materias: Materia[] }) => (
  <>
    <div class="topbar">
      <p class="greeting">Organize seus estudos</p>
      <h1 class="day-title">Matérias</h1>
    </div>

    <form class="add-form" method="post" action="/materias/nova">
      <input type="text" name="nome" placeholder="Nova matéria..." required />
      <button type="submit">+</button>
    </form>

    {materias.length > 0 ? (
      materias.map((m) => (
        <div class="materia-row">
          <span class="nome">{m.nome}</span>
          <div class="acoes">
            <button class="icon-btn" title="Editar" onclick={`editarMateria(${m.id}, '${m.nome.replace(/'/g, "\\'")}')`}>
              ✏️
            </button>
            <form method="post" action={`/materias/${m.id}/excluir`} style="display:inline;" onsubmit="return confirm('Excluir esta matéria?');">
              <button class="icon-btn danger" type="submit" title="Excluir">
                🗑️
              </button>
            </form>
          </div>
        </div>
      ))
    ) : (
      <div class="empty-state">
        <div class="emoji">📚</div>
        Nenhuma matéria cadastrada ainda.
      </div>
    )}

    <form id="form-editar" method="post" style="display:none;">
      <input type="text" id="input-editar-nome" name="nome" />
    </form>

    <script
      dangerouslySetInnerHTML={{
        __html: `
      function editarMateria(id, nomeAtual) {
        const novoNome = prompt("Editar matéria:", nomeAtual);
        if (novoNome && novoNome.trim() !== "") {
          const form = document.getElementById("form-editar");
          form.action = \`/materias/\${id}/editar\`;
          document.getElementById("input-editar-nome").value = novoNome.trim();
          form.submit();
        }
      }
    `,
      }}
    ></script>
  </>
);
