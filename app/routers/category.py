from app.database import db_dep
from app.schemas import CategoryResponse
from app.models import Category
from fastapi import APIRouter,HTTPException
from sqlalchemy import select

router=APIRouter(prefix="/category",tags=["Category"])

from sqlalchemy.orm import selectinload

@router.get("/catgory",response_model=list[CategoryResponse])
async def category_list(db:db_dep):
    stmt=select(Category).options(selectinload(Category.subcategories))
    categories=db.execute(stmt).scalars().all()
    
    return categories
@router.get("/category/{category_id}",response_model=CategoryResponse)
async def  category_1(db:db_dep,category_id:int):
    stmt=select(Category).where(Category.id==category_id)
    category=db.execute(stmt).scalars().first()
    if not category :
        raise HTTPException(status_code=404,detail="Category not found!")
    return category

