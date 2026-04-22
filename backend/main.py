from fastapi import FastAPI, Depends, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base

from models.product import Product
from models.user import User

import crud.product as product_crud
import crud.user as user_crud
import schemas.product as product_schemas
import schemas.user as user_schemas
from auth import create_access_token, get_current_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Auth ───────────────────────────────────────────────────────────────────
@app.post("/auth/register", response_model=user_schemas.UserResponse)
def register(user: user_schemas.UserCreate, db: Session = Depends(get_db)):
    if user_crud.get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return user_crud.create_user(db, user)


@app.post("/auth/login", response_model=user_schemas.TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = user_crud.authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@app.get("/auth/me", response_model=user_schemas.UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


# ── Products ───────────────────────────────────────────────────────────────
@app.post("/products", response_model=product_schemas.ProductResponse)
def create_product(
    product: product_schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return product_crud.create_product(db, product)


# !! Must be above /products
@app.get("/products/categories")
def get_categories(db: Session = Depends(get_db)):
    return product_crud.get_categories(db)


@app.get("/products", response_model=list[product_schemas.ProductResponse])
def get_products(
    search: str = Query(default=""),
    category: str = Query(default=""),
    db: Session = Depends(get_db),
):
    return product_crud.get_products(db, search=search, category=category)