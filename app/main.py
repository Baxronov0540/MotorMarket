from fastapi import FastAPI
from app.routers import listing_router,category_router,user_router

app = FastAPI()

app.include_router(listing_router)
app.include_router(category_router)
app.include_router(user_router)