from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import List, Optional
from models.event import Event, EventCreate, EventUpdate, EventResponse, EventStatus
from models.user import User
from routes.auth import get_admin_user
from database import get_database, COLLECTIONS
from datetime import datetime, date
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/events", tags=["Events"])

@router.get("/", response_model=List[EventResponse])
async def get_events(
    status: Optional[EventStatus] = None,
    is_featured: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all events with optional filtering"""
    try:
        db = get_database()
        
        # Build filter query
        filter_query = {}
        if status:
            filter_query["status"] = status
        if is_featured is not None:
            filter_query["is_featured"] = is_featured
        
        # Get events (sorted by event date)
        cursor = db[COLLECTIONS['events']].find(filter_query).sort("event_date", 1).skip(skip).limit(limit)
        events = await cursor.to_list(length=limit)
        
        return [EventResponse(**event) for event in events]
        
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch events"
        )

@router.get("/upcoming", response_model=List[EventResponse])
async def get_upcoming_events():
    """Get upcoming events"""
    try:
        db = get_database()
        
        today = date.today()
        filter_query = {
            "event_date": {"$gte": today},
            "status": EventStatus.UPCOMING
        }
        
        cursor = db[COLLECTIONS['events']].find(filter_query).sort("event_date", 1).limit(10)
        events = await cursor.to_list(length=10)
        
        return [EventResponse(**event) for event in events]
        
    except Exception as e:
        logger.error(f"Error fetching upcoming events: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch upcoming events"
        )

@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str):
    """Get single event by ID"""
    try:
        db = get_database()
        event = await db[COLLECTIONS['events']].find_one({"id": event_id})
        
        if not event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        return EventResponse(**event)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch event"
        )

@router.post("/", response_model=EventResponse)
async def create_event(
    event_data: EventCreate,
    admin_user: User = Depends(get_admin_user)
):
    """Create new event (Admin only)"""
    try:
        db = get_database()
        
        # Create event
        event = Event(**event_data.dict())
        await db[COLLECTIONS['events']].insert_one(event.dict())
        
        return EventResponse(**event.dict())
        
    except Exception as e:
        logger.error(f"Error creating event: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create event"
        )

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(
    event_id: str,
    event_data: EventUpdate,
    admin_user: User = Depends(get_admin_user)
):
    """Update event (Admin only)"""
    try:
        db = get_database()
        
        # Check if event exists
        existing_event = await db[COLLECTIONS['events']].find_one({"id": event_id})
        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Update event
        update_data = event_data.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        await db[COLLECTIONS['events']].update_one(
            {"id": event_id},
            {"$set": update_data}
        )
        
        # Get updated event
        updated_event = await db[COLLECTIONS['events']].find_one({"id": event_id})
        return EventResponse(**updated_event)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update event"
        )

@router.delete("/{event_id}")
async def delete_event(
    event_id: str,
    admin_user: User = Depends(get_admin_user)
):
    """Delete event (Admin only)"""
    try:
        db = get_database()
        
        # Check if event exists
        existing_event = await db[COLLECTIONS['events']].find_one({"id": event_id})
        if not existing_event:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event not found"
            )
        
        # Delete event
        result = await db[COLLECTIONS['events']].delete_one({"id": event_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete event"
            )
        
        return {"message": "Event deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting event {event_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete event"
        )
