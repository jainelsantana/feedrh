# FeedRH - Sistema de Gestão de Recursos Humanos

## 📋 Visão Geral

O **FeedRH** é um sistema web moderno e completo para gestão de recursos humanos, desenvolvido com arquitetura de microsserviços containerizada. O sistema permite o gerenciamento centralizado de vagas, usuários, processos de decisão e geração de relatórios.

**Versão:** 1.0.0  
**Status:** Em desenvolvimento

---

## 🎯 Funcionalidades Principais

### Para Usuários RH:
- ✅ Gestão de usuários (criação, edição, exclusão)
- ✅ Gerenciamento de vagas (Nova posição / Substituição)
- ✅ Painel de decisão da diretoria
- ✅ Geração de relatórios detalhados
- ✅ Controle de congelamento de vagas
- ✅ Rastreamento de etapas do funil de seleção

### Para Gestores:
- ✅ Visualização do dashboard
- ✅ Acesso a vagas disponíveis
- ✅ Acompanhamento de processos seletivos

### Geral:
- ✅ Sistema de autenticação seguro
- ✅ Controle de acesso baseado em papéis (RBAC)
- ✅ Interface responsiva com Tailwind CSS
- ✅ API RESTful escalável

---

## 🏗️ Arquitetura

```
FeedRH/
├── Frontend (Angular 17)
│   ├── UI responsiva com Tailwind CSS
│   ├── Autenticação e guards de rota
│   └── Componentes modulares
│
├── Backend (FastAPI + SQLAlchemy)
│   ├── API RESTful
│   ├── Banco de dados SQLite
│   └── CORS habilitado para frontend
│
└── Docker Compose
    └── Orquestração de containers
```

### Arquitetura em Camadas:

```
┌─────────────────────────────────────┐
│      Frontend (Angular 17)          │
│  - Componentes                      │
│  - Serviços                         │
│  - Guards de rota                   │
└──────────────┬──────────────────────┘
               │ HTTP/REST
┌──────────────▼──────────────────────┐
│    Backend (FastAPI)                │
│  - Rotas/Endpoints                  │
│  - Validação (Pydantic)             │
│  - Middleware CORS                  │
└──────────────┬──────────────────────┘
               │ ORM
┌──────────────▼──────────────────────┐
│    Banco de Dados (SQLite)          │
│  - Tabelas (Users, Vagas, Empresas) │
└─────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Angular 17.3.0** - Framework web moderno
- **TypeScript 5.4** - Tipagem estática
- **Tailwind CSS 3.4** - Estilização utilitária
- **RxJS 7.8** - Programação reativa
- **Angular Forms** - Validação de formulários

### Backend
- **FastAPI** - Framework web de alta performance
- **SQLAlchemy** - ORM para banco de dados
- **Pydantic** - Validação de dados
- **Python 3.11** - Linguagem de programação
- **SQLite** - Banco de dados leve

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de containers
- **Nginx** - Servidor web reverso (frontend)

---

## 📁 Estrutura de Pastas

```
FeedRH/
├── docker-compose.yml          # Orquestração de containers
├── backend/
│   ├── Dockerfile              # Imagem Docker backend
│   ├── main.py                 # Aplicação principal FastAPI
│   └── requirements.txt         # Dependências Python
│
└── frontend/
    ├── Dockerfile              # Imagem Docker frontend
    ├── nginx.conf              # Configuração Nginx
    ├── angular.json            # Configuração Angular
    ├── tailwind.config.js       # Configuração Tailwind
    ├── tsconfig.json           # Configuração TypeScript
    ├── package.json            # Dependências Node
    └── src/
        ├── index.html          # HTML principal
        ├── main.ts             # Entry point Angular
        ├── styles.css          # Estilos globais
        └── app/
            ├── app.component.ts       # Componente raiz
            ├── app.config.ts          # Configuração da app
            ├── app.routes.ts          # Rotas da aplicação
            ├── core/                  # Serviços essenciais
            │   ├── auth.guard.ts      # Guard de autenticação
            │   └── auth.service.ts    # Serviço de auth
            ├── features/              # Componentes por feature
            │   ├── dashboard/         # Dashboard principal
            │   ├── decision-panel/    # Painel de decisão
            │   ├── job-form/          # Formulário de vagas
            │   ├── login/             # Página de login
            │   ├── report/            # Relatórios
            │   └── user-management/   # Gerenciamento de usuários
            └── shared/                # Serviços compartilhados
                ├── empresa.service.ts
                ├── user.service.ts
                └── vaga.service.ts
```

---

## 🚀 Guia de Instalação e Execução

### Pré-requisitos
- Docker e Docker Compose instalados
- Node.js 18+ (para desenvolvimento local)
- Python 3.11+ (para desenvolvimento local)

### Opção 1: Com Docker (Recomendado)

```bash
# Clonar o repositório
git clone <repo-url>
cd FeedRH

# Executar com Docker Compose
docker-compose up --build

# A aplicação estará disponível em:
# - Frontend: http://localhost:4200
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Opção 2: Desenvolvimento Local

#### Backend
```bash
# Navegar até o diretório backend
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
fastapi run main.py --port 8000
```

#### Frontend
```bash
# Navegar até o diretório frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# A aplicação estará em http://localhost:4200
```

---

## 📊 Modelos de Dados

### Usuário (User)
```python
{
  "id": int,
  "nome": str,
  "email": str (único),
  "empresa": str,
  "perfil": "RH" | "GESTOR",
  "senha_hash": str
}
```

### Empresa
```python
{
  "id": int,
  "nome": str (único)
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
  "tipo": "Nova posição" | "Substituição",
  "profissional_substituido": str (opcional),
  "justificativa_substituicao": str (opcional),
  "solicitante_id": int,
  "status_decisao_diretoria": "Pendente" | "Aprovada" | "Rejeitada",
  "quantidade_congelamentos": int,
  "etapa_funil": int (1-5),
  "data_finalizacao": datetime (opcional)
}
```

---

## 🔑 Rotas Principais da Aplicação

| Rota | Componente | Requer Auth | Papel Necessário |
|------|-----------|-------------|-----------------|
| `/` | Login | ❌ | - |
| `/login` | LoginComponent | ❌ | - |
| `/dashboard` | DashboardComponent | ✅ | Qualquer |
| `/vagas/nova` | JobFormComponent | ✅ | Qualquer |
| `/rh/usuarios` | UserManagementComponent | ✅ | RH |
| `/rh/decisoes` | DecisionPanelComponent | ✅ | RH |
| `/rh/relatorios` | ReportComponent | ✅ | RH |

---

## 🔐 Autenticação e Autorização

### Guard de Autenticação
- Todas as rotas protegidas utilizam `AuthGuard`
- Valida se o usuário está autenticado
- Redireciona para login se não autenticado

### Controle de Acesso
- **RH**: Acesso completo a todas as funcionalidades
- **GESTOR**: Acesso limitado ao dashboard e visualização de vagas

### Segurança de Senha
- Senhas são criptografadas com SHA-256
- Hash armazenado no banco de dados

---

## 🔗 Endpoints da API

### Autenticação
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Usuários
```
GET    /api/users          # Listar todos
GET    /api/users/{id}     # Obter um
POST   /api/users          # Criar
PUT    /api/users/{id}     # Atualizar
DELETE /api/users/{id}     # Deletar
```

### Vagas
```
GET    /api/vagas          # Listar todas
GET    /api/vagas/{id}     # Obter uma
POST   /api/vagas          # Criar
PUT    /api/vagas/{id}     # Atualizar
DELETE /api/vagas/{id}     # Deletar
```

### Empresas
```
GET    /api/empresas       # Listar todas
GET    /api/empresas/{id}  # Obter uma
POST   /api/empresas       # Criar
```

---

## 📝 Variáveis de Ambiente

### Backend
```env
DB_URL=sqlite:///./feedrh.db    # URL do banco de dados
```

### Frontend
```env
API_BASE_URL=http://localhost:8000    # URL da API (configurada em serviços)
```

---

## 🧪 Testes

### Frontend
```bash
cd frontend
npm test                    # Executar testes unitários
npm run build              # Build para produção
ng test --watch            # Testes em modo watch
```

---

## 📈 Guia de Desenvolvimento

### Adicionando uma Nova Feature

1. **Criar componente**
   ```bash
   ng generate component features/nova-feature
   ```

2. **Adicionar rota em `app.routes.ts`**
   ```typescript
   {
     path: 'nova-rota',
     component: NovaFeatureComponent,
     canActivate: [AuthGuard],
     data: { role: 'RH' }
   }
   ```

3. **Criar serviço se necessário**
   ```bash
   ng generate service shared/nova-feature.service
   ```

4. **Implementar lógica**
   - Utilizar Reactive Forms
   - Chamar serviços via injeção de dependência
   - Seguir padrão de componentes standalone

### Padrões de Código

#### Componentes Angular
```typescript
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [CommonModule],
  template: `<div>Conteúdo</div>`
})
export class ExemploComponent implements OnInit {
  ngOnInit() {
    // Inicializar componente
  }
}
```

#### Serviços
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ExemploService {
  constructor(private http: HttpClient) {}

  obter(): Observable<any> {
    return this.http.get('/api/endpoint');
  }
}
```

---

## 🐛 Solução de Problemas

### Frontend não conecta no backend
- Verificar se backend está rodando em `http://localhost:8000`
- Verificar CORS configurado no backend
- Verificar URL da API nos serviços

### Erro de banco de dados
- Deletar arquivo `feedrh.db` para resetar banco
- Verificar permissões de escrita na pasta backend
- Reiniciar containers Docker

### Problemas de permissão CORS
- Verificar middleware CORS no backend
- Origem frontend deve estar registrada

---

## 📚 Documentação Adicional

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Angular Docs](https://angular.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar a documentação acima
2. Consultar logs dos containers: `docker-compose logs`
3. Verificar console do navegador (DevTools)
4. Revisar arquivo `feedrh.db` com ferramenta SQLite

---

## 📄 Licença

Este projeto é propriedade privada.

---

**Última atualização:** Junho 2026
# feedrh
