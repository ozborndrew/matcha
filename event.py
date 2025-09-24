from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date
from enum import Enum
import uuid

class EventStatus(str, Enum):
    UPCOMING = "upcoming"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    max_capacity: Optional[int] = None
    current_registrations: int = 0
    is_featured: bool = False
    status: EventStatus = EventStatus.UPCOMING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_date: date
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    max_capacity: Optional[int] = None
    is_featured: bool = False

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    max_capacity: Optional[int] = None
    current_registrations: Optional[int] = None
    is_featured: Optional[bool] = None
    status: Optional[EventStatus] = None

class Event(EventBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class EventResponse(Event):
    pass
