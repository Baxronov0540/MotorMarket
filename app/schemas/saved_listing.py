from datetime import datetime
from pydantic import BaseModel



class SavedListingCreateRequest(BaseModel):
    listing_id:int 
class SavedListingResponse(BaseModel):
    id:int
    listing_id:int
    user_id:int
    created_at:datetime
    