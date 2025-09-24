from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from models.product import Product, ProductCreate, ProductUpdate, ProductResponse, ProductCategory, ProductStatus
from models.user import User, UserRole
from routes.auth import get_current_user, get_admin_user
from database import get_database, COLLECTIONS
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/products", tags=["Products"])

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    category: Optional[ProductCategory] = None,
    status: Optional[ProductStatus] = None,
    search: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all products with optional filtering"""
    try:
        db = get_database()
        
        # Build filter query
        filter_query = {}
        if category:
            filter_query["category"] = category
        if status:
            filter_query["status"] = status
        else:
            # Only show active products by default for public access
            filter_query["status"] = ProductStatus.ACTIVE
            
        if search:
            filter_query["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}}
            ]
        
        # Get products
        cursor = db[COLLECTIONS['products']].find(filter_query).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
        
        return [ProductResponse(**product) for product in products]
        
    except Exception as e:
        logger.error(f"Error fetching products: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch products"
        )

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: str):
    """Get single product by ID"""
    try:
        db = get_database()
        product = await db[COLLECTIONS['products']].find_one({"id": product_id})
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return ProductResponse(**product)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching product {product_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch product"
        )

@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    admin_user: User = Depends(get_admin_user)
):
    """Create new product (Admin only)"""
    try:
        db = get_database()
        
        # Check if product with same name exists
        existing_product = await db[COLLECTIONS['products']].find_one({"name": product_data.name})
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this name already exists"
            )
        
        # Create product
        product = Product(**product_data.dict())
        await db[COLLECTIONS['products']].insert_one(product.dict())
        
        return ProductResponse(**product.dict())
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating product: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_data: ProductUpdate,
    admin_user: User = Depends(get_admin_user)
):
    """Update product (Admin only)"""
    try:
        db = get_database()
        
        # Check if product exists
        existing_product = await db[COLLECTIONS['products']].find_one({"id": product_id})
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Update product
        update_data = product_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db[COLLECTIONS['products']].update_one(
            {"id": product_id},
            {"$set": update_data}
        )
        
        # Get updated product
        updated_product = await db[COLLECTIONS['products']].find_one({"id": product_id})
        return ProductResponse(**updated_product)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating product {product_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Delete product (Admin only)"""
    try:
        db = get_database()
        
        # Check if product exists
        existing_product = await db[COLLECTIONS['products']].find_one({"id": product_id})
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Delete product
        result = await db[COLLECTIONS['products']].delete_one({"id": product_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete product"
            )
        
        return {"message": "Product deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting product {product_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        )

@router.patch("/{product_id}/stock")
async def update_stock(
    product_id: str,
    stock_quantity: int,
    admin_user: User = Depends(get_admin_user)
):
    """Update product stock (Admin only)"""
    try:
        db = get_database()
        
        # Update stock
        result = await db[COLLECTIONS['products']].update_one(
            {"id": product_id},
            {
                "$set": {
                    "stock_quantity": stock_quantity,
                    "updated_at": datetime.utcnow(),
                    "is_available": stock_quantity > 0,
                    "status": ProductStatus.ACTIVE if stock_quantity > 0 else ProductStatus.OUT_OF_STOCK
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return {"message": "Stock updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating stock for product {product_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update stock"
        )
