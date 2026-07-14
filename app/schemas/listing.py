from pydantic import BaseModel


class ListingCreateRequest(BaseModel):
    subcategory_id:int
    title:str
    price:int
    condition:str
    status:str
    location:str
    description:str|None=None
    brand:str|None=None
    model:str|None=None
    year:int|None=None
    mileage:int|None=None
    color:str|None=None
    engine_volume:float|None=None
    fuel_type:str|None=None
    transmission:str|None=None
    drive_type:str|None=None
    body_type:str|None=None
    battery_capacity:str|None=None
    power_reserve:int|None=None
    motor_power:int|None=None
    frame_size:str|None=None
    wheel_size:float|None=None
    speed_count:int|None=None
class ListingUpdateRequest(BaseModel):
    subcategory_id:int|None=None
    title:str|None=None
    price:int|None=None
    condition:str|None=None
    status:str|None=None
    location:str|None=None
    description:str|None=None
    brand:str|None=None
    model:str|None=None
    year:int|None=None
    mileage:int|None=None
    color:str|None=None
    engine_volume:float|None=None
    fuel_type:str|None=None
    transmission:str|None=None
    drive_type:str|None=None
    body_type:str|None=None
    battery_capacity:str|None=None
    power_reserve:int|None=None
    motor_power:int|None=None
    frame_size:str|None=None
    wheel_size:float|None=None
    speed_count:int|None=None
class ListingMediaResponse(BaseModel):
    id:int
    url:str
    sort_order:int
    is_cover:bool

class ListingResponse(BaseModel):
    id:int
    user_id:int
    subcategory_id:int
    title:str
    price:int
    condition:str
    status:str
    location:str
    description:str|None=None
    brand:str|None=None
    model:str|None=None
    year:int|None=None
    mileage:int|None=None
    color:str|None=None
    engine_volume:float|None=None
    fuel_type:str|None=None
    transmission:str|None=None
    drive_type:str|None=None
    body_type:str|None=None
    battery_capacity:str|None=None
    power_reserve:int|None=None
    motor_power:int|None=None
    frame_size:str|None=None
    wheel_size:float|None=None
    speed_count:int|None=None
    media: list[ListingMediaResponse] = []

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
    