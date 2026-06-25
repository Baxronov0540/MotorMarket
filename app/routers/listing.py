from app.database import db_dep
from app.dependensies import current_user_dep
from app.models import Listing
from app.schemas import ListingCreateRequest,ListingResponse
from fastapi import APIRouter,HTTPException
from sqlalchemy import select



router=APIRouter(prefix="/listing",tags=["Listing"])

@router.post("/create")
async def listing_create(db:db_dep,current_user:current_user_dep,create_data:ListingCreateRequest):
    listing=Listing(user_id=current_user.id,subcategory_id=create_data.subcategory_id,price=create_data.price,description=create_data.description)
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return listing      
@router.get("/list",response_model=list[ListingResponse])
async def listing_list(db:db_dep):
    stmt=select(Listing)
    listings=db.execute(stmt).scalars().all()
    return listings

    