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

import jwt

def current_user(credintials:credentials_dep,db:db_dep):
    if not credintials:
        raise HTTPException(status_code=401, detail="No credentials provided")
    try:
        decode_data=decode_jwt_token(credintials.credentials)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired!")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = decode_data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    stmt=select(User).where(User.id==user_id)
    user=db.execute(stmt).scalars().first()
    if not user:
        raise HTTPException(status_code=404,detail="User not found")
    return user
current_user_dep=Annotated[User,Depends(current_user)]
