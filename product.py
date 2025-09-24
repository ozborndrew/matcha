from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class ProductCategory(str, Enum):
    COFFEE = "coffee"
    PASTRY = "pastry"
    BEVERAGE = "beverage"
    SNACK = "snack"

class ProductStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    OUT_OF_STOCK = "out_of_stock"

class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: ProductCategory
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = []
    allergens: Optional[List[str]] = []
    is_available: bool = True
    stock_quantity: Optional[int] = None
    status: ProductStatus = ProductStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: ProductCategory
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = []
    allergens: Optional[List[str]] = []
    stock_quantity: Optional[int] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[ProductCategory] = None
    image_url: Optional[str] = None
    ingredients: Optional[List[str]] = None
    allergens: Optional[List[str]] = None
    is_available: Optional[bool] = None
    stock_quantity: Optional[int] = None
    status: Optional[ProductStatus] = None

class Product(ProductBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class ProductResponse(Product):
    pass
