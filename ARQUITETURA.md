# ARQUITETURA E GUIA TÉCNICO - FeedRH

## 📐 Arquitetura Detalhada

### 1. Frontend - Angular 17

#### Estrutura de Camadas

```
app/
├── core/                    # Serviços essenciais e guards
│   ├── auth.guard.ts       # Proteção de rotas
│   └── auth.service.ts     # Gerenciamento de autenticação
│
├── shared/                  # Serviços compartilhados
│   ├── user.service.ts     # Operações com usuários
│   ├── empresa.service.ts  # Operações com empresas
│   └── vaga.service.ts     # Operações com vagas
│
├── features/               # Componentes por funcionalidade
│   ├── login/             # Autenticação
│   ├── dashboard/         # Dashboard principal
│   ├── job-form/          # Criação de vagas
│   ├── user-management/   # Gestão de usuários
│   ├── decision-panel/    # Painel de decisão
│   └── report/            # Relatórios
│
├── app.component.ts        # Componente raiz com navbar
├── app.routes.ts          # Definição de rotas
├── app.config.ts          # Configuração global
└── styles.css             # Estilos globais com Tailwind
```

#### Fluxo de Autenticação

```
Usuario insere credenciais
         ↓
[LoginComponent]
         ↓
AuthService.login(email, password)
         ↓
POST /api/auth/login
         ↓
Backend valida e retorna token
         ↓
AuthService armazena token (localStorage)
         ↓
Redireciona para /dashboard
         ↓
AuthGuard valida token nas próximas rotas
```

#### Padrão de Serviço HTTP

```typescript
// shared/user.service.ts
@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:8000/api/users';

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(user: User): Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }
}
```

#### Componentes Standalone

Todos os componentes utilizam a abordagem **standalone**:

```typescript
@Component({
  selector: 'app-exemplo',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './exemplo.component.html',
  styleUrls: ['./exemplo.component.css']
})
export class ExemploComponent {
  // Componente funcionando como módulo independente
}
```

**Benefícios:**
- ✅ Sem necessidade de NgModule
- ✅ Menor bundle size
- ✅ Mais fácil de testar
- ✅ Composição explícita de dependências

---

### 2. Backend - FastAPI

#### Estrutura Conceitual

```
main.py
├── Database Setup
│   ├── create_engine()
│   ├── SessionLocal
│   └── Base (declarative_base)
│
├── Models (SQLAlchemy)
│   ├── UserModel
│   ├── EmpresaModel
│   └── VagaModel
│
├── Schemas (Pydantic)
│   ├── UserSchema
│   ├── EmpresaSchema
│   └── VagaSchema
│
├── Routes
│   ├── POST /api/auth/login
│   ├── GET  /api/users
│   ├── POST /api/vagas
│   └── ...
│
└── Middleware
    └── CORSMiddleware
```

#### Modelo de Requisição/Resposta

```python
# Request
class UserCreate(BaseModel):
    nome: str
    email: str
    empresa: str
    perfil: str  # "RH" ou "GESTOR"
    senha: str

    @model_validator(mode='after')
    def validate_perfil(self):
        if self.perfil not in ['RH', 'GESTOR']:
            raise ValueError('Perfil inválido')
        return self

# Response
class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    empresa: str
    perfil: str

    model_config = ConfigDict(from_attributes=True)
```

#### Função de Dependência (Dependency Injection)

```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()
```

#### Tratamento de Erros

```python
@app.post("/api/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    # Verificar email duplicado
    if db.query(UserModel).filter(UserModel.email == user.email).first():
        raise HTTPException(
            status_code=400,
            detail="Email já cadastrado"
        )
    
    # Criar usuário
    db_user = UserModel(
        nome=user.nome,
        email=user.email,
        empresa=user.empresa,
        perfil=user.perfil,
        senha_hash=hash_senha(user.senha)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
```

---

### 3. Banco de Dados

#### Esquema SQLite

```sql
-- Tabela de Usuários
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR NOT NULL,
    email VARCHAR UNIQUE NOT NULL,
    empresa VARCHAR NOT NULL,
    perfil VARCHAR NOT NULL,  -- "RH" ou "GESTOR"
    senha_hash VARCHAR NOT NULL
);

-- Tabela de Empresas
CREATE TABLE empresas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome VARCHAR UNIQUE NOT NULL
);

-- Tabela de Vagas
CREATE TABLE vagas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cargo VARCHAR NOT NULL,
    data_abertura DATETIME NOT NULL,
    empresa_destinada VARCHAR NOT NULL,
    senioridade VARCHAR NOT NULL,
    tipo VARCHAR NOT NULL,  -- "Nova posição" ou "Substituição"
    profissional_substituido VARCHAR,
    justificativa_substituicao VARCHAR,
    solicitante_id INTEGER NOT NULL,
    status_decisao_diretoria VARCHAR DEFAULT 'Pendente',
    quantidade_congelamentos INTEGER DEFAULT 0,
    etapa_funil INTEGER DEFAULT 1,
    data_finalizacao DATETIME
);
```

#### Relacionamentos

```
Users (1) ──── (N) Vagas
  └─ solicitante_id

Empresas (1) ──── (N) Users
  └─ empresa (FK)

Empresas (1) ──── (N) Vagas
  └─ empresa_destinada (FK)
```

---

### 4. Comunicação Frontend-Backend

#### Fluxo de Dados

```
[Frontend - Angular]
       │
       │ HTTP Request (JSON)
       ↓
[Backend - FastAPI]
       │
       │ Validação (Pydantic)
       ↓
   [Database - SQLite]
       │
       ↓ Query Result
[Backend - FastAPI]
       │
       │ HTTP Response (JSON)
       ↓
[Frontend - Angular]
       │
       │ Subscribe a Observable
       ↓
  [Update Component]
```

#### Exemplo Prático: Criar Nova Vaga

**Frontend:**
```typescript
// job-form.component.ts
createVaga() {
  const novaVaga = {
    cargo: this.form.get('cargo')?.value,
    empresa_destinada: this.form.get('empresa')?.value,
    // ... outros campos
  };
  
  this.vagaService.create(novaVaga).subscribe(
    (vaga) => {
      console.log('Vaga criada:', vaga);
      this.router.navigate(['/dashboard']);
    },
    (error) => {
      console.error('Erro ao criar vaga:', error);
    }
  );
}
```

**Backend:**
```python
@app.post("/api/vagas", response_model=VagaSchema)
def create_vaga(vaga: VagaCreate, db: Session = Depends(get_db)):
    db_vaga = VagaModel(**vaga.dict())
    db.add(db_vaga)
    db.commit()
    db.refresh(db_vaga)
    return db_vaga
```

---

## 🔄 Ciclos de Vida

### Ciclo de Vida Angular (OnInit)

```typescript
export class MinhaComponent implements OnInit {
  dados: any[] = [];

  constructor(private meuService: MeuService) {}

  ngOnInit() {
    // Executado após a construção
    // Perfeito para carregar dados
    this.meuService.obter().subscribe(
      (resultado) => {
        this.dados = resultado;
      }
    );
  }

  ngOnDestroy() {
    // Limpeza de resources (opcional)
  }
}
```

### Ciclo de Vida FastAPI

```python
@app.on_event("startup")
async def startup_event():
    print("FastAPI iniciando...")
    # Inicializar recursos

@app.on_event("shutdown")
async def shutdown_event():
    print("FastAPI encerrando...")
    # Limpar recursos
```

---

## 🎨 Estilos e Temas

### Configuração Tailwind CSS

**tailwind.config.js:**
```javascript
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'rh-purple': '#6B46C1',
        'rh-neon': '#00D9FF',
        'rh-gray-purple': '#F3F0FF'
      }
    }
  }
}
```

### Variáveis CSS Globais

Em `styles.css`:
```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

:root {
  --color-primary: #6B46C1;
  --color-secondary: #00D9FF;
}
```

---

## 🚀 Pipeline de Deploy

### Local Development
```bash
docker-compose up --build    # Ambos containers
npm start (frontend)         # Frontend em desenvolvimento
fastapi run (backend)        # Backend em desenvolvimento
```

### Build para Produção

**Frontend:**
```bash
npm run build                # Build otimizado
ng build --configuration production
```

**Backend:**
```bash
docker build -t feedrh-backend:latest ./backend
docker push registry/feedrh-backend:latest
```

---

## 📊 Monitoramento e Logs

### Acessar Logs

```bash
# Frontend
docker logs feedrh-frontend -f

# Backend  
docker logs feedrh-backend -f

# Ambos
docker-compose logs -f
```

### Endpoints de Health Check

```typescript
// Frontend - verificar backend
this.http.get('http://localhost:8000/health')
```

```python
# Backend - health endpoint
@app.get("/health")
def health():
    return {"status": "ok"}
```

---

## ✅ Checklist de Desenvolvimento

### Antes de Commitar

- [ ] Código segue padrões do projeto
- [ ] Testes passando
- [ ] Sem console.log() em produção
- [ ] Tipagem completa (TypeScript)
- [ ] Validação no frontend e backend
- [ ] CORS configurado corretamente
- [ ] Variáveis de ambiente definidas

### Ao Adicionar Feature

- [ ] Componente criado
- [ ] Rota adicionada em `app.routes.ts`
- [ ] Serviço criado (se necessário)
- [ ] Testes unitários
- [ ] Documentação atualizada
- [ ] Endpoint backend implementado
- [ ] Validação Pydantic
- [ ] Tratamento de erros

---

## 🔐 Considerações de Segurança

### Autenticação
- ✅ Senhas hasheadas com SHA-256
- ⚠️ TODO: Implementar JWT tokens
- ⚠️ TODO: Expiração de sessão

### Validação
- ✅ Pydantic valida entrada no backend
- ✅ Guards protegem rotas no frontend
- ⚠️ TODO: Rate limiting

### CORS
- ✅ Habilitado apenas para localhost
- ⚠️ TODO: Configurar origin específica em produção

### Banco de Dados
- ✅ SQLAlchemy previne SQL injection
- ✅ ORM abstrai queries SQL

---

## 📝 Boas Práticas

### Clean Code
```typescript
// ❌ Ruim
function process(data: any): any {
  let result = [];
  for (let i = 0; i < data.length; i++) {
    if (data[i].active) {
      result.push(data[i].name);
    }
  }
  return result;
}

// ✅ Bom
function getActiveUserNames(users: User[]): string[] {
  return users
    .filter(user => user.active)
    .map(user => user.name);
}
```

### Reatividade
```typescript
// ❌ Subscription não gerenciada (memory leak)
this.service.getData().subscribe(data => {
  this.data = data;
});

// ✅ Usando OnDestroy
private destroy$ = new Subject<void>();

ngOnInit() {
  this.service.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => this.data = data);
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

---

**Última atualização:** Junho 2026
