from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
import uuid

class BusinessHours(BaseModel):
    day: str  # Monday, Tuesday, etc.
    open_time: Optional[str] = None  # "09:00"
    close_time: Optional[str] = None  # "18:00"
    is_open: bool = True

class DeliveryZone(BaseModel):
    name: str
    areas: List[str]
    delivery_fee: float
    min_order_amount: float

class CafeSettingsBase(BaseModel):
    cafe_name: str = "Nana Cafe"
    tagline: str = "Coffee & Pastries"
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    delivery_fee: float = 50.0
    free_delivery_threshold: float = 200.0
    min_order_amount: float = 100.0
    max_delivery_distance: Optional[float] = None  # in kilometers
    business_hours: List[BusinessHours] = []
    delivery_zones: List[DeliveryZone] = []
    available_time_slots: List[str] = [
        "9:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM", 
        "11:00 AM - 12:00 PM",
        "12:00 PM - 1:00 PM",
        "1:00 PM - 2:00 PM",
        "2:00 PM - 3:00 PM",
        "3:00 PM - 4:00 PM",
        "4:00 PM - 5:00 PM",
        "5:00 PM - 6:00 PM"
    ]
    is_accepting_orders: bool = True
    maintenance_mode: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CafeSettingsUpdate(BaseModel):
    cafe_name: Optional[str] = None
    tagline: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    delivery_fee: Optional[float] = None
    free_delivery_threshold: Optional[float] = None
    min_order_amount: Optional[float] = None
    max_delivery_distance: Optional[float] = None
    business_hours: Optional[List[BusinessHours]] = None
    delivery_zones: Optional[List[DeliveryZone]] = None
    available_time_slots: Optional[List[str]] = None
    is_accepting_orders: Optional[bool] = None
    maintenance_mode: Optional[bool] = None

class CafeSettings(CafeSettingsBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
