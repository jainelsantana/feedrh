# FeedRH

FeedRH é um sistema web para gestão de requisições de vagas, decisão de RH/diretoria, acompanhamento do funil seletivo, relatórios e notificações por e-mail para gestores.

O projeto está em desenvolvimento e pode rodar localmente com Docker Compose ou em produção no Coolify com frontend e backend publicados como apps separados.

## Visão Geral

### Perfis

- `RH`: gerencia usuários, empresas, decisões, funil, relatórios e exportações.
- `GESTOR`: cria vagas, acompanha as próprias solicitações e recebe notificações.

### Funcionalidades

- Cadastro e manutenção de usuários.
- Cadastro e manutenção de empresas.
- Abertura de requisições de vagas.
- Aprovação, congelamento, negação e retorno de vagas para decisão.
- Histórico de decisões e mudanças de etapa.
- Funil seletivo com 9 etapas.
- Relatórios por empresa, gestor, senioridade, status e etapa.
- Exportação de relatórios em PDF e Excel.
- Recuperação de senha por e-mail.
- Reset de senha de gestores pelo RH.
- E-mails automáticos para acesso inicial, reset de senha e avanços de vaga.

## Stack

### Frontend

- Angular 17
- TypeScript
- Tailwind CSS
- RxJS
- Nginx em produção

### Backend

- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- SMTP com `smtplib`
- ReportLab para PDF
- openpyxl para Excel

### Infraestrutura

- Docker
- Docker Compose
- Coolify
- PostgreSQL 16 Alpine no ambiente local

## Estrutura

```text
feedrh/
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── tailwind.config.js
│   └── src/
├── docker-compose.yml
├── .env.example
├── README.md
├── REFERENCIA_RAPIDA.md
├── DESENVOLVIMENTO.md
└── DEPLOYMENT.md
```

## Arquitetura

### Produção com Coolify

Em produção, o frontend e o backend são apps separados.

```text
Navegador
  -> Frontend Angular servido por Nginx
  -> /api/*
  -> Nginx do frontend
  -> BACKEND_URL/*
  -> FastAPI
  -> PostgreSQL
  -> SMTP
```

O Angular sempre chama a API por caminho relativo:

```text
/api/auth/login
/api/auth/forgot-password
/api/vagas
```

O Nginx do frontend remove o prefixo `/api/` ao encaminhar para o backend. Assim:

```text
/api/auth/login -> BACKEND_URL/auth/login
```

### Desenvolvimento local

No ambiente local, o Docker Compose sobe:

- `db`
- `backend`
- `frontend`

O frontend local fica em `http://localhost:4200` e o backend em `http://localhost:3007`.

## Deploy no Coolify

Configure dois apps independentes.

### Backend

- Build Pack: Dockerfile
- Base Directory: `/backend`
- Dockerfile Location: `/Dockerfile`
- Porta interna: `3007`

Variáveis esperadas:

```env
APP_URL=https://frontend.seudominio.com
DATABASE_URL=postgresql+psycopg2://usuario:senha@host:5432/banco
MAIL_HOST=mail.seudominio.com
MAIL_PORT=465
MAIL_USER=usuario_smtp
MAIL_PASSWORD=senha_smtp
MAIL_FROM=email_remetente
MAIL_FROM_NAME=Sistema de Recrutamento
MAIL_USE_TLS=false
MAIL_USE_SSL=true
LOG_LEVEL=INFO
```

`APP_URL` deve apontar para o frontend público. O backend usa essa variável para:

- liberar CORS;
- montar links em e-mails;
- gerar links de recuperação de senha.

Também é possível liberar origens adicionais com:

```env
FRONTEND_URL=https://frontend.seudominio.com
CORS_ORIGINS=https://frontend.seudominio.com,https://outro-dominio.com
```

### Frontend

- Build Pack: Dockerfile
- Base Directory: `/frontend`
- Dockerfile Location: `/Dockerfile`
- Porta interna: `80`

Variáveis esperadas:

```env
API_URL=/api
BACKEND_URL=https://api.seudominio.com
BACKEND_HOST=api.seudominio.com
```

Regras importantes:

- `API_URL` deve ser sempre relativo, normalmente `/api`.
- O build rejeita `API_URL` absoluto, como `https://api.seudominio.com`.
- `BACKEND_URL` deve incluir protocolo e não deve terminar com barra.
- `BACKEND_HOST` deve conter apenas o host que será enviado no header `Host`.
- O Nginx gera o arquivo final de configuração em runtime usando `BACKEND_URL` e `BACKEND_HOST`.

## Execução Local com Docker

Crie o `.env`:

```bash
cp .env.example .env
```

Para usar o Compose local, configure no `.env`:

```env
API_URL=/api
BACKEND_URL=http://backend:3007
BACKEND_HOST=backend
APP_URL=http://localhost:4200
```

Suba os serviços:

```bash
docker compose up --build
```

URLs locais:

| Serviço | URL |
|---|---|
| Frontend | `http://localhost:4200` |
| Backend | `http://localhost:3007` |
| Healthcheck | `http://localhost:3007/health` |
| Swagger | `http://localhost:3007/docs` |
| OpenAPI | `http://localhost:3007/openapi.json` |
| PostgreSQL | `localhost:5432` |

## Execução Local sem Docker

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 3007
```

Configure o banco:

```env
DB_URL=postgresql+psycopg2://feedrh:feedrh@localhost:5432/feedrh
```

### Frontend

```bash
cd frontend
npm install
npm start
```

No modo de desenvolvimento, `frontend/src/environments/environment.ts` aponta para `http://localhost:3007`.

## Variáveis de Ambiente

### Banco

```env
DATABASE_URL=postgresql+psycopg2://usuario:senha@host:5432/banco
DB_URL=postgresql+psycopg2://feedrh:feedrh@localhost:5432/feedrh
DB_CONNECT_RETRIES=10
DB_CONNECT_RETRY_SECONDS=2
```

O backend prioriza `DATABASE_URL`. `DB_URL` é útil no ambiente local.

### Frontend e Proxy

```env
API_URL=/api
BACKEND_URL=https://api.seudominio.com
BACKEND_HOST=api.seudominio.com
APP_URL=https://frontend.seudominio.com
```

### SMTP

```env
MAIL_HOST=mail.seudominio.com
MAIL_PORT=465
MAIL_USER=usuario_smtp
MAIL_PASSWORD=senha_smtp
MAIL_FROM=email_remetente
MAIL_FROM_NAME=Sistema de Recrutamento
MAIL_USE_TLS=false
MAIL_USE_SSL=true
```

### Logs

```env
LOG_LEVEL=INFO
```

## Dados Iniciais

Quando o banco está vazio, o backend cria empresas e usuários padrão.

Empresas:

- Elevare
- Ora Empresas
- Mercado do Provedor
- Mercado do Construtor
- Outra

Usuários:

| Perfil | E-mail | Senha |
|---|---|---|
| RH | `rh@feedrh.com` | `rh@123` |
| Gestor | `gestor@feedrh.com` | `gestor@123` |

## Rotas do Frontend

| Rota | Tela | Acesso |
|---|---|---|
| `/login` | Login | Público |
| `/recuperar-senha` | Solicitação de recuperação | Público |
| `/redefinir-senha` | Redefinição de senha por token | Público |
| `/dashboard` | Dashboard de vagas | RH e Gestor |
| `/vagas/nova` | Nova vaga | RH e Gestor |
| `/rh/usuarios` | Gestão de usuários e empresas | RH |
| `/rh/decisoes` | Painel de decisão | RH |
| `/rh/relatorios` | Relatórios | RH |

## API do Backend

As rotas internas do FastAPI não usam prefixo `/api`. O prefixo `/api` existe apenas no Nginx do frontend.

### Healthcheck e Documentação

```http
GET /health
GET /docs
GET /openapi.json
```

### Autenticação

```http
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
```

O frontend chama essas rotas como:

```text
/api/auth/login
/api/auth/forgot-password
/api/auth/reset-password
```

### Usuários

```http
POST   /users
GET    /users
PATCH  /users/{user_id}
POST   /users/{user_id}/reset-password
DELETE /users/{user_id}
```

As rotas de usuários exigem perfil `RH`. O reset pelo RH só aceita usuários `GESTOR`, gera senha temporária segura e não retorna a senha na resposta.

### Empresas

```http
GET    /empresas
POST   /empresas
PATCH  /empresas/{empresa_id}
DELETE /empresas/{empresa_id}
```

`GET /empresas` exige usuário autenticado. Criação, edição e remoção exigem perfil `RH`.

### Vagas

```http
POST  /vagas
GET   /vagas
PATCH /vagas/{vaga_id}/decisao-diretoria
PATCH /vagas/{vaga_id}/etapa-funil
GET   /vagas/relatorio
GET   /vagas/relatorio/pdf
GET   /vagas/relatorio/excel
```

Filtros aceitos em listagem e relatórios:

```text
gestor_id
empresa
senioridade
etapa_funil=1..9
status_decisao=Pendente|Aprovada|Congelada|Negada
data_inicio=YYYY-MM-DD
data_fim=YYYY-MM-DD
```

Relatórios e exportações são restritos ao perfil `RH`.

## Autenticação Atual

O login retorna o usuário autenticado. O frontend armazena o usuário no `localStorage` e envia o ID nas chamadas protegidas:

```http
X-User-Id: 1
```

Esse modelo é simples e adequado ao estágio atual do projeto. Antes de produção crítica, recomenda-se trocar para tokens assinados.

## Regras de Negócio

- Vagas começam como `Pendente` e na etapa `1`.
- O RH pode alterar decisão para `Pendente`, `Aprovada`, `Congelada` ou `Negada`.
- Vaga `Negada` exige justificativa.
- Cada novo congelamento incrementa `quantidade_congelamentos`.
- O sistema registra histórico em `vagas_historico`.
- Mudanças de decisão e etapa notificam o gestor por e-mail.
- Gestores veem apenas as próprias vagas.
- Relatórios gerais e exportações são exclusivos do RH.
- Cadastro e reset de senha de gestor não registram senha em log e não retornam senha pela API.

## Funil Seletivo

| Etapa | Nome |
|---|---|
| 1 | Fila de Espera |
| 2 | Divulgação |
| 3 | Triagem |
| 4 | Entrevista Inicial |
| 5 | Testes Psicológicos |
| 6 | Parecer Psicológico |
| 7 | Entrevista com Gestor |
| 8 | Aguardando Retorno |
| 9 | Finalizada |

Quando a vaga chega na etapa `9`, `data_finalizacao` é preenchida. Se voltar para etapa anterior, a finalização é removida.

## Validações Úteis

Checar backend:

```bash
PYTHONPYCACHEPREFIX=/private/tmp/feedrh_pycache python3 -m py_compile backend/main.py
```

Validar Compose:

```bash
BACKEND_URL=http://backend:3007 BACKEND_HOST=backend docker compose config --quiet
```

Subir localmente:

```bash
BACKEND_URL=http://backend:3007 BACKEND_HOST=backend docker compose up --build
```

Testar rotas:

```bash
curl http://localhost:3007/health
curl http://localhost:4200/api/health
curl -X POST http://localhost:4200/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rh@feedrh.com","senha":"rh@123"}'
```

Validar Nginx dentro do container:

```bash
BACKEND_URL=http://backend:3007 BACKEND_HOST=backend docker compose exec frontend nginx -t
```

## Solução de Problemas

### Frontend chama `/DOMINIO_BACKEND/auth/...`

Isso indica que `API_URL` foi configurada de forma incorreta no build do Angular.

Correção:

```env
API_URL=/api
```

O domínio do backend deve ficar apenas em:

```env
BACKEND_URL=https://api.seudominio.com
BACKEND_HOST=api.seudominio.com
```

### Nginx falha com `host not found in upstream "backend"`

Esse erro ocorre quando o Nginx tenta usar `backend` como hostname, mas frontend e backend estão em apps separados no Coolify.

Correção:

- Configure `BACKEND_URL` com a URL pública do backend.
- Configure `BACKEND_HOST` com o host público do backend.
- Redeploy do frontend.

### Backend público retorna `404` em `/health`

O app do backend no Coolify provavelmente não está apontando para o Dockerfile/pasta corretos ou ainda não foi redeployado.

Verifique:

- Base Directory: `/backend`
- Dockerfile Location: `/Dockerfile`
- Porta interna: `3007`
- Logs de startup com `FeedRH API iniciada na porta 3007`

### Erro de CORS no login

Configure no backend:

```env
APP_URL=https://frontend.seudominio.com
```

Se houver mais de uma origem:

```env
CORS_ORIGINS=https://frontend.seudominio.com,https://outro-dominio.com
```

### E-mail não é enviado

Confira as variáveis SMTP e os logs do backend.

Para SSL na porta `465`:

```env
MAIL_USE_SSL=true
MAIL_USE_TLS=false
```

Para STARTTLS na porta `587`:

```env
MAIL_USE_SSL=false
MAIL_USE_TLS=true
```

## Segurança

- Nunca versione `.env`.
- Não versionar credenciais reais.
- `.env.example` deve conter apenas exemplos.
- As senhas são armazenadas como hash SHA-256; para produção crítica, recomenda-se migrar para bcrypt ou Argon2.
- O modelo atual de sessão usa `X-User-Id`; recomenda-se evoluir para autenticação com token assinado.

## Documentação Complementar

- `REFERENCIA_RAPIDA.md`: mapa rápido do projeto.
- `DESENVOLVIMENTO.md`: notas e fluxo de desenvolvimento.
- `DEPLOYMENT.md`: orientações históricas de deploy.
- `ARQUITETURA.md`: anotações de arquitetura.

## Licença

Projeto privado.

Última atualização: Junho de 2026.
