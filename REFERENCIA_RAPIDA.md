# 📖 REFERÊNCIA RÁPIDA - FeedRH

## 🚀 Quick Commands

### Docker
```bash
docker-compose up --build          # Iniciar todos os containers
docker-compose down                # Parar todos os containers
docker-compose logs -f             # Ver logs em tempo real
docker-compose restart             # Reiniciar todos
docker exec -it feedrh-backend /bin/bash  # Acessar shell do container
```

### Frontend (Angular)
```bash
npm install                        # Instalar dependências
npm start                          # Executar servidor dev (porta 4200)
npm run build                      # Build para produção
npm test                           # Executar testes
npm run lint                       # Verificar lint
npm run format                     # Formatar código
ng generate component features/novo  # Gerar novo componente
ng generate service shared/novo      # Gerar novo serviço
```

### Backend (FastAPI)
```bash
pip install -r requirements.txt    # Instalar dependências
fastapi run main.py --port 8000   # Executar servidor
python -m pytest                   # Executar testes
ruff check .                       # Verificar lint
```

---

## 📁 Arquivos Importantes

| Arquivo | Propósito | Modificar quando |
|---------|-----------|-----------------|
| `docker-compose.yml` | Orquestração de containers | Adicionar serviço novo |
| `frontend/package.json` | Dependências Node | Instalar novo pacote |
| `backend/requirements.txt` | Dependências Python | Instalar novo pacote |
| `frontend/src/app/app.routes.ts` | Rotas da aplicação | Adicionar nova rota |
| `backend/main.py` | API e modelo de dados | Adicionar endpoint/modelo |
| `frontend/tailwind.config.js` | Tema e estilos | Customizar cores |
| `.gitignore` | Arquivos ignorados | Excluir arquivo do Git |

---

## 🔗 URLs Locais

| Serviço | URL | Propósito |
|---------|-----|----------|
| Frontend | http://localhost:4200 | Aplicação web |
| Backend | http://localhost:8000 | API REST |
| API Docs | http://localhost:8000/docs | Swagger UI |
| ReDoc | http://localhost:8000/redoc | Documentação ReDoc |

---

## 🔑 Credenciais Padrão

```
Email: admin@feedrh.com
Senha: admin123
Perfil: RH
```

---

## 🎯 Principais Componentes

### Frontend

```
LoginComponent               → Autenticação
DashboardComponent          → Página inicial
JobFormComponent            → Criar/editar vagas
UserManagementComponent     → Gerenciar usuários
DecisionPanelComponent      → Painel da diretoria
ReportComponent             → Relatórios
```

### Backend

```
POST   /api/auth/login      → Login
GET    /api/users           → Listar usuários
POST   /api/users           → Criar usuário
GET    /api/vagas           → Listar vagas
POST   /api/vagas           → Criar vaga
GET    /api/empresas        → Listar empresas
```

---

## 📊 Modelos de Dados

### User
```typescript
{
  id: number,
  nome: string,
  email: string,
  empresa: string,
  perfil: "RH" | "GESTOR",
  senha_hash: string
}
```

### Vaga
```typescript
{
  id: number,
  cargo: string,
  data_abertura: DateTime,
  empresa_destinada: string,
  senioridade: string,
  tipo: "Nova posição" | "Substituição",
  profissional_substituido?: string,
  justificativa_substituicao?: string,
  solicitante_id: number,
  status_decisao_diretoria: "Pendente" | "Aprovada" | "Rejeitada",
  quantidade_congelamentos: number,
  etapa_funil: number,
  data_finalizacao?: DateTime
}
```

### Empresa
```typescript
{
  id: number,
  nome: string
}
```

---

## 🛠️ Stack Tecnológico

```
┌─────────────────────────────────────────────┐
│         Frontend                            │
│ Angular 17 + TypeScript 5.4 + Tailwind CSS │
│         RxJS 7.8 + Reactive Forms          │
└──────────────────┬──────────────────────────┘
                   │
        HTTP/REST (JSON)
                   │
┌──────────────────▼──────────────────────────┐
│         Backend                             │
│ FastAPI + Pydantic + SQLAlchemy + Python   │
│              3.11                           │
└──────────────────┬──────────────────────────┘
                   │
        ORM / SQLAlchemy
                   │
┌──────────────────▼──────────────────────────┐
│      PostgreSQL Database                    │
└─────────────────────────────────────────────┘
```

---

## 🔐 Autenticação

### Guard de Rota
```typescript
canActivate: [AuthGuard]
```

### Middleware CORS
```python
CORSMiddleware(
  allow_origins=["http://localhost:4200"],
  allow_methods=["*"],
  allow_headers=["*"]
)
```

### Hashing de Senha
```python
hashlib.sha256(senha.encode()).hexdigest()
```

---

## 📝 Estrutura de Commit

```
<tipo>(<escopo>): <descrição>

<corpo>

<rodapé>
```

**Tipos:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Documentação
- `style`: Formatação de código
- `refactor`: Refatoração de código
- `perf`: Melhorias de performance
- `test`: Testes

**Exemplo:**
```
feat(job-form): adicionar validação de cargo

- Valida se cargo não está vazio
- Exibe mensagem de erro ao usuário
- Testa com mais de 50 caracteres

Closes #123
```

---

## 🧪 Padrão de Teste

### Frontend
```typescript
describe('ComponentName', () => {
  it('should do something', () => {
    // Arrange
    const expected = 'value';
    
    // Act
    const result = component.method();
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### Backend
```python
def test_create_user():
    # Arrange
    user_data = {"nome": "John", "email": "john@example.com", ...}
    
    # Act
    response = client.post("/api/users", json=user_data)
    
    # Assert
    assert response.status_code == 201
    assert response.json()["email"] == "john@example.com"
```

---

## 🐛 Debug

### Console Logs Úteis

```typescript
// Frontend
console.log('Dados:', this.data);
console.error('Erro:', error);
console.table(this.users);  // Tabela formatada
console.time('timer');      // Inicia timer
console.timeEnd('timer');   // Termina timer
```

### Network Debug

**Chrome DevTools:**
1. Abrir DevTools (F12)
2. Aba Network
3. Filtrar por "Fetch/XHR"
4. Clicar na requisição
5. Ver Request/Response

### Database Debug

```bash
docker-compose exec db psql -U feedrh -d feedrh
\dt
SELECT * FROM users;
\d users
```

---

## 🚨 Erros Comuns

### CORS Error
```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' 
from origin 'http://localhost:4200' has been blocked
```
**Solução:** Verificar CORS middleware no backend

### Cannot find module
```
Module not found: Can't resolve '@angular/common'
```
**Solução:** Executar `npm install` e `npm start`

### Port already in use
```
Error: listen EADDRINUSE: address already in use :::4200
```
**Solução:** `lsof -i :4200 && kill -9 <PID>`

### Database locked
```
database is locked
```
**Solução:** Fechar outras conexões ou reiniciar container

---

## 📚 Documentação Completa

- **README.md** - Visão geral do projeto
- **ARQUITETURA.md** - Detalhes técnicos e padrões
- **DESENVOLVIMENTO.md** - Guia passo a passo
- **DEPLOYMENT.md** - Deploy e operações
- **REFERENCIA_RAPIDA.md** - Este arquivo

---

## 🔗 Links Úteis

- [Angular Docs](https://angular.io/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [RxJS](https://rxjs.dev/)
- [Docker Docs](https://docs.docker.com/)

---

## 📞 Suporte

- Verificar documentação relevante
- Consultar logs: `docker-compose logs -f`
- Abrir issue no repositório
- Contatar time de desenvolvimento

---

**Última atualização:** Junho 2026
