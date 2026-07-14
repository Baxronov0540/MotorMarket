from fastapi import FastAPI
from app.routers import listing_router, category_router, user_router, saved_listing_router, conversation_router
from fastapi.middleware.cors import CORSMiddleware

from fastapi.staticfiles import StaticFiles
from app.config import settings

app = FastAPI()

app.mount("/media", StaticFiles(directory=settings.MEDIA_PATH), name="media")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listing_router)
app.include_router(category_router)
app.include_router(user_router)
app.include_router(saved_listing_router)
app.include_router(conversation_router)
