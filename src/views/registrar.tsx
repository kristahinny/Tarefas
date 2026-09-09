import type { Materia } from "../db";

type Props = {
  materias: Materia[];
  tipos: string[];
  hojeISO: string;
};

export const RegistrarView = ({ materias, tipos, hojeISO }: Props) => (
  <>
    <div class="topbar">
      <p class="greeting">Novo registro</p>
      <h1 class="day-title">Registrar Estudo</h1>
    </div>

    <form method="post" action="/registrar">
      <div class="form-group">
        <label>Matéria</label>
        <select class="form-control" name="materia_id" id="select-materia">
          <option value="">— selecionar —</option>
          {materias.map((m) => (
            <option value={m.id}>{m.nome}</option>
          ))}
          <option value="">Outra (digitar abaixo)</option>
        </select>
      </div>

      <div class="form-group">
        <label>Ou digite a matéria</label>
        <input class="form-control" type="text" name="materia_nome_livre" placeholder="Ex: Direito Administrativo" />
      </div>

      <div class="form-group">
        <label>Tempo estudado</label>
        <input class="form-control" type="text" name="tempo" placeholder="Ex: 1h30" required />
      </div>

      <div class="form-group">
        <label>Tipo</label>
        <div class="type-pills">
          {tipos.map((t, i) => (
            <label class={`type-pill ${i === 0 ? "selected" : ""}`}>
              <input type="radio" name="tipo" value={t} checked={i === 0} />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div class="form-group">
        <label>Observação (opcional)</label>
        <input class="form-control" type="text" name="observacao" placeholder="Ex: revisei os erros da semana" />
      </div>

      <input type="hidden" name="data" value={hojeISO} />

      <div class="btn-block-wrap">
        <button class="btn btn-primary" type="submit">
          SALVAR
        </button>
      </div>
    </form>
  </>
);
