from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId

from database import get_database
from models import TaskCreate, TaskUpdate, TaskResponse, UserInDB
from auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
async def get_tasks(current_user: UserInDB = Depends(get_current_user)):
    """Get all tasks for the current user"""
    db = get_database()
    tasks = await db.tasks.find({"user": current_user.id}).sort("createdAt", -1).to_list(length=None)
    
    return [TaskResponse(_id=str(task["_id"]), **{k: v for k, v in task.items() if k != "_id" and k != "user"}) for task in tasks]


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(task_data: TaskCreate, current_user: UserInDB = Depends(get_current_user)):
    """Create a new task"""
    db = get_database()
    
    task_dict = task_data.model_dump()
    task_dict["user"] = current_user.id
    
    result = await db.tasks.insert_one(task_dict)
    created_task = await db.tasks.find_one({"_id": result.inserted_id})
    
    return TaskResponse(_id=str(created_task["_id"]), **{k: v for k, v in created_task.items() if k != "_id" and k != "user"})


@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(task_id: str, task_data: TaskUpdate, current_user: UserInDB = Depends(get_current_user)):
    """Update a task"""
    db = get_database()
    
    # Check if task exists and belongs to user
    task = await db.tasks.find_one({"_id": ObjectId(task_id), "user": current_user.id})
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Update task
    update_data = {k: v for k, v in task_data.model_dump(exclude_unset=True).items() if v is not None}
    if update_data:
        await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_data})
    
    updated_task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    return TaskResponse(_id=str(updated_task["_id"]), **{k: v for k, v in updated_task.items() if k != "_id" and k != "user"})


@router.delete("/{task_id}")
async def delete_task(task_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Delete a task"""
    db = get_database()
    
    # Check if task exists and belongs to user
    task = await db.tasks.find_one({"_id": ObjectId(task_id), "user": current_user.id})
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    await db.tasks.delete_one({"_id": ObjectId(task_id)})
    return {"message": "Task deleted successfully"}
