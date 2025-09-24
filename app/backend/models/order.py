from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from enum import Enum
import uuid

class OrderType(str, Enum):
    DELIVERY = "delivery"
    PICKUP = "pickup"

class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    STRIPE = "stripe"
    CASH = "cash"
    ONLINE_TRANSFER = "online_transfer"

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    unit_price: float
    total_price: float
    special_instructions: Optional[str] = None

class DeliveryInfo(BaseModel):
    full_name: str
    contact_number: str
    delivery_address: str
    delivery_date: date
    delivery_time_slot: str
    special_instructions: Optional[str] = None

class PickupInfo(BaseModel):
    full_name: str
    contact_number: str
    pickup_date: date
    pickup_time_slot: str
    special_instructions: Optional[str] = None

class OrderBase(BaseModel):
    customer_id: Optional[str] = None  # None for guest orders
    customer_email: Optional[str] = None
    order_type: OrderType
    items: List[OrderItem]
    subtotal: float
    delivery_fee: float = 0.0
    total_amount: float
    status: OrderStatus = OrderStatus.PENDING
    payment_status: PaymentStatus = PaymentStatus.PENDING
    payment_method: Optional[PaymentMethod] = None
    payment_intent_id: Optional[str] = None  # Stripe payment intent ID
    delivery_info: Optional[DeliveryInfo] = None
    pickup_info: Optional[PickupInfo] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class OrderCreate(BaseModel):
    customer_email: Optional[str] = None
    order_type: OrderType
    items: List[OrderItem]
    delivery_info: Optional[DeliveryInfo] = None
    pickup_info: Optional[PickupInfo] = None
    payment_method: PaymentMethod = PaymentMethod.STRIPE

class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    payment_status: Optional[PaymentStatus] = None
    payment_intent_id: Optional[str] = None

class Order(OrderBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: f"NC{datetime.now().strftime('%Y%m%d%H%M%S')}")

class OrderResponse(Order):
    pass
