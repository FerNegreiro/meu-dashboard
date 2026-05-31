import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

from jose import jwt
from passlib.context import CryptContext

# =========================
# CONFIGURAÇÃO DE BANCO DE DADOS E SEGURANÇA
# =========================
# Puxa a URL do Render. Se não achar (no teu PC), usa o localhost
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:123456@localhost/saas_dashboard")

# O Render fornece 'postgres://', mas o SQLAlchemy exige 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Puxa a chave secreta do Render, ou usa a padrão local
SECRET_KEY = os.getenv("SECRET_KEY", "MEU_SEGREDO_SUPER_FORTE")
ALGORITHM = "HS256"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app = FastAPI()

# =========================
# CONFIGURAÇÃO DE SEGURANÇA (CORS)
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.1.5:3000",
        "*" # Permite que o Netlify se ligue à API mais tarde
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# GESTOR DE BASE DE DADOS
# =========================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# =========================
# MODELS
# =========================
class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True)
    password = Column(String)

class OrderModel(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True)
    customer = Column(String)
    product = Column(String)
    price = Column(String)
    status = Column(String)

class CustomerModel(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String, unique=True)
    plan = Column(String)

class SettingsModel(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True)
    company_name = Column(String, default="Metric Flow")
    support_email = Column(String, default="contato@email.com")

Base.metadata.create_all(bind=engine)

# =========================
# SCHEMAS
# =========================
class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class Order(BaseModel):
    customer: str
    product: str
    price: str
    status: str

class Customer(BaseModel):
    name: str
    email: str
    plan: str

class SettingsSchema(BaseModel):
    company_name: str
    support_email: str

# =========================
# AUTH
# =========================
@app.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Usuário já existe")
    hashed_password = pwd_context.hash(user.password)
    new_user = UserModel(email=user.email, password=hashed_password)
    db.add(new_user)
    db.commit()
    return {"message": "Usuário criado"}

@app.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Email inválido")
    valid_password = pwd_context.verify(user.password, db_user.password)
    if not valid_password:
        raise HTTPException(status_code=401, detail="Senha inválida")
    token = jwt.encode({"sub": db_user.email}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token}

# =========================
# ORDERS CRUD
# =========================
@app.get("/orders")
def get_orders(db: Session = Depends(get_db)):
    return db.query(OrderModel).all()

@app.post("/orders")
def create_order(order: Order, db: Session = Depends(get_db)):
    new_order = OrderModel(**order.dict())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@app.put("/orders/{order_id}")
def update_order(order_id: int, updated_order: Order, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    order.customer = updated_order.customer
    order.product = updated_order.product
    order.price = updated_order.price
    order.status = updated_order.status
    db.commit()
    return order

@app.delete("/orders/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")
    db.delete(order)
    db.commit()
    return {"message": "Pedido removido"}

# =========================
# CUSTOMERS CRUD
# =========================
@app.get("/customers")
def get_customers(db: Session = Depends(get_db)):
    return db.query(CustomerModel).all()

@app.post("/customers")
def create_customer(customer: Customer, db: Session = Depends(get_db)):
    existing = db.query(CustomerModel).filter(CustomerModel.email == customer.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Este email já está registado")
    new_customer = CustomerModel(**customer.dict())
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer

@app.put("/customers/{customer_id}")
def update_customer(customer_id: int, updated_customer: Customer, db: Session = Depends(get_db)):
    customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    customer.name = updated_customer.name
    customer.email = updated_customer.email
    customer.plan = updated_customer.plan
    db.commit()
    return customer

@app.delete("/customers/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Cliente não encontrado")
    db.delete(customer)
    db.commit()
    return {"message": "Cliente removido"}

# =========================
# DASHBOARD / CHART
# =========================
@app.get("/chart")
async def get_chart_data():
    return [
        {"month": "Jan", "sales": 1200},
        {"month": "Feb", "sales": 3000},
        {"month": "Mar", "sales": 5400},
        {"month": "Apr", "sales": 4200},
        {"month": "May", "sales": 8000},
        {"month": "Jun", "sales": 11000},
    ]

# =========================
# CONFIGURAÇÕES (SETTINGS)
# =========================
@app.get("/settings")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel(company_name="Metric Flow", support_email="contato@email.com")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@app.put("/settings")
def update_settings(updated: SettingsSchema, db: Session = Depends(get_db)):
    settings = db.query(SettingsModel).first()
    if not settings:
        settings = SettingsModel()
        db.add(settings)
    
    settings.company_name = updated.company_name
    settings.support_email = updated.support_email
    db.commit()
    db.refresh(settings)
    return settings