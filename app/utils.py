import random
import redis
import smtplib
import jwt
from jose import  JWTError
from email.mime.text import MIMEText
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from passlib.context import CryptContext
from passlib.context import CryptContext
from app.config import settings

pwd_context=CryptContext(schemes=["argon2"],deprecated="auto")
def code_generator(length:int=6):
    l=[0,1,2,3,4,5,6,7,8,9]
    code=""
    for _ in range(length):
        k=random.choice(l)
        code+=str(k)
    return int(code)
def password_hash(password:str):
    return pwd_context.hash(password)
def password_verify(password,password_hash):
    return pwd_context.verify(password,password_hash)

def send_email(to_email: str, subject: str, body: str):
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["Body"] = body
    msg["From"] = settings.EMAIL_ADDRESS
    msg["To"] = to_email

    with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.EMAIL_ADDRESS, settings.EMAIL_PASSWORD)
        server.send_message(msg)


redis_client = redis.from_url(settings.REDIS_URL)


def generate_jwt_tokens(user_id: int, is_access_only: bool = False):
    access_token =jwt.encode(
    payload={
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES) ,
    },
    key=settings.SECRET_KEY,
    algorithm=settings.ALGORITHM,
)
    if is_access_only:
        return access_token
    refresh_token = jwt.encode(
        algorithm=settings.ALGORITHM,
        key=settings.SECRET_KEY,
        payload={
            "user_id": str(user_id),
            "exp": datetime.now(timezone.utc)
            + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
        },
    )
    return access_token, refresh_token


def decode_jwt_token(token: str):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        print(payload)
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
