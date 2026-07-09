
import shutil
import uuid
from pathlib import Path


from fastapi import APIRouter,HTTPException,UploadFile,File
from sqlalchemy import select,func
from app.database import db_dep
from app.dependensies import current_user_dep
from app.models import Listing,ListingMedia,Category,Subcategory
from app.schemas import ListingCreateRequest,ListingResponse,ListingFilterRequest,ListingMediaRequest
from app.config import settings




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
@router.get("/get/{listing_id}",response_model=ListingResponse)
async def listing_get(db:db_dep,listing_id:int):
    stmt=select(Listing).where(Listing.id==listing_id)
    listing=db.execute(stmt).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404,detail="Listing not found")
    return listing
@router.delete("/delete/{listing_id}")
async def listing_delete(db:db_dep,current_user:current_user_dep,listing_id:int):
    stmt=select(Listing).where(Listing.id==listing_id)
    listing=db.execute(stmt).scalar_one_or_none()
    if not listing:
        raise HTTPException(status_code=404,detail="Listing not found")
    if listing.user_id!=current_user.id:
        raise HTTPException(status_code=403,detail="You are not authorized to delete this listing")
    db.delete(listing)
    db.commit()
    return {"message":"Listing deleted successfully"}
@router.get("/user/",response_model=list[ListingResponse])
async def listing_list_by_user(db:db_dep,current_user:current_user_dep ):
    stmt=select(Listing).where(Listing.user_id==current_user.id)
    listings=db.execute(stmt).scalars().all()
    
    return listings

from fastapi import Query

@router.get("/filter/",response_model=list[ListingResponse])
async def listing_filter(
    db: db_dep,
    min_price: float = None,
    max_price: float = None,
    subcategory_id: int = None,
    location: str = None,
    condition: str = None,
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100) 
):
    stmt = select(Listing)
    
    if min_price: 
        stmt = stmt.where(Listing.price >= min_price)
    if max_price:
        stmt = stmt.where(Listing.price <= max_price)
    if subcategory_id: 
        stmt = stmt.where(Listing.subcategory_id == subcategory_id)
    if location:
        stmt = stmt.where(Listing.location == location)
    if condition:
        stmt = stmt.where(Listing.condition == condition)
    
    stmt = stmt.offset((page - 1) * size).limit(size)
    
    listings = db.execute(stmt).scalars().all()
    return listings
@router.post("/media")
async def listing_media_create(db: db_dep, current_user: current_user_dep, 
                               file: UploadFile, 
                               listing_id: int, 
                               sort_order: int = 0, 
                               is_cover: bool = False):
    
    stmt = select(Listing).where(Listing.id == listing_id)
    listing = db.execute(stmt).scalar_one_or_none()
    if not listing or listing.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Forbidden")

    file_ext = Path(file.filename).suffix.lower()
    filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = Path(settings.MEDIA_PATH) / filename
    
    with dest_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer) 

    image = ListingMedia(url=f"/media/{filename}", listing_id=listing_id, 
                         sort_order=sort_order, is_cover=is_cover)
    db.add(image)
    db.commit()
    return {"url": image.url}
@router.get("/count/{category_id}")
async def listing_count(db:db_dep,current_user:current_user_dep,category_id:int|None=None):
    stmt=select(func.count(Listing.id)).select_from(Listing)
    if category_id:
        stmt=stmt.join(Subcategory).where(Subcategory.category_id==category_id)    

    counts=db.execute(stmt).scalars().all()
    return {"listing counts":counts}
