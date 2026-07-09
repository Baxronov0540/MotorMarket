from fastapi import FastAPI
from app.routers import listing_router,category_router,user_router,saved_listing_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # Qaysi manbalarga ruxsat berish
    allow_credentials=True,     # Cookie larni yuborishga ruxsat
    allow_methods=["*"],        # Barcha metodlarga ruxsat (GET, POST, PUT, DELETE)
    allow_headers=["*"],        # Barcha header larga ruxsat
)
app.include_router(listing_router)
app.include_router(category_router)
app.include_router(user_router)
app.include_router(saved_listing_router)
