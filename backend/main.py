from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel, model_validator
from typing import List, Optional
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from fastapi.middleware.cors import CORSMiddleware
import hashlib

# Database Setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./feedrh.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def hash_senha(senha: str) -> str:
    return hashlib.sha256(senha.encode()).hexdigest()

# SQLAlchemy Models
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    empresa = Column(String)
    perfil = Column(String)  # "RH" ou "GESTOR"
    senha_hash = Column(String)

class EmpresaModel(Base):
    __tablename__ = "empresas"
    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, index=True)

class VagaModel(Base):
    __tablename__ = "vagas"
    id = Column(Integer, primary_key=True, index=True)
    cargo = Column(String)
    data_abertura = Column(DateTime, default=datetime.utcnow)
    empresa_destinada = Column(String)
    senioridade = Column(String)
    tipo = Column(String)  # "Nova posição" ou "Substituição"
    profissional_substituido = Column(String, nullable=True)
    justificativa_substituicao = Column(String, nullable=True)
    solicitante_id = Column(Integer)
    status_decisao_diretoria = Column(String, default="Pendente")
    quantidade_congelamentos = Column(Integer, default=0)
    etapa_funil = Column(Integer, default=1)
    data_finalizacao = Column(DateTime, nullable=True)

Base.metadata.create_all(bind=engine)

def garantir_colunas_vagas():
    with engine.connect() as connection:
        colunas = [row[1] for row in connection.exec_driver_sql("PRAGMA table_info(vagas)").fetchall()]
        if "quantidade_congelamentos" not in colunas:
            connection.exec_driver_sql("ALTER TABLE vagas ADD COLUMN quantidade_congelamentos INTEGER DEFAULT 0")
            connection.commit()
        connection.exec_driver_sql(
            "UPDATE vagas SET quantidade_congelamentos = 1 "
            "WHERE status_decisao_diretoria = 'Congelada' "
            "AND (quantidade_congelamentos IS NULL OR quantidade_congelamentos = 0)"
        )
        connection.commit()

garantir_colunas_vagas()

# Pydantic Schemas
class LoginRequest(BaseModel):
    email: str
    senha: str

class LoginResponse(BaseModel):
    id: int
    nome: str
    email: str
    empresa: str
    perfil: str

class UserCreate(BaseModel):
    nome: str
    email: str
    empresa: str
    perfil: str  # "RH" ou "GESTOR"
    senha: str

class UserUpdate(BaseModel):
    nome: str
    email: str
    empresa: str
    perfil: str

class UserResponse(BaseModel):
    id: int
    nome: str
    email: str
    empresa: str
    perfil: str

    class Config:
        from_attributes = True

class EmpresaCreate(BaseModel):
    nome: str

class EmpresaUpdate(BaseModel):
    nome: str

class EmpresaResponse(BaseModel):
    id: int
    nome: str

    class Config:
        from_attributes = True

class VagaCreate(BaseModel):
    cargo: str
    empresa_destinada: str
    senioridade: str
    tipo: str
    profissional_substituido: Optional[str] = None
    justificativa_substituicao: Optional[str] = None

    @model_validator(mode='after')
    def check_substituicao(self) -> 'VagaCreate':
        if self.tipo == "Substituição":
            if not self.profissional_substituido or not self.profissional_substituido.strip():
                raise ValueError("O profissional substituído é obrigatório para vagas de Substituição.")
            if not self.justificativa_substituicao or not self.justificativa_substituicao.strip():
                raise ValueError("A justificativa é obrigatória para vagas de Substituição.")
        return self

class VagaResponse(BaseModel):
    id: int
    cargo: str
    data_abertura: datetime
    empresa_destinada: str
    senioridade: str
    tipo: str
    profissional_substituido: Optional[str] = None
    justificativa_substituicao: Optional[str] = None
    solicitante_id: int
    status_decisao_diretoria: str
    quantidade_congelamentos: int = 0
    etapa_funil: int
    data_finalizacao: Optional[datetime] = None
    posicao_fila_rh: Optional[int] = None

    class Config:
        from_attributes = True

class DecisaoDiretoriaUpdate(BaseModel):
    status: str

class EtapaFunilUpdate(BaseModel):
    etapa: int

# FastAPI App
app = FastAPI(title="FeedRh API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth Dependency via header X-User-Id
def get_current_user(x_user_id: str = Header(...), db: Session = Depends(get_db)):
    try:
        user_id = int(x_user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="X-User-Id header deve ser um número inteiro")
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    return user

def require_rh(current_user: UserModel = Depends(get_current_user)):
    if current_user.perfil != "RH":
        raise HTTPException(status_code=403, detail="Acesso negado. Apenas usuários do RH possuem acesso a esta ação.")
    return current_user

def preencher_posicoes_fila_rh(db: Session, vagas: List[VagaModel]) -> List[VagaModel]:
    fila_rh = (
        db.query(VagaModel)
        .filter(VagaModel.status_decisao_diretoria == "Pendente")
        .order_by(VagaModel.data_abertura.asc(), VagaModel.id.asc())
        .all()
    )
    posicoes = {vaga.id: indice for indice, vaga in enumerate(fila_rh, start=1)}
    for vaga in vagas:
        vaga.posicao_fila_rh = posicoes.get(vaga.id)
    return vagas

def normalizar_nome_empresa(nome: str) -> str:
    return " ".join(nome.strip().split())

def validar_nome_empresa(nome: str) -> str:
    nome_normalizado = normalizar_nome_empresa(nome)
    if len(nome_normalizado) < 2:
        raise HTTPException(status_code=400, detail="Informe um nome de empresa válido")
    return nome_normalizado

def buscar_empresa_por_nome(db: Session, nome: str):
    return db.query(EmpresaModel).filter(EmpresaModel.nome.ilike(nome)).first()

def validar_dados_usuario(db: Session, nome: str, email: str, empresa: str, perfil: str, user_id_ignorar: Optional[int] = None):
    nome_normalizado = " ".join(nome.strip().split())
    email_normalizado = email.strip().lower()
    empresa_normalizada = normalizar_nome_empresa(empresa)

    if len(nome_normalizado) < 2:
        raise HTTPException(status_code=400, detail="Informe um nome de usuário válido")
    if "@" not in email_normalizado:
        raise HTTPException(status_code=400, detail="Informe um e-mail válido")
    if perfil not in ["RH", "GESTOR"]:
        raise HTTPException(status_code=400, detail="Perfil deve ser 'RH' ou 'GESTOR'")
    if not buscar_empresa_por_nome(db, empresa_normalizada):
        raise HTTPException(status_code=400, detail="Empresa não cadastrada")

    email_query = db.query(UserModel).filter(UserModel.email.ilike(email_normalizado))
    if user_id_ignorar is not None:
        email_query = email_query.filter(UserModel.id != user_id_ignorar)
    if email_query.first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")

    return nome_normalizado, email_normalizado, empresa_normalizada, perfil

def criar_empresa_se_nao_existir(db: Session, nome: str):
    nome_normalizado = normalizar_nome_empresa(nome)
    empresa = buscar_empresa_por_nome(db, nome_normalizado)
    if empresa:
        return empresa
    empresa = EmpresaModel(nome=nome_normalizado)
    db.add(empresa)
    db.commit()
    db.refresh(empresa)
    return empresa

# Seed: Delete DB on startup to recreate with senha_hash column
@app.on_event("startup")
def startup_event():
    db = SessionLocal()
    if not db.query(EmpresaModel).first():
        empresas_padrao = ["Elevare", "Ora Empresas", "Mercado do Provedor", "Mercado do Construtor", "Outra"]
        for empresa in empresas_padrao:
            criar_empresa_se_nao_existir(db, empresa)

    if not db.query(UserModel).first():
        rh_user = UserModel(
            nome="Fernanda Silva",
            email="rh@feedrh.com",
            empresa="Elevare",
            perfil="RH",
            senha_hash=hash_senha("rh@123")
        )
        gestor_user = UserModel(
            nome="Carlos Souza",
            email="gestor@feedrh.com",
            empresa="Ora Empresas",
            perfil="GESTOR",
            senha_hash=hash_senha("gestor@123")
        )
        db.add(rh_user)
        db.add(gestor_user)
        db.commit()
    db.close()

# --- Routes ---

@app.post("/auth/login", response_model=LoginResponse)
def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    email = credentials.email.strip().lower()
    user = db.query(UserModel).filter(UserModel.email.ilike(email)).first()
    if not user or user.senha_hash != hash_senha(credentials.senha):
        raise HTTPException(status_code=401, detail="E-mail ou senha inválidos.")
    return LoginResponse(
        id=user.id,
        nome=user.nome,
        email=user.email,
        empresa=user.empresa,
        perfil=user.perfil
    )

@app.post("/users", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    nome_normalizado, email_normalizado, empresa_normalizada, perfil = validar_dados_usuario(
        db,
        user.nome,
        user.email,
        user.empresa,
        user.perfil
    )
    if not user.senha or len(user.senha) < 6:
        raise HTTPException(status_code=400, detail="A senha deve ter no mínimo 6 caracteres")

    db_user = UserModel(
        nome=nome_normalizado,
        email=email_normalizado,
        empresa=empresa_normalizada,
        perfil=perfil,
        senha_hash=hash_senha(user.senha)
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users", response_model=List[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    return db.query(UserModel).all()

@app.patch("/users/{user_id}", response_model=UserResponse)
def update_user(user_id: int, update: UserUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")

    nome_normalizado, email_normalizado, empresa_normalizada, perfil = validar_dados_usuario(
        db,
        update.nome,
        update.email,
        update.empresa,
        update.perfil,
        user_id_ignorar=user_id
    )

    if db_user.perfil == "RH" and perfil != "RH":
        total_rh = db.query(UserModel).filter(UserModel.perfil == "RH").count()
        if total_rh <= 1:
            raise HTTPException(status_code=400, detail="Não é possível remover o último usuário RH")
        if db_user.id == current_user.id:
            raise HTTPException(status_code=400, detail="Não é possível remover seu próprio acesso de RH")

    db_user.nome = nome_normalizado
    db_user.email = email_normalizado
    db_user.empresa = empresa_normalizada
    db_user.perfil = perfil
    db.commit()
    db.refresh(db_user)
    return db_user

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if db_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Não é possível apagar sua própria conta")
    if db_user.perfil == "RH":
        total_rh = db.query(UserModel).filter(UserModel.perfil == "RH").count()
        if total_rh <= 1:
            raise HTTPException(status_code=400, detail="Não é possível apagar o último usuário RH")

    db.delete(db_user)
    db.commit()
    return {"detail": "Usuário apagado com sucesso"}

@app.get("/empresas", response_model=List[EmpresaResponse])
def get_empresas(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    return db.query(EmpresaModel).order_by(EmpresaModel.nome.asc()).all()

@app.post("/empresas", response_model=EmpresaResponse)
def create_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    nome_normalizado = validar_nome_empresa(empresa.nome)
    if buscar_empresa_por_nome(db, nome_normalizado):
        raise HTTPException(status_code=400, detail="Empresa já cadastrada")
    db_empresa = EmpresaModel(nome=nome_normalizado)
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@app.patch("/empresas/{empresa_id}", response_model=EmpresaResponse)
def update_empresa(empresa_id: int, update: EmpresaUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    db_empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    nome_normalizado = validar_nome_empresa(update.nome)
    empresa_existente = buscar_empresa_por_nome(db, nome_normalizado)
    if empresa_existente and empresa_existente.id != empresa_id:
        raise HTTPException(status_code=400, detail="Empresa já cadastrada")

    nome_anterior = db_empresa.nome
    db_empresa.nome = nome_normalizado
    db.query(UserModel).filter(UserModel.empresa == nome_anterior).update(
        {UserModel.empresa: nome_normalizado},
        synchronize_session=False
    )
    db.query(VagaModel).filter(VagaModel.empresa_destinada == nome_anterior).update(
        {VagaModel.empresa_destinada: nome_normalizado},
        synchronize_session=False
    )
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

@app.delete("/empresas/{empresa_id}")
def delete_empresa(empresa_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    db_empresa = db.query(EmpresaModel).filter(EmpresaModel.id == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    usuarios_vinculados = db.query(UserModel).filter(UserModel.empresa == db_empresa.nome).count()
    vagas_vinculadas = db.query(VagaModel).filter(VagaModel.empresa_destinada == db_empresa.nome).count()
    if usuarios_vinculados or vagas_vinculadas:
        raise HTTPException(
            status_code=400,
            detail="Empresa possui usuários ou vagas vinculadas. Edite o nome em vez de apagar."
        )

    db.delete(db_empresa)
    db.commit()
    return {"detail": "Empresa apagada com sucesso"}

@app.post("/vagas", response_model=VagaResponse)
def create_vaga(vaga: VagaCreate, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    empresa_destinada = normalizar_nome_empresa(vaga.empresa_destinada)
    if not buscar_empresa_por_nome(db, empresa_destinada):
        raise HTTPException(status_code=400, detail="Empresa destinada inválida")
    db_vaga = VagaModel(
        cargo=vaga.cargo,
        empresa_destinada=empresa_destinada,
        senioridade=vaga.senioridade,
        tipo=vaga.tipo,
        profissional_substituido=vaga.profissional_substituido,
        justificativa_substituicao=vaga.justificativa_substituicao,
        solicitante_id=current_user.id,
        status_decisao_diretoria="Pendente",
        quantidade_congelamentos=0,
        etapa_funil=1
    )
    db.add(db_vaga)
    db.commit()
    db.refresh(db_vaga)
    preencher_posicoes_fila_rh(db, [db_vaga])
    return db_vaga

@app.get("/vagas", response_model=List[VagaResponse])
def get_vagas(db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_user)):
    if current_user.perfil == "RH":
        vagas = db.query(VagaModel).order_by(VagaModel.data_abertura.asc(), VagaModel.id.asc()).all()
        return preencher_posicoes_fila_rh(db, vagas)
    vagas = (
        db.query(VagaModel)
        .filter(VagaModel.solicitante_id == current_user.id)
        .order_by(VagaModel.data_abertura.asc(), VagaModel.id.asc())
        .all()
    )
    return preencher_posicoes_fila_rh(db, vagas)

@app.patch("/vagas/{vaga_id}/decisao-diretoria", response_model=VagaResponse)
def update_decisao_diretoria(vaga_id: int, update: DecisaoDiretoriaUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    db_vaga = db.query(VagaModel).filter(VagaModel.id == vaga_id).first()
    if not db_vaga:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    if update.status not in ["Pendente", "Aprovada", "Congelada", "Negada"]:
        raise HTTPException(status_code=400, detail="Status de decisão inválido")
    status_anterior = db_vaga.status_decisao_diretoria
    db_vaga.status_decisao_diretoria = update.status
    if update.status == "Congelada" and status_anterior != "Congelada":
        db_vaga.quantidade_congelamentos = (db_vaga.quantidade_congelamentos or 0) + 1
    db.commit()
    db.refresh(db_vaga)
    preencher_posicoes_fila_rh(db, [db_vaga])
    return db_vaga

@app.patch("/vagas/{vaga_id}/etapa-funil", response_model=VagaResponse)
def update_etapa_funil(vaga_id: int, update: EtapaFunilUpdate, db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    db_vaga = db.query(VagaModel).filter(VagaModel.id == vaga_id).first()
    if not db_vaga:
        raise HTTPException(status_code=404, detail="Vaga não encontrada")
    if update.etapa < 1 or update.etapa > 9:
        raise HTTPException(status_code=400, detail="Etapa deve ser de 1 a 9")
    db_vaga.etapa_funil = update.etapa
    if update.etapa == 9:
        db_vaga.data_finalizacao = datetime.utcnow()
    else:
        db_vaga.data_finalizacao = None
    db.commit()
    db.refresh(db_vaga)
    preencher_posicoes_fila_rh(db, [db_vaga])
    return db_vaga

@app.get("/vagas/relatorio")
def get_relatorio(db: Session = Depends(get_db), current_user: UserModel = Depends(require_rh)):
    vagas = db.query(VagaModel).all()
    por_empresa, por_senioridade, por_etapa = {}, {}, {}
    etapas_nomes = {
        1: "Fila de Espera", 2: "Divulgação", 3: "Triagem",
        4: "Entrevista Inicial", 5: "Testes Psicológicos", 6: "Parecer Psicológico",
        7: "Entrevista com Gestor", 8: "Aguardando Retorno", 9: "Finalizada"
    }
    finalizadas_no_mes = 0
    now = datetime.utcnow()
    for v in vagas:
        por_empresa[v.empresa_destinada] = por_empresa.get(v.empresa_destinada, 0) + 1
        por_senioridade[v.senioridade] = por_senioridade.get(v.senioridade, 0) + 1
        nome_etapa = etapas_nomes.get(v.etapa_funil, "Desconhecida")
        por_etapa[nome_etapa] = por_etapa.get(nome_etapa, 0) + 1
        if v.etapa_funil == 9 and v.data_finalizacao:
            if v.data_finalizacao.year == now.year and v.data_finalizacao.month == now.month:
                finalizadas_no_mes += 1
    return {
        "total_abertas": len(vagas),
        "total_aprovadas": sum(1 for v in vagas if v.status_decisao_diretoria == "Aprovada"),
        "total_congeladas": sum(1 for v in vagas if v.status_decisao_diretoria == "Congelada"),
        "total_negadas": sum(1 for v in vagas if v.status_decisao_diretoria == "Negada"),
        "total_finalizadas_no_mes": finalizadas_no_mes,
        "agrupado_por_empresa": por_empresa,
        "agrupado_por_senioridade": por_senioridade,
        "agrupado_por_etapa": por_etapa
    }
