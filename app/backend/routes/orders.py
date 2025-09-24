from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from models.order import Order, OrderCreate, OrderUpdate, OrderResponse, OrderStatus, PaymentStatus, OrderType
from models.user import User, UserRole
from routes.auth import get_current_user, get_admin_user
from services.payment_service import PaymentService
from services.notification_service import NotificationService
from database import get_database, COLLECTIONS
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["Orders"])
notification_service = NotificationService()

def calculate_order_totals(order_data: OrderCreate) -> dict:
    """Calculate order totals"""
    subtotal = sum(item.total_price for item in order_data.items)
    delivery_fee = 0.0
    
    if order_data.order_type == OrderType.DELIVERY:
        # Get delivery fee from settings (fallback to default)
        delivery_fee = 50.0 if subtotal < 200.0 else 0.0
    
    total_amount = subtotal + delivery_fee
    
    return {
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total_amount": total_amount
    }

@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Create new order"""
    try:
        db = get_database()
        
        # Calculate totals
        totals = calculate_order_totals(order_data)
        
        # Create order
        order = Order(
            customer_id=current_user.id if current_user else None,
            customer_email=order_data.customer_email or (current_user.email if current_user else None),
            **order_data.dict(),
            **totals
        )
        
        # Insert order to database
        await db[COLLECTIONS['orders']].insert_one(order.dict())
        
        # Send notifications
        try:
            if order.customer_email:
                await notification_service.send_order_confirmation(order)
            await notification_service.send_admin_notification(order)
        except Exception as e:
            logger.warning(f"Failed to send order notifications: {e}")
        
        return OrderResponse(**order.dict())
        
    except Exception as e:
        logger.error(f"Error creating order: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )

@router.post("/{order_id}/payment-intent")
async def create_payment_intent(order_id: str):
    """Create payment intent for order"""
    try:
        db = get_database()
        
        # Get order
        order_data = await db[COLLECTIONS['orders']].find_one({"id": order_id})
        if not order_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order = Order(**order_data)
        
        # Create payment intent
        payment_result = await PaymentService.create_payment_intent(order)
        if not payment_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create payment intent"
            )
        
        # Update order with payment intent ID
        await db[COLLECTIONS['orders']].update_one(
            {"id": order_id},
            {"$set": {"payment_intent_id": payment_result["payment_intent_id"]}}
        )
        
        return payment_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating payment intent for order {order_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create payment intent"
        )

@router.post("/{order_id}/confirm-payment")
async def confirm_payment(order_id: str):
    """Confirm payment for order"""
    try:
        db = get_database()
        
        # Get order
        order_data = await db[COLLECTIONS['orders']].find_one({"id": order_id})
        if not order_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        order = Order(**order_data)
        
        if not order.payment_intent_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No payment intent found for this order"
            )
        
        # Confirm payment with Stripe
        payment_result = await PaymentService.confirm_payment(order.payment_intent_id)
        if not payment_result:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to confirm payment"
            )
        
        # Update order status based on payment
        new_payment_status = PaymentService.get_payment_status_from_stripe_status(payment_result["status"])
        new_order_status = OrderStatus.CONFIRMED if new_payment_status == PaymentStatus.PAID else OrderStatus.PENDING
        
        await db[COLLECTIONS['orders']].update_one(
            {"id": order_id},
            {
                "$set": {
                    "payment_status": new_payment_status,
                    "status": new_order_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Send status update notification
        if new_order_status == OrderStatus.CONFIRMED:
            try:
                updated_order = Order(**{**order.dict(), "status": new_order_status})
                await notification_service.send_status_update(updated_order, new_order_status)
            except Exception as e:
                logger.warning(f"Failed to send status update notification: {e}")
        
        return {"message": "Payment confirmed", "payment_status": new_payment_status, "order_status": new_order_status}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming payment for order {order_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to confirm payment"
        )

@router.get("/", response_model=List[OrderResponse])
async def get_orders(
    status: Optional[OrderStatus] = None,
    order_type: Optional[OrderType] = None,
    customer_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get orders with optional filtering"""
    try:
        db = get_database()
        
        # Build filter query
        filter_query = {}
        
        # Non-admin users can only see their own orders
        if current_user and current_user.role != UserRole.ADMIN:
            filter_query["customer_id"] = current_user.id
        elif customer_id:
            filter_query["customer_id"] = customer_id
            
        if status:
            filter_query["status"] = status
        if order_type:
            filter_query["order_type"] = order_type
        
        # Get orders (newest first)
        cursor = db[COLLECTIONS['orders']].find(filter_query).sort("created_at", -1).skip(skip).limit(limit)
        orders = await cursor.to_list(length=limit)
        
        return [OrderResponse(**order) for order in orders]
        
    except Exception as e:
        logger.error(f"Error fetching orders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: Optional[User] = Depends(get_current_user)
):
    """Get single order by ID"""
    try:
        db = get_database()
        order = await db[COLLECTIONS['orders']].find_one({"id": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check access permissions
        if current_user and current_user.role != UserRole.ADMIN:
            if order.get("customer_id") != current_user.id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied"
                )
        
        return OrderResponse(**order)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order {order_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order"
        )

@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    new_status: OrderStatus,
    admin_user: User = Depends(get_admin_user)
):
    """Update order status (Admin only)"""
    try:
        db = get_database()
        
        # Get current order
        order_data = await db[COLLECTIONS['orders']].find_one({"id": order_id})
        if not order_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        current_order = Order(**order_data)
        
        # Update order status
        update_data = {
            "status": new_status,
            "updated_at": datetime.utcnow()
        }
        
        if new_status == OrderStatus.COMPLETED:
            update_data["completed_at"] = datetime.utcnow()
        
        await db[COLLECTIONS['orders']].update_one(
            {"id": order_id},
            {"$set": update_data}
        )
        
        # Send status update notification
        try:
            updated_order = Order(**{**current_order.dict(), **update_data})
            await notification_service.send_status_update(updated_order, new_status)
        except Exception as e:
            logger.warning(f"Failed to send status update notification: {e}")
        
        # Get updated order
        updated_order_data = await db[COLLECTIONS['orders']].find_one({"id": order_id})
        return OrderResponse(**updated_order_data)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status {order_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update order status"
        )
