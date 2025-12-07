from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime

from database import get_database
from models import NoteCreate, NoteUpdate, NoteResponse, UserInDB
from auth import get_current_user

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.get("/", response_model=List[NoteResponse])
async def get_notes(current_user: UserInDB = Depends(get_current_user)):
    """Get all notes for the current user"""
    db = get_database()
    notes = await db.notes.find({"user": current_user.id}).sort("updatedAt", -1).to_list(length=None)
    
    return [NoteResponse(_id=str(note["_id"]), **{k: v for k, v in note.items() if k != "_id" and k != "user"}) for note in notes]


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(note_data: NoteCreate, current_user: UserInDB = Depends(get_current_user)):
    """Create a new note"""
    db = get_database()
    
    note_dict = note_data.model_dump()
    note_dict["user"] = current_user.id
    note_dict["createdAt"] = datetime.utcnow()
    note_dict["updatedAt"] = datetime.utcnow()
    
    result = await db.notes.insert_one(note_dict)
    created_note = await db.notes.find_one({"_id": result.inserted_id})
    
    return NoteResponse(_id=str(created_note["_id"]), **{k: v for k, v in created_note.items() if k != "_id" and k != "user"})


@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(note_id: str, note_data: NoteUpdate, current_user: UserInDB = Depends(get_current_user)):
    """Update a note"""
    db = get_database()
    
    note = await db.notes.find_one({"_id": ObjectId(note_id), "user": current_user.id})
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    update_data = {k: v for k, v in note_data.model_dump(exclude_unset=True).items() if v is not None}
    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        await db.notes.update_one({"_id": ObjectId(note_id)}, {"$set": update_data})
    
    updated_note = await db.notes.find_one({"_id": ObjectId(note_id)})
    return NoteResponse(_id=str(updated_note["_id"]), **{k: v for k, v in updated_note.items() if k != "_id" and k != "user"})


@router.delete("/{note_id}")
async def delete_note(note_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Delete a note"""
    db = get_database()
    
    note = await db.notes.find_one({"_id": ObjectId(note_id), "user": current_user.id})
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    await db.notes.delete_one({"_id": ObjectId(note_id)})
    return {"message": "Note deleted successfully"}
