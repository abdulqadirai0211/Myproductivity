from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from database import get_database
from models import GoalCreate, GoalUpdate, GoalResponse, UserInDB
from auth import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("/", response_model=List[GoalResponse])
async def get_goals(current_user: UserInDB = Depends(get_current_user)):
    """Get all goals for the current user"""
    db = get_database()
    goals = await db.goals.find({"user": current_user.id}).sort("createdAt", -1).to_list(length=None)
    
    return [GoalResponse(_id=str(goal["_id"]), **{k: v for k, v in goal.items() if k != "_id" and k != "user"}) for goal in goals]


@router.post("/", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(goal_data: GoalCreate, current_user: UserInDB = Depends(get_current_user)):
    """Create a new goal"""
    db = get_database()
    
    goal_dict = goal_data.model_dump()
    goal_dict["user"] = current_user.id
    goal_dict["createdAt"] = datetime.utcnow()
    goal_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.goals.insert_one(goal_dict)
    created_goal = await db.goals.find_one({"_id": result.inserted_id})
    
    return GoalResponse(_id=str(created_goal["_id"]), **{k: v for k, v in created_goal.items() if k != "_id" and k != "user"})


@router.put("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: str, goal_data: GoalUpdate, current_user: UserInDB = Depends(get_current_user)):
    """Update a goal"""
    db = get_database()
    
    goal = await db.goals.find_one({"_id": ObjectId(goal_id), "user": current_user.id})
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    
    update_data = {k: v for k, v in goal_data.model_dump(exclude_unset=True).items() if v is not None}
    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        await db.goals.update_one({"_id": ObjectId(goal_id)}, {"$set": update_data})
    
    updated_goal = await db.goals.find_one({"_id": ObjectId(goal_id)})
    return GoalResponse(_id=str(updated_goal["_id"]), **{k: v for k, v in updated_goal.items() if k != "_id" and k != "user"})


@router.delete("/{goal_id}")
async def delete_goal(goal_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Delete a goal"""
    db = get_database()
    
    goal = await db.goals.find_one({"_id": ObjectId(goal_id), "user": current_user.id})
    if not goal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    
    await db.goals.delete_one({"_id": ObjectId(goal_id)})
    return {"message": "Goal deleted successfully"}
