from sqlalchemy.orm import Session
from models.product import Product
from schemas.product import ProductCreate


def create_product(db: Session, product: ProductCreate):
    db_product = Product(**product.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product


def get_products(db: Session, search: str = "", category: str = ""):
    query = db.query(Product)

    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))

    if category:
        query = query.filter(Product.category == category)

    return query.all()


def get_categories(db: Session):
    rows = db.query(Product.category).distinct().all()
    return [r[0] for r in rows if r[0]]