# Meu Plano TCE-GO

Aplicativo web pessoal, simples e mobile-first, para acompanhar a rotina de estudos do TCE-GO.

Reescrito em **TypeScript + Hono**, rodando em **Cloudflare Workers** com banco de dados **Cloudflare D1** (SQLite).
A versão original em Flask/Python está preservada em `flask-app/` (não é usada em produção — Cloudflare Workers não roda Flask).

## Estrutura do projeto

```
├── src/
│   ├── index.tsx        # rotas (Hono) — login, hoje, semana, histórico, matérias, registrar
│   ├── db.ts             # acesso ao D1 (equivalente aos models do Flask)
│   ├── services.ts       # regras de negócio (metas, progresso, sequência, datas)
│   ├── auth.ts            # hash de senha (PBKDF2) e cookie de sessão assinado (HMAC)
│   ├── flash.ts            # mensagens flash via cookie
│   └── views/               # componentes JSX (equivalente aos templates Jinja)
├── public/static/            # CSS e JS servidos como assets estáticos
├── migrations/
│   ├── 0001_schema.sql        # schema do banco D1
│   └── 0002_seed.sql           # usuário padrão + rotina + matérias
├── scripts/hash-password.mjs    # gera hash de senha compatível para o seed
└── wrangler.toml
```

## Primeira vez: configurar o Cloudflare

Você precisa estar logado na sua conta Cloudflare pelo terminal:

```bash
npx wrangler login
```

### 1. Criar o banco D1

```bash
npx wrangler d1 create plano-tce-go
```

Isso imprime um `database_id`. Copie e cole em `wrangler.toml`, substituindo `REPLACE_WITH_YOUR_D1_DATABASE_ID`.

### 2. Aplicar as migrações no banco remoto

```bash
npm run db:migrate:remote
npm run db:seed:remote
```

### 3. Configurar o segredo de sessão (produção)

```bash
npx wrangler secret put SESSION_SECRET
```

Cole uma string aleatória longa quando pedir (ex: gere com `openssl rand -base64 32`).

### 4. Deploy

```bash
npm install
npm run deploy
```

O Wrangler vai te dar a URL pública (`https://meu-plano-tce-go.<sua-conta>.workers.dev`).

## Instalar como app (PWA)

O site é um Progressive Web App — dá pra instalar no celular sem loja de aplicativos:

**Android (Chrome):** abra o link, toque no menu (⋮) e em "Instalar app" (ou "Adicionar à tela inicial"). Um banner de instalação também pode aparecer sozinho.

**iPhone (Safari):** abra o link, toque no ícone de compartilhar (□↑) e em "Adicionar à Tela de Início".

O app fica com ícone próprio, abre em tela cheia (sem barra do navegador) e funciona como um app instalado normalmente.

## Rodando localmente

```bash
npm install
npm run db:migrate:local
npm run db:seed:local
npm run dev
```

Crie um arquivo `.dev.vars` (não versionado) com:

```
SESSION_SECRET=qualquer-valor-para-desenvolvimento
```

Abra **http://localhost:8787**.

## Login inicial

```
E-mail: aluno@planotcego.com
Senha:  tcego2026
```

Para trocar a senha, gere um novo hash com `npm run hash-password -- "novasenha"` e atualize a coluna `senha_hash` do usuário via `wrangler d1 execute plano-tce-go --remote --command "..."`.

## O que já está pronto

1. Login simples (sem cadastro público), sessão via cookie assinado (HMAC)
2. Tela **Hoje** — rotina do dia + checklist + progresso + registrar estudo
3. Checklist diário com toque único (salva automaticamente via fetch)
4. Registrar estudo (matéria, tempo, tipo, observação)
5. **Minha Semana** — 7 dias + meta semanal (13h30)
6. **Matérias** — adicionar / editar / excluir
7. **Histórico** simples (Hoje / Ontem / datas)
8. Meta semanal calculada automaticamente a partir da rotina
9. Layout 100% mobile-first
10. Banco de dados Cloudflare D1 (SQLite na edge)

## Observações técnicas

- A `Rotina` é o "molde" semanal. Todo dia, ao abrir o app, os itens do checklist daquele dia são gerados automaticamente a partir desse molde.
- A meta de estudo do dia/semana é calculada a partir da duração dos blocos de estudo cadastrados na `Rotina`.
- Ao registrar um estudo, se o total do dia atingir a meta, o item "Estudo" do checklist é marcado como concluído automaticamente.
- Senhas usam PBKDF2-SHA256 (100.000 iterações) via Web Crypto API (compatível com o runtime de Workers).
- A sessão é um cookie `HttpOnly` com o id do usuário assinado por HMAC-SHA256 — não há tabela de sessões no banco.
