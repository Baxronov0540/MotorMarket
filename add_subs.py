import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv()

DB_URL = f"postgresql+psycopg2://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
engine = create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)
session = SessionLocal()

from app.models import Subcategory

subs = [
    Subcategory(category_id=2, name="Tog' velosipedi"),
    Subcategory(category_id=2, name="Shahar velosipedi"),
    Subcategory(category_id=2, name="Bolalar velosipedi"),
    Subcategory(category_id=3, name="Sport bayk"),
    Subcategory(category_id=3, name="Skuter"),
    Subcategory(category_id=3, name="Klassik")
]

for s in subs:
    session.add(s)

session.commit()
print("Subcategories added successfully!")
