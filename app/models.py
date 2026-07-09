from datetime import datetime
from typing import List, Optional

from sqlalchemy import String, Text, Boolean, BigInteger, Float, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

class Category(Base):
    __tablename__="panel_category"

    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    name:Mapped[str]=mapped_column(String(255))
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())

    subcategories:Mapped[List["Subcategory"]]=relationship(back_populates="category",cascade="all, delete-orphan")


class Subcategory(Base):
    __tablename__="panel_subcategory"

    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    category_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_category.id",ondelete="CASCADE"))
    name:Mapped[str]=mapped_column(String(255))
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())

    category:Mapped["Category"]=relationship(back_populates="subcategories")
    listings:Mapped[List["Listing"]]=relationship(back_populates="subcategory")


class User(Base):
    __tablename__="panel_user"
    
    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    email:Mapped[str]=mapped_column(String(100),unique=True)
    password:Mapped[str]=mapped_column(String(255))
    first_name:Mapped[str]=mapped_column(String(50),nullable=True)
    last_name:Mapped[str]=mapped_column(String(50),nullable=True)
    phone:Mapped[Optional[str]]=mapped_column(String(50),nullable=True)
    is_active:Mapped[bool]=mapped_column(Boolean,default=False)
    is_staff:Mapped[bool]=mapped_column(Boolean,default=False)
    is_superuser:Mapped[bool]=mapped_column(Boolean,default=False)
    is_deleted:Mapped[bool]=mapped_column(Boolean,default=False)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())
    updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now(),onupdate=func.now())

    listings:Mapped[List["Listing"]]=relationship(back_populates="user")
    saved_listings:Mapped[List["SavedListing"]]=relationship(back_populates="user")
    messages:Mapped[List["Message"]]=relationship(back_populates="sender")
    
    conversations_as_seller:Mapped[List["Conversation"]]=relationship(
        "Conversation",back_populates="seller",foreign_keys="Conversation.seller_id"
    )
    conversations_as_buyer:Mapped[List["Conversation"]]=relationship(
        "Conversation",back_populates="buyer",foreign_keys="Conversation.buyer_id"
    )


class Listing(Base):
    __tablename__="panel_listing"

    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_user.id",ondelete="CASCADE"))
    subcategory_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_subcategory.id",ondelete="RESTRICT"))
    title:Mapped[str]=mapped_column(String(255))
    price:Mapped[int]=mapped_column(BigInteger)
    condition:Mapped[str]=mapped_column(String(50))
    status:Mapped[str]=mapped_column(String(50),default="active")
    location:Mapped[Optional[str]]=mapped_column(String(255),nullable=True)
    description:Mapped[str]=mapped_column(Text)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())
    brand:Mapped[Optional[str]]=mapped_column(String(255),nullable=True)
    model:Mapped[Optional[str]]=mapped_column(String(255),nullable=True)
    year:Mapped[Optional[int]]=mapped_column(BigInteger,nullable=True)
    mileage:Mapped[Optional[int]]=mapped_column(BigInteger,nullable=True)
    color:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    engine_volume:Mapped[Optional[float]]=mapped_column(Float,nullable=True)
    fuel_type:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    transmission:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    drive_type:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    body_type:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    battery_capacity:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    power_reserve:Mapped[Optional[int]]=mapped_column(BigInteger,nullable=True)
    motor_power:Mapped[Optional[int]]=mapped_column(BigInteger,nullable=True)
    frame_size:Mapped[Optional[str]]=mapped_column(String(100),nullable=True)
    wheel_size:Mapped[Optional[float]]=mapped_column(Float,nullable=True)
    speed_count:Mapped[Optional[int]]=mapped_column(BigInteger,nullable=True)

    user:Mapped["User"]=relationship(back_populates="listings")
    subcategory:Mapped["Subcategory"]=relationship(back_populates="listings")
    media:Mapped[List["ListingMedia"]]=relationship(back_populates="listing",cascade="all, delete-orphan")

    saved_by:Mapped[List["SavedListing"]]=relationship(back_populates="listing",cascade="all, delete-orphan")
    conversations:Mapped[List["Conversation"]]=relationship(back_populates="listing")


class ListingMedia(Base):
    __tablename__="panel_listing_media"

    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    listing_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_listing.id",ondelete="CASCADE"))
    url:Mapped[str]=mapped_column(String(255))
    sort_order:Mapped[int]=mapped_column(BigInteger,default=0)
    is_cover:Mapped[bool]=mapped_column(Boolean,default=False)

    listing:Mapped["Listing"]=relationship(back_populates="media")


# ListingSpec removed per project requirement



class SavedListing(Base):
    __tablename__="panel_saved_listing"

    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    user_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_user.id",ondelete="CASCADE"))
    listing_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_listing.id",ondelete="CASCADE"))
    saved_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())

    user:Mapped["User"]=relationship(back_populates="saved_listings")
    listing:Mapped["Listing"]=relationship(back_populates="saved_by")


class Conversation(Base):
    __tablename__="panel_conversation"

    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    listing_id:Mapped[Optional[int]]=mapped_column(BigInteger,ForeignKey("panel_listing.id",ondelete="SET NULL"),nullable=True)
    seller_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_user.id",ondelete="CASCADE"))
    buyer_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_user.id",ondelete="CASCADE"))
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())
    last_message_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now(),onupdate=func.now())

    listing:Mapped["Listing"]=relationship(back_populates="conversations")
    seller:Mapped["User"]=relationship(foreign_keys=[seller_id],back_populates="conversations_as_seller")
    buyer:Mapped["User"]=relationship(foreign_keys=[buyer_id],back_populates="conversations_as_buyer")
    messages:Mapped[List["Message"]]=relationship(back_populates="conversation",cascade="all, delete-orphan")

class Message(Base):
    __tablename__="panel_message"


    id:Mapped[int]=mapped_column(BigInteger,primary_key=True,autoincrement=True)
    conversation_id:Mapped[int]=mapped_column(BigInteger,ForeignKey("panel_conversation.id",ondelete="CASCADE"))
    sender_id:Mapped[Optional[int]]=mapped_column(BigInteger,ForeignKey("panel_user.id",ondelete="SET NULL"),nullable=True)
    body:Mapped[str]=mapped_column(Text)
    type:Mapped[str]=mapped_column(String(50),default="text")
    is_read:Mapped[bool]=mapped_column(Boolean,default=False)
    sent_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=func.now())

    conversation:Mapped["Conversation"]=relationship(back_populates="messages")
    sender:Mapped["User"]=relationship(back_populates="messages")