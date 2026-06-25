from datetime import datetime

from pydantic import BaseModel,EmailStr


class UserRegisterRequest(BaseModel):
    
    email:EmailStr
    password:str

class UserRegisterResponse(BaseModel):
    id:int
    email:EmailStr
    first_name:str|None=None
    last_name:str|None=None
    phone:str|None=None
    is_active:bool
    is_deleted:bool
    created_at:datetime
class UserProfileUpdateRequest(BaseModel):
    first_name:str|None=None
    last_name:str|None=None
    phone:str|None=None
    