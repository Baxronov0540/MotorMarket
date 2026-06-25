from pydantic import BaseModel


class ListingCreateRequest(BaseModel):
    subcategory_id:int
    title:str
    price:int
    condition:str
    status:str
    location:str
    description:str|None=None
class ListingResponse(BaseModel):
    id:int
    subcategory_id:int
    title:str
    price:int
    condition:str
    status:str
    location:str
    description:str|None=None

    class Config:
        orm_mode = True