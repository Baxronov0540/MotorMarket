from fastapi import APIRouter,HTTPException
from sqlalchemy import select

from sqlalchemy.orm import joinedload

from app.database import db_dep
from app.dependensies import current_user_dep
from app.models import SavedListing,Listing
from app.schemas import SavedListingCreateRequest,SavedListingResponse

router=APIRouter(prefix="/saved",tags=["SavedListing"])

@router.post("/create")
async def saved_listing(db:db_dep,current_user:current_user_dep,saved_data:SavedListingCreateRequest):
    stmt=select(SavedListing).where(SavedListing.listing_id==saved_data.listing_id,SavedListing.user_id==current_user.id)
    saved_listin=db.execute(stmt).scalars().first()
    if saved_listin:
        raise HTTPException(status_code=400,detail="Listin already exsist")
    
    saved_listin=SavedListing(listing_id=saved_data.listing_id,user_id=current_user.id)
    
    db.add(saved_listin)
    db.commit()
    db.refresh(saved_listin)
   
    return saved_listin
@router.get("/list", response_model=list[SavedListingResponse])
async def saved_list(db: db_dep, current_user: current_user_dep):
    stmt = (
        select(SavedListing)
        .options(joinedload(SavedListing.listing)) 
        .where(SavedListing.user_id == current_user.id)
    )
    result = db.execute(stmt)
    return result.scalars().all()
