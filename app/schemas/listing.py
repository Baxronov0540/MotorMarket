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

class ListingFilterRequest(BaseModel):
    min_price:float|None=None
    max_price:float|None=None
    subcategory_id:int|None=None
    location:str|None=None
    condition:str|None=None

class ListingMediaRequest(BaseModel):
    listing_id:int
    sort_order:int|None=0
    is_cover:bool|None=False
    