from pydantic import BaseModel

class SubcategoryResponse(BaseModel):
    id: int
    name: str

class CategoryResponse(BaseModel):
    id: int
    name: str
    subcategories: list[SubcategoryResponse] = []
    