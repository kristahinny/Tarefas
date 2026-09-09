# Meu Plano TCE-GO

Aplicativo web pessoal, simples e mobile-first, para acompanhar a rotina de estudos do TCE-GO.

## Como rodar

```bash
# 1. Criar e ativar um ambiente virtual (recomendado)
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Instalar as dependências
pip install -r requirements.txt

# 3. Criar o banco de dados e popular com a rotina original
python seed.py

# 4. Rodar o servidor
python run.py
```

Depois é só abrir **http://localhost:5000** no navegador (de preferência no celular, na mesma rede Wi-Fi, usando o IP do computador, ex: `http://192.168.0.10:5000`).

## Login inicial

```
E-mail: aluno@planotcego.com
Senha:  tcego2026
```

> Recomendo trocar a senha depois — por enquanto, para trocar, edite diretamente pelo `flask shell` ou apague o banco (`instance/plano.db`) e ajuste `seed.py`.

## Estrutura do projeto

```
plano-tce-go/
├── app/
│   ├── __init__.py        # cria e configura o app (application factory)
│   ├── models.py          # Usuario, Materia, RegistroEstudo, ChecklistDiario, Rotina
│   ├── services.py        # regras de negócio (metas, progresso, sequência etc.)
│   ├── routes/
│   │   ├── auth.py        # login / logout
│   │   ├── main.py        # Hoje, Semana, Histórico, Perfil, toggle de checklist
│   │   ├── materias.py    # CRUD de matérias
│   │   └── estudo.py      # registrar sessão de estudo
│   ├── templates/         # HTML (Jinja2)
│   └── static/
│       ├── css/style.css  # identidade visual (navy, dourado, terracota, verde-água)
│       └── js/app.js      # toggle de checklist via fetch (sem reload)
├── instance/
│   └── plano.db           # criado automaticamente pelo seed.py
├── config.py
├── seed.py                # popula o banco com a rotina original e 1 usuário
├── run.py                 # inicia o servidor Flask
└── requirements.txt
```

## O que já está pronto (primeira versão)

1. Login simples (sem cadastro público)
2. Tela **Hoje** — rotina do dia + checklist + progresso + registrar estudo
3. Checklist diário com toque único (salva automaticamente)
4. Registrar estudo (matéria, tempo, tipo, observação)
5. **Minha Semana** — 7 dias + meta semanal (13h30)
6. **Matérias** — adicionar / editar / excluir
7. **Histórico** simples (Hoje / Ontem / datas)
8. Meta semanal de 13h30, calculada automaticamente a partir da rotina
9. Layout 100% mobile-first (também funciona bem no navegador do computador)
10. Banco de dados SQLite

## Observações técnicas

- A rotina (`Rotina`) é o "molde" semanal (o que definimos no plano original). Todo dia, ao abrir o app, os itens do checklist daquele dia são gerados automaticamente a partir desse molde — você só marca o que fez.
- A meta de estudo do dia/semana é calculada a partir da duração dos blocos de estudo cadastrados na `Rotina` (não é um número fixo "chumbado" no código).
- Ao registrar um estudo, se o total do dia atingir a meta, o item "Estudo" do checklist é marcado como concluído automaticamente — mas você também pode marcá-lo manualmente a qualquer momento.
