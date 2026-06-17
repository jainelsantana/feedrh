# 🚀 GUIA DE DESENVOLVIMENTO - FeedRH

## 📌 Quick Start para Novos Desenvolvedores

### Primeiro Acesso (5 minutos)

```bash
# 1. Clonar o repositório
git clone <repo-url>
cd FeedRH

# 2. Executar com Docker (recomendado)
docker-compose up --build

# 3. Acessar a aplicação
# Frontend: http://localhost:4200
# Backend API: http://localhost:8000
# Docs API: http://localhost:8000/docs
```

### Credenciais Padrão

```
Email: admin@feedrh.com
Senha: admin123
Perfil: RH
```

---

## 🛠️ Configuração de Desenvolvimento Local

### Requisitos do Sistema

- Node.js 18+ (com npm 9+)
- Python 3.11+
- Git
- Visual Studio Code (recomendado)

### Extensões VS Code Recomendadas

```json
{
  "recommendations": [
    "Angular.ng-template",
    "ms-python.python",
    "charliermarsh.ruff",
    "bradlc.vscode-tailwindcss",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

### Setup Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente
source venv/bin/activate      # macOS/Linux
# ou
venv\Scripts\activate         # Windows

# Instalar dependências
pip install -r requirements.txt

# Executar servidor
fastapi run main.py --port 8000

# FastAPI Swagger UI estará em http://localhost:8000/docs
```

### Setup Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm start

# A aplicação abrirá automaticamente em http://localhost:4200

# Modo watch (rebuilda ao salvar)
npm run watch

# Build para produção
npm run build
```

---

## 📂 Estrutura de Pastas Explicada

### Frontend - Padrão Feature-Based

```
frontend/src/app/
│
├── core/                       # Serviços de aplicação (singleton)
│   ├── auth.guard.ts          # Protege rotas
│   └── auth.service.ts        # Gerencia autenticação
│
├── shared/                     # Componentes reutilizáveis
│   ├── user.service.ts        # HTTP calls para /api/users
│   ├── empresa.service.ts     # HTTP calls para /api/empresas
│   └── vaga.service.ts        # HTTP calls para /api/vagas
│
├── features/                   # Funcionalidades isoladas
│   ├── login/
│   │   ├── login.component.ts
│   │   └── login.component.html
│   │
│   ├── dashboard/
│   │   ├── dashboard.component.ts
│   │   └── dashboard.component.html
│   │
│   ├── job-form/
│   │   ├── job-form.component.ts
│   │   └── job-form.component.html
│   │
│   ├── user-management/
│   │   ├── user-management.component.ts
│   │   └── user-management.component.html
│   │
│   ├── decision-panel/
│   │   ├── decision-panel.component.ts
│   │   └── decision-panel.component.html
│   │
│   └── report/
│       ├── report.component.ts
│       └── report.component.html
│
├── app.component.ts            # Layout principal com navbar
├── app.routes.ts              # Definição de rotas
├── app.config.ts              # Provedores globais
│
└── styles.css                 # Estilos globais + Tailwind
```

### Backend - Padrão por Responsabilidade

```
backend/
│
├── main.py                    # Arquivo principal (tudo por enquanto)
│   ├── Database Setup
│   ├── SQLAlchemy Models
│   ├── Pydantic Schemas
│   ├── API Routes
│   └── Middleware
│
├── requirements.txt           # Dependências Python
└── Dockerfile                 # Imagem Docker
```

---

## 🔄 Workflow de Desenvolvimento

### 1. Criar Nova Feature (ex: Relatório de Vagas)

#### Passo 1: Backend
```bash
# main.py - adicionar novo modelo
class RelatorioModel(Base):
    __tablename__ = "relatorios"
    id = Column(Integer, primary_key=True)
    titulo = Column(String)
    data_criacao = Column(DateTime, default=datetime.utcnow)
    usuario_id = Column(Integer)

# Adicionar schema Pydantic
class RelatorioSchema(BaseModel):
    id: int
    titulo: str
    data_criacao: datetime
    usuario_id: int

# Adicionar endpoint
@app.get("/api/relatorios")
def list_relatorios(db: Session = Depends(get_db)):
    return db.query(RelatorioModel).all()

@app.post("/api/relatorios")
def create_relatorio(relatorio: RelatorioSchema, db: Session = Depends(get_db)):
    db_relatorio = RelatorioModel(**relatorio.dict())
    db.add(db_relatorio)
    db.commit()
    db.refresh(db_relatorio)
    return db_relatorio
```

#### Passo 2: Frontend - Gerar Componente
```bash
ng generate component features/relatorio-vaga
```

#### Passo 3: Criar Serviço
```bash
ng generate service shared/relatorio.service
```

**shared/relatorio.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Relatorio {
  id: number;
  titulo: string;
  data_criacao: Date;
  usuario_id: number;
}

@Injectable({
  providedIn: 'root'
})
export class RelatorioService {
  private apiUrl = 'http://localhost:8000/api/relatorios';

  constructor(private http: HttpClient) {}

  list(): Observable<Relatorio[]> {
    return this.http.get<Relatorio[]>(this.apiUrl);
  }

  create(relatorio: Omit<Relatorio, 'id'>): Observable<Relatorio> {
    return this.http.post<Relatorio>(this.apiUrl, relatorio);
  }

  getById(id: number): Observable<Relatorio> {
    return this.http.get<Relatorio>(`${this.apiUrl}/${id}`);
  }

  update(id: number, relatorio: Partial<Relatorio>): Observable<Relatorio> {
    return this.http.put<Relatorio>(`${this.apiUrl}/${id}`, relatorio);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
```

#### Passo 4: Implementar Componente
```typescript
// features/relatorio-vaga/relatorio-vaga.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelatorioService } from '../../shared/relatorio.service';

interface Relatorio {
  id: number;
  titulo: string;
  data_criacao: Date;
  usuario_id: number;
}

@Component({
  selector: 'app-relatorio-vaga',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6">
      <h1 class="text-3xl font-bold mb-6">Relatório de Vagas</h1>
      
      <div class="mb-6">
        <button 
          class="bg-blue-600 text-white px-4 py-2 rounded"
          (click)="openNew()">
          + Novo Relatório
        </button>
      </div>

      <div class="grid grid-cols-1 gap-4">
        <div *ngFor="let relatorio of relatorios" 
             class="p-4 border rounded shadow hover:shadow-lg">
          <h3 class="text-lg font-semibold">{{ relatorio.titulo }}</h3>
          <p class="text-gray-600">{{ relatorio.data_criacao | date }}</p>
          <div class="mt-4 flex gap-2">
            <button class="text-blue-600" (click)="edit(relatorio.id)">Editar</button>
            <button class="text-red-600" (click)="delete(relatorio.id)">Deletar</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RelatorioVagaComponent implements OnInit {
  relatorios: Relatorio[] = [];

  constructor(private relatorioService: RelatorioService) {}

  ngOnInit() {
    this.loadRelatorios();
  }

  loadRelatorios() {
    this.relatorioService.list().subscribe({
      next: (data) => {
        this.relatorios = data;
      },
      error: (error) => {
        console.error('Erro ao carregar relatórios:', error);
      }
    });
  }

  openNew() {
    // Abrir modal ou navegar para formulário
  }

  edit(id: number) {
    // Editar relatório
  }

  delete(id: number) {
    if (confirm('Tem certeza?')) {
      this.relatorioService.delete(id).subscribe({
        next: () => {
          this.loadRelatorios();
        },
        error: (error) => {
          console.error('Erro ao deletar:', error);
        }
      });
    }
  }
}
```

#### Passo 5: Adicionar Rota
```typescript
// app.routes.ts
export const routes: Routes = [
  // ... rotas existentes
  {
    path: 'relatorios/vagas',
    component: RelatorioVagaComponent,
    canActivate: [AuthGuard],
    data: { role: 'RH' }
  },
];
```

---

## 🧪 Testes

### Frontend - Testes Unitários

```typescript
// example.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExampleComponent } from './example.component';

describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExampleComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render title', () => {
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toContain('Expected Title');
  });
});
```

**Executar testes:**
```bash
npm test
ng test --watch
```

### Backend - Testes com pytest (TODO)

```python
# test_main.py
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_user():
    response = client.post("/api/users", json={
        "nome": "John",
        "email": "john@example.com",
        "empresa": "Tech Corp",
        "perfil": "RH",
        "senha": "123456"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "john@example.com"
```

---

## 🐛 Debug e Troubleshooting

### Chrome DevTools

1. Pressionar `F12` para abrir DevTools
2. Aba **Network** - monitora requisições HTTP
3. Aba **Console** - logs e erros
4. Aba **Application** - localStorage (token)

### FastAPI Swagger UI

Acessar `http://localhost:8000/docs` para:
- Testar endpoints sem frontend
- Ver documentação interativa
- Enviar requisições manualmente

### Verificar Banco de Dados

```bash
# Instalar ferramenta SQLite (opcional)
pip install sqlite3

# Inspecionar banco
sqlite3 backend/feedrh.db
.tables
SELECT * FROM users;
```

### Logs do Docker

```bash
# Ver logs em tempo real
docker-compose logs -f

# Apenas backend
docker logs feedrh-backend -f

# Apenas frontend
docker logs feedrh-frontend -f

# Ver últimas 100 linhas
docker logs feedrh-backend --tail 100
```

---

## 📋 Padrões de Código

### Nomeação

```typescript
// ✅ Bom
// Componentes: PascalCase.component.ts
UserManagementComponent
LoginComponent

// Serviços: camelCase.service.ts
authService
vagaService

// Variáveis: camelCase
const userData = {};
let isLoading = false;

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:8000';
const MAX_RETRIES = 3;

// Interfaces/Types: PascalCase
interface User {
  id: number;
  nome: string;
}

type Status = 'pending' | 'approved' | 'rejected';
```

### Formatação de Código

```bash
# Usar Prettier
npm run format

# Lint (ESLint)
npm run lint
```

### Comentários

```typescript
// ❌ Evitar
const data = fetch(url); // Buscar dados

// ✅ Usar quando necessário
// Busca dados do servidor e cacheia por 5 minutos
const data = fetch(url).then(cache);

/**
 * Valida formato de email do usuário
 * @param email - Email a validar
 * @returns true se email é válido
 */
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

---

## 🔐 Variáveis de Ambiente

### Backend (.env)
```env
# Database
DB_URL=sqlite:///./feedrh.db

# API
API_PORT=8000
API_HOST=0.0.0.0

# Security (future)
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
TOKEN_EXPIRE_DAYS=30
```

### Frontend (environment.ts)
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiTimeout: 30000
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.feedrh.com',
  apiTimeout: 30000
};
```

---

## 📚 Recursos Úteis

### Documentação
- [Angular 17 Docs](https://angular.io/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Ferramentas
- [Angular DevTools Chrome Extension](https://chrome.google.com/webstore)
- [Postman](https://www.postman.com/) - Testar API
- [DBeaver](https://dbeaver.io/) - Gerenciar banco de dados
- [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)

### Tutoriais
- [RxJS Operators](https://rxjs.dev/guide/operators)
- [Angular Reactive Forms](https://angular.io/guide/reactive-forms)
- [FastAPI Tutorial](https://fastapi.tiangolo.com/tutorial/)

---

## ✅ Checklist Antes de Fazer Push

- [ ] Código compila sem erros
- [ ] Testes passando (`npm test`)
- [ ] Sem console.log() desnecessários
- [ ] Variáveis de ambiente configuradas
- [ ] Backend responde em `/docs`
- [ ] Frontend carrega sem erros de rede
- [ ] TypeScript sem warnings (`strict: true`)
- [ ] Componentes reutilizáveis isolados
- [ ] Comentários em código complexo
- [ ] Commit message descritiva

---

## 🚨 Problemas Comuns

### Erro: CORS Origin not allowed
**Solução:**
```python
# Adicionar frontend URL ao CORS no main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Erro: Port 4200 already in use
```bash
# Encontrar processo usando port
lsof -i :4200

# Matar processo
kill -9 <PID>

# Ou usar porta diferente
ng serve --port 4201
```

### Erro: Module not found
```bash
# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install
```

### Frontend não conecta no backend
```typescript
// Verificar URL em shared/user.service.ts
private apiUrl = 'http://localhost:8000/api/users'; // Correto

// Debug - adicionar logs
this.http.get(this.apiUrl).subscribe(
  data => console.log('Success:', data),
  error => console.error('Error:', error)
);
```

---

**Última atualização:** Junho 2026
