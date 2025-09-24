from fastapi import APIRouter, HTTPException, Depends, status
from models.settings import CafeSettings, CafeSettingsUpdate
from models.user import User
from routes.auth import get_admin_user
from database import get_database, COLLECTIONS
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/settings", tags=["Settings"])

@router.get("/", response_model=CafeSettings)
async def get_settings():
    """Get cafe settings"""
    try:
        db = get_database()
        
        # Get settings from database
        settings_data = await db[COLLECTIONS['settings']].find_one({})
        
        if not settings_data:
            # Create default settings if none exist
            default_settings = CafeSettings(
                contact_email="admin@nanacafe.com"
            )
            await db[COLLECTIONS['settings']].insert_one(default_settings.dict())
            return default_settings
        
        return CafeSettings(**settings_data)
        
    except Exception as e:
        logger.error(f"Error fetching settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch settings"
        )

@router.put("/", response_model=CafeSettings)
async def update_settings(
    settings_data: CafeSettingsUpdate,
    admin_user: User = Depends(get_admin_user)
):
    """Update cafe settings (Admin only)"""
    try:
        db = get_database()
        
        # Get current settings
        current_settings = await db[COLLECTIONS['settings']].find_one({})
        
        if not current_settings:
            # Create new settings if none exist
            new_settings = CafeSettings(
                **settings_data.dict(exclude_unset=True),
                contact_email=settings_data.contact_email or "admin@nanacafe.com"
            )
            await db[COLLECTIONS['settings']].insert_one(new_settings.dict())
            return new_settings
        else:
            # Update existing settings
            update_data = settings_data.dict(exclude_unset=True)
            update_data["updated_at"] = datetime.utcnow()
            
            await db[COLLECTIONS['settings']].update_one(
                {"id": current_settings["id"]},
                {"$set": update_data}
            )
            
            # Get updated settings
            updated_settings = await db[COLLECTIONS['settings']].find_one({"id": current_settings["id"]})
            return CafeSettings(**updated_settings)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating settings: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update settings"
        )

@router.get("/time-slots")
async def get_available_time_slots():
    """Get available time slots for orders"""
    try:
        db = get_database()
        settings_data = await db[COLLECTIONS['settings']].find_one({})
        
        if settings_data and "available_time_slots" in settings_data:
            return {"time_slots": settings_data["available_time_slots"]}
        
        # Return default time slots
        default_slots = [
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
        return {"time_slots": default_slots}
        
    except Exception as e:
        logger.error(f"Error fetching time slots: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch time slots"
        )

@router.get("/delivery-info")
async def get_delivery_info():
    """Get delivery information for customers"""
    try:
        db = get_database()
        settings_data = await db[COLLECTIONS['settings']].find_one({})
        
        if not settings_data:
            return {
                "delivery_fee": 50.0,
                "free_delivery_threshold": 200.0,
                "min_order_amount": 100.0
            }
        
        return {
            "delivery_fee": settings_data.get("delivery_fee", 50.0),
            "free_delivery_threshold": settings_data.get("free_delivery_threshold", 200.0),
            "min_order_amount": settings_data.get("min_order_amount", 100.0)
        }
        
    except Exception as e:
        logger.error(f"Error fetching delivery info: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch delivery info"
        )
