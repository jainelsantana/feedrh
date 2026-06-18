# FeedRH

Sistema web para gestão de requisições de vagas, decisão do RH/diretoria, acompanhamento de funil seletivo, relatórios e notificações automáticas por e-mail para gestores.

Status atual: em desenvolvimento, com execução local via Docker Compose.

## Funcionalidades

### RH
- Gerenciar usuários e empresas.
- Visualizar todas as vagas cadastradas.
- Aprovar, congelar, negar ou retornar vagas para decisão.
- Avançar ou retroceder vagas no funil seletivo de 9 etapas.
- Consultar relatórios por empresa, gestor, senioridade e etapa.
- Acompanhar histórico de decisões.

### Gestor
- Criar requisições de vagas.
- Visualizar somente as próprias vagas.
- Acompanhar posição na fila do RH e etapa atual do processo.
- Receber e-mail automático quando houver avanço ou mudança relevante na vaga.

### Notificações
- Envio automático ao gestor responsável pela vaga.
- Assunto no padrão `Avanço na vaga: Nome da vaga`.
- Corpo em texto puro e HTML responsivo.
- Template visual alinhado ao FeedRH, com cabeçalho roxo, card de resumo, barra de progresso, detalhes da vaga e botão para o dashboard.
- Suporte a SMTP com STARTTLS (`587`) e SSL implícito (`465`).
- Falhas de envio são registradas nos logs do backend.

## Stack

### Frontend
- Angular 17.3
- TypeScript 5.4
- Tailwind CSS 3.4
- RxJS
- Nginx no container de produção

### Backend
- FastAPI
- Pydantic
- SQLAlchemy
- PostgreSQL
- python-dotenv
- SMTP via biblioteca padrão `smtplib`

### Infra local
- Docker
- Docker Compose
- PostgreSQL 16 Alpine

## Arquitetura

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

Fluxo principal:

```text
Angular/Nginx -> FastAPI -> SQLAlchemy -> PostgreSQL
                         -> SMTP -> E-mail do gestor
```

## Execução com Docker

Pré-requisitos:

- Docker
- Docker Compose

Passos:

```bash
cp .env.example .env
docker-compose up --build
```

URLs locais:

| Serviço | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |
| ReDoc | http://localhost:8000/redoc |
| PostgreSQL | localhost:5432 |

O `docker-compose.yml` injeta no backend:

```env
DB_URL=postgresql+psycopg2://feedrh:feedrh@db:5432/feedrh
```

## Configuração do `.env`

O arquivo `.env` é local e está ignorado pelo Git. Nunca versionar credenciais reais.

Modelo atual:

```env
DB_URL=postgresql+psycopg2://feedrh:feedrh@localhost:5432/feedrh

MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_FROM_NAME=Sistema de Recrutamento
MAIL_USE_TLS=true
MAIL_USE_SSL=false
APP_URL=http://localhost:4200
```

Exemplo para SMTP com SSL na porta 465:

```env
MAIL_HOST=mail.seudominio.com.br
MAIL_PORT=465
MAIL_USER=naoresponda@seudominio.com.br
MAIL_PASSWORD=sua-senha
MAIL_FROM=naoresponda@seudominio.com.br
MAIL_FROM_NAME=Sistema de Recrutamento
MAIL_USE_TLS=false
MAIL_USE_SSL=true
APP_URL=http://localhost:4200
```

`APP_URL` é usado no botão "Ver no dashboard" do template de e-mail.

## Dados iniciais

Ao iniciar com banco vazio, o backend cria empresas e usuários padrão.

Empresas padrão:

- Elevare
- Ora Empresas
- Mercado do Provedor
- Mercado do Construtor
- Outra

Usuários padrão:

| Perfil | E-mail | Senha |
|---|---|---|
| RH | `rh@feedrh.com` | `rh@123` |
| Gestor | `gestor@feedrh.com` | `gestor@123` |

## Autenticação

O login é feito em:

```http
POST /auth/login
```

O frontend armazena o usuário autenticado e envia o ID nas chamadas protegidas usando o header:

```http
X-User-Id: 1
```

Perfis:

- `RH`: acesso administrativo, decisões, gestão de usuários, empresas, relatórios e alteração de etapas.
- `GESTOR`: criação e acompanhamento das próprias vagas.

## Rotas do frontend

| Rota | Tela | Perfil |
|---|---|---|
| `/login` | Login | Público |
| `/dashboard` | Dashboard de vagas | RH e Gestor |
| `/vagas/nova` | Nova vaga | RH e Gestor |
| `/rh/usuarios` | Gestão de usuários e empresas | RH |
| `/rh/decisoes` | Painel de decisão | RH |
| `/rh/relatorios` | Relatórios | RH |

## Endpoints do backend

As rotas atuais não usam prefixo `/api`.

### Autenticação

```http
POST /auth/login
```

### Usuários

```http
POST   /users
GET    /users
PATCH  /users/{user_id}
DELETE /users/{user_id}
```

As rotas de usuários exigem perfil `RH`, exceto login.

### Empresas

```http
GET    /empresas
POST   /empresas
PATCH  /empresas/{empresa_id}
DELETE /empresas/{empresa_id}
```

`GET /empresas` exige usuário autenticado. Criação, edição e remoção exigem `RH`.

### Vagas

```http
POST  /vagas
GET   /vagas
PATCH /vagas/{vaga_id}/decisao-diretoria
PATCH /vagas/{vaga_id}/etapa-funil
GET   /vagas/relatorio
```

Filtros aceitos em `GET /vagas`:

```text
gestor_id
data_inicio=YYYY-MM-DD
data_fim=YYYY-MM-DD
```

`GET /vagas/relatorio` é restrito ao perfil `RH`.

## Modelo de dados principal

### Usuário

```python
{
  "id": int,
  "nome": str,
  "email": str,
  "empresa": str,
  "perfil": "RH" | "GESTOR",
  "senha_hash": str
}
```

### Empresa

```python
{
  "id": int,
  "nome": str
}
```

### Vaga

```python
{
  "id": int,
  "cargo": str,
  "data_abertura": datetime,
  "empresa_destinada": str,
  "senioridade": str,
  "resumo_requisitos": str,
  "requisitos_obrigatorios": str,
  "tipo": "Nova posição" | "Substituição",
  "profissional_substituido": str | None,
  "justificativa_substituicao": str | None,
  "solicitante_id": int,
  "status_decisao_diretoria": "Pendente" | "Aprovada" | "Congelada" | "Negada",
  "justificativa_negativa": str | None,
  "quantidade_congelamentos": int,
  "etapa_funil": int,
  "data_finalizacao": datetime | None
}
```

### Histórico da vaga

```python
{
  "id": int,
  "vaga_id": int,
  "data_registro": datetime,
  "usuario_id": int,
  "usuario_nome": str,
  "acao": str,
  "status_anterior": str | None,
  "status_novo": str | None,
  "justificativa": str | None
}
```

## Funil seletivo

O campo `etapa_funil` usa valores de 1 a 9:

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

Quando a vaga chega na etapa 9, `data_finalizacao` é preenchida automaticamente. Se voltar para uma etapa anterior, a finalização é removida.

## Regras importantes

- Vagas começam com decisão `Pendente` e etapa `1`.
- O RH pode mudar decisão para `Pendente`, `Aprovada`, `Congelada` ou `Negada`.
- Uma vaga `Negada` exige justificativa.
- Cada novo congelamento incrementa `quantidade_congelamentos`.
- O sistema registra histórico de decisões em `vagas_historico`.
- Mudanças de decisão e mudanças de etapa notificam o gestor por e-mail.
- Para gestores, `GET /vagas` retorna somente vagas criadas pelo próprio usuário.

## Desenvolvimento local

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
fastapi run main.py --port 8000
```

Se o backend rodar fora do Docker, configure `DB_URL` para apontar para o Postgres local ou para o Postgres publicado pelo Compose:

```env
DB_URL=postgresql+psycopg2://feedrh:feedrh@localhost:5432/feedrh
```

### Frontend

```bash
cd frontend
npm install
npm start
```

O serviço Angular chama o backend em:

```text
http://localhost:8000
```

## Testes e validações úteis

Build do frontend:

```bash
cd frontend
npm run build
```

Checagem de sintaxe do backend:

```bash
PYTHONPYCACHEPREFIX=/private/tmp/feedrh_pycache python3 -m py_compile backend/main.py
```

Ver logs:

```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

Entrar no banco:

```bash
docker-compose exec db psql -U feedrh -d feedrh
```

## Limpeza do banco local

Para apagar os dados das tabelas principais e resetar IDs:

```bash
docker-compose up -d db
docker-compose exec db psql -U feedrh -d feedrh -c "TRUNCATE TABLE vagas_historico, vagas, users, empresas RESTART IDENTITY CASCADE;"
docker-compose up -d backend
```

Ao subir o backend novamente, os dados padrão são recriados.

Para apagar também o volume do PostgreSQL:

```bash
docker-compose down -v
```

## Solução de problemas

### Frontend não conecta no backend

- Verifique se o backend está em `http://localhost:8000`.
- Confira o console do navegador.
- Veja `docker-compose logs backend`.

### E-mail não é enviado

- Confira `MAIL_HOST`, `MAIL_PORT`, `MAIL_USER`, `MAIL_PASSWORD`, `MAIL_FROM`.
- Para porta `465`, use `MAIL_USE_SSL=true` e `MAIL_USE_TLS=false`.
- Para porta `587`, use `MAIL_USE_SSL=false` e `MAIL_USE_TLS=true`.
- Verifique se o provedor SMTP permite envio pelo usuário configurado.
- Veja os erros completos em `docker-compose logs backend`.

### Banco não inicia

- Veja o status com `docker-compose ps`.
- Confira `docker-compose logs db`.
- Se for um ambiente local descartável, recrie o volume com `docker-compose down -v`.

## Segurança

- `.env` contém credenciais e não deve ser versionado.
- `.env.example` deve conter apenas chaves e valores de exemplo.
- As senhas de usuários são armazenadas como hash SHA-256. Para produção, recomenda-se migrar para um algoritmo próprio para senhas, como bcrypt ou Argon2.
- O controle de sessão atual é simples e baseado em `X-User-Id`, adequado para o estágio atual do projeto, mas deve evoluir para tokens assinados antes de produção.

## Documentação adicional

- `REFERENCIA_RAPIDA.md`: comandos e mapa rápido do projeto.
- `DESENVOLVIMENTO.md`: notas de desenvolvimento.
- `DEPLOYMENT.md`: orientação de deploy.

## Licença

Projeto privado.

Última atualização: Junho de 2026.
