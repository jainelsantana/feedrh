# 🚢 DEPLOYMENT E OPERAÇÕES - FeedRH

## 📦 Build e Deploy

### Build Local com Docker

```bash
# Build de ambas as imagens
docker-compose build

# Build de uma imagem específica
docker build --build-arg API_URL=http://localhost:3007 -t feedrh-frontend:latest ./frontend
docker build -t feedrh-backend:latest ./backend

# Executar containers
docker-compose up -d

# Parar containers
docker-compose down

# Ver logs
docker-compose logs -f
```

### Estrutura Docker

**Frontend (Dockerfile)**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Backend (Dockerfile)**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["fastapi", "run", "main.py", "--port", "8000"]
```

### Docker Compose Configuration

```yaml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: feedrh
      POSTGRES_USER: feedrh
      POSTGRES_PASSWORD: feedrh
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U feedrh -d feedrh"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - feedrh-network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./backend:/app
    environment:
      DB_URL: postgresql+psycopg2://feedrh:feedrh@db:5432/feedrh
    depends_on:
      db:
        condition: service_healthy
    networks:
      - feedrh-network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "4200:80"
    depends_on:
      - backend
    networks:
      - feedrh-network

networks:
  feedrh-network:
    driver: bridge

volumes:
  postgres_data:
```

---

## 🌐 Deploy em Produção

### Opção 1: Heroku

```bash
# Login no Heroku
heroku login

# Criar aplicação
heroku create feedrh-app

# Configurar variáveis de ambiente
heroku config:set DB_URL=postgresql://...
heroku config:set SECRET_KEY=your-secret-key

# Deploy
git push heroku main

# Ver logs
heroku logs --tail
```

### Opção 2: AWS EC2

```bash
# Conectar via SSH
ssh -i key.pem ec2-user@your-instance-ip

# Instalar Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Clonar repositório
git clone <repo-url>
cd FeedRH

# Executar com Docker Compose
docker-compose up -d

# Configurar security group para portas 80 e 8000
```

### Opção 3: DigitalOcean App Platform

```bash
# Criar arquivo app.yaml na raiz do projeto
name: feedrh
services:
- name: backend
  github:
    repo: username/feedrh
    branch: main
  build_command: pip install -r requirements.txt
  run_command: fastapi run main.py --port 8080
  http_port: 8080
  envs:
  - key: DB_URL
    value: ${db.connection_string}

- name: frontend
  github:
    repo: username/feedrh
    branch: main
  build_command: npm install && npm run build
  run_command: nginx -g "daemon off;"
  http_port: 80

databases:
- name: postgres
  engine: PG
  version: "14"
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (.github/workflows/deploy.yml)

```yaml
name: Deploy FeedRH

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install frontend dependencies
      run: cd frontend && npm install
    
    - name: Build frontend
      run: cd frontend && npm run build
    
    - name: Lint frontend
      run: cd frontend && npm run lint
    
    - name: Setup Python
      uses: actions/setup-python@v2
      with:
        python-version: '3.11'
    
    - name: Install backend dependencies
      run: cd backend && pip install -r requirements.txt
    
    - name: Lint backend
      run: cd backend && pip install ruff && ruff check .

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to production
      env:
        DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
        DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
        DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
      run: |
        mkdir -p ~/.ssh
        echo "$DEPLOY_KEY" > ~/.ssh/deploy_key
        chmod 600 ~/.ssh/deploy_key
        ssh -i ~/.ssh/deploy_key $DEPLOY_USER@$DEPLOY_HOST "cd /app && git pull && docker-compose up -d"
```

---

## 📊 Monitoramento

### Health Checks

```python
# Adicionar ao backend (main.py)
@app.get("/health")
def health():
    """Endpoint para verificar saúde da aplicação"""
    return {
        "status": "ok",
        "version": "1.0.0",
        "timestamp": datetime.utcnow()
    }

@app.get("/health/ready")
def readiness():
    """Endpoint de readiness (pode aceitar requisições)"""
    try:
        # Verificar conexão com banco de dados
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        return {"status": "ready"}
    except Exception as e:
        return {"status": "not_ready", "error": str(e)}, 503
```

### Logging Estruturado

```python
# Adicionar logging ao backend
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.get("/api/users")
def list_users(db: Session = Depends(get_db)):
    logger.info("Listando usuários")
    try:
        users = db.query(UserModel).all()
        logger.info(f"Retornados {len(users)} usuários")
        return users
    except Exception as e:
        logger.error(f"Erro ao listar usuários: {str(e)}")
        raise HTTPException(status_code=500, detail="Erro interno")
```

### Nginx Access Logs

```nginx
# frontend/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    server {
        listen 80;
        server_name _;

        root /usr/share/nginx/html;
        index index.html;

        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API calls are made directly by Angular using API_URL.
    }
}
```

---

## 🔐 Segurança em Produção

### HTTPS/SSL

```bash
# Gerar certificado auto-assinado (dev)
openssl req -x509 -newkey rsa:4096 -nodes -out cert.pem -keyout key.pem -days 365

# Com Let's Encrypt (prod)
sudo apt-get install certbot nginx-certbot
sudo certbot certonly --nginx -d feedrh.com
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name feedrh.com;

    ssl_certificate /etc/letsencrypt/live/feedrh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/feedrh.com/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HTTP/2 Server Push
    http2_push_manifest on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name feedrh.com;
    return 301 https://$server_name$request_uri;
}
```

### Rate Limiting

```python
# Adicionar ao FastAPI
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.post("/api/auth/login")
@limiter.limit("5/minute")
def login(request: Request, credentials: LoginSchema, db: Session = Depends(get_db)):
    # Login logic
    pass
```

### Environment Variables Sensíveis

```bash
# Usar .env.example para documentar
# .env.example (commitar no repositório)
DB_URL=postgresql+psycopg2://feedrh:feedrh@db:5432/feedrh
SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256
DEBUG=False

# .env (NÃO commitar, adicionar ao .gitignore)
DB_URL=postgresql+psycopg2://user:pass@db:5432/feedrh
SECRET_KEY=super-secret-key-production
JWT_ALGORITHM=HS256
DEBUG=False
```

---

## 📈 Escalabilidade

### Database Migration para PostgreSQL (Produção)

```python
# Alterar connection string
import os
from sqlalchemy import create_engine

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+psycopg2://feedrh:feedrh@localhost:5432/feedrh"
)

# Para PostgreSQL
DATABASE_URL = "postgresql+psycopg2://user:password@localhost:5432/feedrh"

engine = create_engine(DATABASE_URL)
```

### Caching com Redis (Opcional)

```python
from redis import Redis
from fastapi_cache2 import FastAPICache2
from fastapi_cache2.backends.redis import RedisBackend
from fastapi_cache2.decorators import cache

redis = Redis.from_url("redis://localhost")
FastAPICache2.init(RedisBackend(redis), prefix="feedrh")

@app.get("/api/users")
@cache(expire=300)  # Cache por 5 minutos
def list_users(db: Session = Depends(get_db)):
    return db.query(UserModel).all()
```

### Load Balancing

Configure balanceamento no app/servico do backend ou no proxy da plataforma. O Nginx do frontend deve continuar servindo apenas os arquivos estaticos da SPA Angular.

---

## 🔧 Troubleshooting em Produção

### Container não inicia

```bash
# Ver logs detalhados
docker logs feedrh-backend -f

# Executar com modo interativo
docker run -it feedrh-backend:latest bash

# Verificar imagem
docker image inspect feedrh-backend:latest
```

### Reset do banco de dados local

```bash
# Remove containers e volume local do PostgreSQL (perderá dados)
docker-compose down -v
docker-compose up -d --build
```

### Performance lenta

```bash
# Monitorar recursos
docker stats

# Aumentar limits
docker run -m 2g -c 1024 feedrh-backend:latest

# Otimizar query (backend)
# Adicionar indexes ao database
```

---

## 📋 Checklist de Deploy

### Antes do Deploy

- [ ] Todos os testes passando
- [ ] Code review completo
- [ ] Documentação atualizada
- [ ] CHANGELOG preenchido
- [ ] Variáveis de ambiente configuradas
- [ ] Backups do banco de dados
- [ ] Plano de rollback definido

### Durante o Deploy

- [ ] Health checks retornando ok
- [ ] Logs monitorados em tempo real
- [ ] Zero downtime deployment (se possível)
- [ ] CDN cache invalidado
- [ ] DNS propagado

### Após o Deploy

- [ ] Testar funcionalidades críticas
- [ ] Monitorar erros em tempo real
- [ ] Verificar performance (latência, CPU)
- [ ] Notificar stakeholders
- [ ] Documentar mudanças

---

## 📞 Contatos e Escalação

| Papel | Contato | Disponibilidade |
|-------|---------|-----------------|
| DevOps | ops@company.com | 24/7 |
| Backend Lead | backend@company.com | Horário comercial |
| Frontend Lead | frontend@company.com | Horário comercial |
| DBA | dba@company.com | Horário comercial |

---

**Última atualização:** Junho 2026
