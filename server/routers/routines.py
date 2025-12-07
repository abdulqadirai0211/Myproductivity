from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId

from database import get_database
from models import RoutineCreate, RoutineUpdate, RoutineResponse, UserInDB
from auth import get_current_user

router = APIRouter(prefix="/api/routines", tags=["routines"])


@router.get("/", response_model=List[RoutineResponse])
async def get_routines(current_user: UserInDB = Depends(get_current_user)):
    """Get all routines for the current user"""
    db = get_database()
    routines = await db.routines.find({"user": current_user.id}).sort("createdAt", -1).to_list(length=None)
    
    return [RoutineResponse(_id=str(routine["_id"]), **{k: v for k, v in routine.items() if k != "_id" and k != "user"}) for routine in routines]


@router.post("/", response_model=RoutineResponse, status_code=status.HTTP_201_CREATED)
async def create_routine(routine_data: RoutineCreate, current_user: UserInDB = Depends(get_current_user)):
    """Create a new routine"""
    db = get_database()
    
    routine_dict = routine_data.model_dump(by_alias=True)
    routine_dict["user"] = current_user.id
    
    result = await db.routines.insert_one(routine_dict)
    created_routine = await db.routines.find_one({"_id": result.inserted_id})
    
    return RoutineResponse(_id=str(created_routine["_id"]), **{k: v for k, v in created_routine.items() if k != "_id" and k != "user"})


@router.put("/{routine_id}", response_model=RoutineResponse)
async def update_routine(routine_id: str, routine_data: RoutineUpdate, current_user: UserInDB = Depends(get_current_user)):
    """Update a routine"""
    db = get_database()
    
    routine = await db.routines.find_one({"_id": ObjectId(routine_id), "user": current_user.id})
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found")
    
    update_data = {k: v for k, v in routine_data.model_dump(by_alias=True, exclude_unset=True).items() if v is not None}
    if update_data:
        await db.routines.update_one({"_id": ObjectId(routine_id)}, {"$set": update_data})
    
    updated_routine = await db.routines.find_one({"_id": ObjectId(routine_id)})
    return RoutineResponse(_id=str(updated_routine["_id"]), **{k: v for k, v in updated_routine.items() if k != "_id" and k != "user"})


@router.delete("/{routine_id}")
async def delete_routine(routine_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Delete a routine"""
    db = get_database()
    
    routine = await db.routines.find_one({"_id": ObjectId(routine_id), "user": current_user.id})
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found")
    
    await db.routines.delete_one({"_id": ObjectId(routine_id)})
    return {"message": "Routine deleted successfully"}


@router.post("/{routine_id}/toggle/{date}", response_model=RoutineResponse)
async def toggle_routine_completion(routine_id: str, date: str, current_user: UserInDB = Depends(get_current_user)):
    """Toggle routine completion for a specific date"""
    db = get_database()
    
    routine = await db.routines.find_one({"_id": ObjectId(routine_id), "user": current_user.id})
    if not routine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Routine not found")
    
    # Toggle completion
    completions = routine.get("completions", {})
    current_status = completions.get(date, False)
    completions[date] = not current_status
    
    await db.routines.update_one(
        {"_id": ObjectId(routine_id)},
        {"$set": {"completions": completions}}
    )
    
    updated_routine = await db.routines.find_one({"_id": ObjectId(routine_id)})
    return RoutineResponse(_id=str(updated_routine["_id"]), **{k: v for k, v in updated_routine.items() if k != "_id" and k != "user"})
