from datetime import datetime
from typing import Optional
from pydantic import BaseModel
from pydantic import ConfigDict


# ─── Message Schemas ────────────────────────────────────────────────────────

class MessageCreateRequest(BaseModel):
    body: str
    type: str = "text"


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    sender_id: Optional[int] = None
    body: str
    type: str
    is_read: bool
    sent_at: datetime


class MessageReadResponse(BaseModel):
    """O'qilgan xabarlar soni."""
    updated_count: int


# ─── Conversation Schemas ────────────────────────────────────────────────────

class ConversationCreateRequest(BaseModel):
    listing_id: Optional[int] = None
    seller_id: int


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: Optional[int] = None
    seller_id: int
    buyer_id: int
    created_at: datetime
    last_message_at: datetime


class ConversationDetailResponse(BaseModel):
    """Suhbat + barcha xabarlari."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    listing_id: Optional[int] = None
    seller_id: int
    buyer_id: int
    created_at: datetime
    last_message_at: datetime
    messages: list[MessageResponse] = []
