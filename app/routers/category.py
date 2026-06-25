from app.database import db_dep
from app.schemas import CategoryResponse
from app.models import Category
from fastapi import APIRouter,HTTPException
from sqlalchemy import select

router=APIRouter(prefix="/category",tags=["Category"])

@router.get("/catgory",response_model=list[CategoryResponse])
async def category_list(db:db_dep):
    stmt=select(Category)
    categories=db.execute(stmt).scalars().all()
    
    return categories
@router.get("/category/{category_id}",response_model=CategoryResponse)
async def  category_1(db:db_dep,category_id:int):
    stmt=select(Category).where(Category.id==category_id)
    category=db.execute.scalars().first()
    if not category :
        raise HTTPException(status_code=404,detail="Category not found!")
    return category

