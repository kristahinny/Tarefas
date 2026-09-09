export const LoginView = () => (
  <div class="login-wrap">
    <div class="login-logo">
      <div class="kicker">Foco · Constância · Aprovação</div>
      <h1>
        Meu Plano
        <br />
        TCE-GO
      </h1>
    </div>

    <form method="post" action="/login">
      <div class="form-group">
        <label>E-mail</label>
        <input class="form-control" type="email" name="email" placeholder="voce@email.com" required autofocus />
      </div>
      <div class="form-group">
        <label>Senha</label>
        <input class="form-control" type="password" name="senha" placeholder="••••••••" required />
      </div>
      <div class="btn-block-wrap" style="margin-top:24px;">
        <button class="btn btn-primary" type="submit">
          ENTRAR
        </button>
      </div>
    </form>
  </div>
);
