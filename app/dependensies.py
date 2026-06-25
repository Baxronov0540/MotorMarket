from fastapi import HTTPException, Depends
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Annotated
from datetime import datetime, timezone
from app.database import db_dep
from app.models import User
from app.utils import decode_jwt_token
jwt_security=HTTPBearer(auto_error=False)
credentials_dep=Annotated[HTTPAuthorizationCredentials,Depends(jwt_security)]

def current_user(credintials:credentials_dep):
    decode_data=decode_jwt_token(credintials.credentials)
    user_id,exp=decode_data["user_id"],datetime.fromtimestamp(decode_data["exp"],tz=timezone.utc)
    if exp<datetime.now(timezone.utc):
        raise HTTPException(status_code=401,detail="Token expired!")
    stmt=select(User).where(User.id==user_id)
    user=db_dep.execute(stmt).scalars().first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    return user
current_user_dep=Annotated[User,Depends(current_user)]
