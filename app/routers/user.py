from datetime import datetime, timezone
import secrets

from fastapi import APIRouter,HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy import select
from app.database import db_dep
from app.schemas import UserRegisterRequest,UserRegisterResponse,UserProfileUpdateRequest,TokenResponse
from app.models import User
from app.utils import decode_jwt_token, password_hash,redis_client,password_verify,generate_jwt_tokens,code_generator
from app.celery import  send_email_celery
from app.dependensies import current_user_dep
router=APIRouter(prefix="/user",tags=["User"])


@router.post("/register")
async def user_register(session:db_dep,data:UserRegisterRequest):
    stmt=select(User).where(User.email==data.email)
    user=session.execute(stmt).scalars().first()
    if not user :
        
        user=User(email=data.email,
              password=password_hash(data.password)
              )
    if user.is_active:
        raise HTTPException(status_code=400,detail="User already exists")
    code=code_generator()
    send_email_celery(
        data.email,
        "Email confiramtion",
        f"Your confirmation code is {code}",
    )
    redis_client.setex(code,120,data.email)
    stmt=select(User)
    exsisting_user=session.execute(stmt).scalars().first()
    if not exsisting_user:
        user.is_active=True
    
    
    session.add(user)
    session.commit()
    return JSONResponse(
        status_code=201, content={"message": "Email confirmation sent to your email."}
    )
@router.post("/confirm/{code}",response_model=TokenResponse)
async def register_confirm(db:db_dep,code:str):
    email=redis_client.get(code)
    print(email)
    if not email:
        raise HTTPException(status_code=400,detail="Invalid code")
    stmt=select(User).where(User.email==email.decode("utf-8"))
    user=db.execute(stmt).scalars().first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    user.is_active=True
    db.commit()
    db.refresh(user)
    access_token,refresh_token=generate_jwt_tokens(user.id)
    redis_client.delete(code)
    return {"access_token":access_token,
            "refresh_token":refresh_token}
@router.post("/login",response_model=TokenResponse)
async def login(db:db_dep,data:UserRegisterRequest):
    stmt=select(User).where(User.email==data.email)
    user=db.execute(stmt).scalars().first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    if not password_verify(data.password,user.password):
        raise HTTPException(status_code=401,detail="Invalid password!")
    
    access_token,refresh_token=generate_jwt_tokens(user.id)
    
    return {"access_token":access_token,
            "refresh_token":refresh_token}
@router.post("/refresh",response_model=TokenResponse)
async def refresh_token(db:db_dep,refresh_token:str):
    decode_data=decode_jwt_token(refresh_token)
    user_id,exp=decode_data["user_id"],datetime.fromtimestamp(decode_data["exp"],tz=timezone.utc)
    if exp<datetime.now(timezone.utc):
        raise HTTPException(status_code=401,detail="Token expired!")
    stmt=select(User).where(User.id==user_id)
    user=db.execute(stmt).scalars().first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    access_token=generate_jwt_tokens(user.id,is_access_only=True)
    return {"access_token":access_token}       
@router.get("/profile",response_model=UserRegisterResponse)
async def user_profile(db:db_dep,current_user:current_user_dep):
    return current_user

@router.put("/profile/update",response_model=UserRegisterResponse)
async def profile_update(db:db_dep,current_user:current_user_dep,update_data:UserProfileUpdateRequest):

    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(current_user, key, value)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change/password",response_model=UserRegisterResponse)
async def change_password(password:str,db:db_dep,current_user:current_user_dep):
    current_user.password=password_hash(password)
    db.commit()
    db.refresh(current_user)
    return current_user
