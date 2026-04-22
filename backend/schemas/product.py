from pydantic import BaseModel

from typing import Optional
 
 
class ProductBase(BaseModel):
    name: str
    price: float
    category: str
    description: Optional[str] = ""
    image_url: Optional[str] = ""
 
 
class ProductCreate(ProductBase):
    pass
 
 
class ProductResponse(ProductBase):
    id: int
 
    class Config:
        from_attributes = True