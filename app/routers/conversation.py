from fastapi import APIRouter, HTTPException
from sqlalchemy import select, and_, or_, update
from sqlalchemy.orm import joinedload

from app.database import db_dep
from app.dependensies import current_user_dep
from app.models import Conversation, Message, Listing
from app.schemas.conversation import (
    ConversationCreateRequest,
    ConversationResponse,
    ConversationDetailResponse,
    MessageCreateRequest,
    MessageResponse,
)

router = APIRouter(prefix="/conversation", tags=["Conversation"])


# ─── Conversation Endpoints ──────────────────────────────────────────────────

@router.post("/create", response_model=ConversationResponse, status_code=201)
async def conversation_create(
    db: db_dep,
    current_user: current_user_dep,
    data: ConversationCreateRequest,
):
    """
    Yangi suhbat boshlash.
    - Joriy foydalanuvchi → buyer
    - `seller_id` — sotuvchi
    - `listing_id` — ixtiyoriy (qaysi e'lon haqida)
    """
    # Sotuvchi o'zi bilan suhbat ocholmaydi
    if data.seller_id == current_user.id:
        raise HTTPException(status_code=400, detail="O'zingiz bilan suhbat ocholmaysiz.")

    # Agar listing berilgan bo'lsa, mavjudligini tekshiramiz
    if data.listing_id:
        listing = db.execute(
            select(Listing).where(Listing.id == data.listing_id)
        ).scalar_one_or_none()
        if not listing:
            raise HTTPException(status_code=404, detail="E'lon topilmadi.")

    # Ushbu listing bo'yicha allaqachon suhbat bormi?
    stmt = select(Conversation).where(
        and_(
            Conversation.seller_id == data.seller_id,
            Conversation.buyer_id == current_user.id,
            Conversation.listing_id == data.listing_id,
        )
    )
    existing = db.execute(stmt).scalar_one_or_none()
    if existing:
        return existing

    conversation = Conversation(
        listing_id=data.listing_id,
        seller_id=data.seller_id,
        buyer_id=current_user.id,
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/list", response_model=list[ConversationResponse])
async def conversation_list(db: db_dep, current_user: current_user_dep):
    """Joriy foydalanuvchining barcha suhbatlari (sotuvchi yoki xaridor sifatida)."""
    stmt = (
        select(Conversation)
        .where(
            or_(
                Conversation.seller_id == current_user.id,
                Conversation.buyer_id == current_user.id,
            )
        )
        .order_by(Conversation.last_message_at.desc())
    )
    conversations = db.execute(stmt).scalars().all()
    return conversations


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def conversation_detail(
    db: db_dep,
    current_user: current_user_dep,
    conversation_id: int,
):
    """
    Suhbatni barcha xabarlari bilan ko'rish.
    Faqat suhbat ishtirokchilari ko'ra oladi.
    """
    stmt = (
        select(Conversation)
        .options(joinedload(Conversation.messages))
        .where(Conversation.id == conversation_id)
    )
    conversation = db.execute(stmt).unique().scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi.")

    if current_user.id not in (conversation.seller_id, conversation.buyer_id):
        raise HTTPException(status_code=403, detail="Bu suhbatga kirishga ruxsat yo'q.")

    # Xabarlarni o'qilgan deb belgilash (joriy foydalanuvchiga kelganlar)
    db.execute(
        update(Message)
        .where(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != current_user.id,
                Message.is_read == False,
            )
        )
        .values(is_read=True)
    )
    db.commit()
    db.refresh(conversation)
    return conversation


@router.delete("/{conversation_id}", status_code=200)
async def conversation_delete(
    db: db_dep,
    current_user: current_user_dep,
    conversation_id: int,
):
    """Suhbatni o'chirish (faqat ishtirokchi)."""
    conversation = db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    ).scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi.")

    if current_user.id not in (conversation.seller_id, conversation.buyer_id):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q.")

    db.delete(conversation)
    db.commit()
    return {"message": "Suhbat o'chirildi."}


# ─── Message Endpoints ───────────────────────────────────────────────────────

@router.post("/{conversation_id}/message", response_model=MessageResponse, status_code=201)
async def message_send(
    db: db_dep,
    current_user: current_user_dep,
    conversation_id: int,
    data: MessageCreateRequest,
):
    """
    Suhbatga yangi xabar yuborish.
    Faqat suhbat ishtirokchilari yuborishi mumkin.
    """
    conversation = db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    ).scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi.")

    if current_user.id not in (conversation.seller_id, conversation.buyer_id):
        raise HTTPException(status_code=403, detail="Bu suhbatga xabar yubora olmaysiz.")

    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.id,
        body=data.body,
        type=data.type,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/{conversation_id}/messages", response_model=list[MessageResponse])
async def message_list(
    db: db_dep,
    current_user: current_user_dep,
    conversation_id: int,
    page: int = 1,
    size: int = 50,
):
    """
    Suhbatdagi barcha xabarlar (pagination bilan).
    Eng yangilari oxirida.
    """
    conversation = db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    ).scalar_one_or_none()

    if not conversation:
        raise HTTPException(status_code=404, detail="Suhbat topilmadi.")

    if current_user.id not in (conversation.seller_id, conversation.buyer_id):
        raise HTTPException(status_code=403, detail="Ruxsat yo'q.")

    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.sent_at.asc())
        .offset((page - 1) * size)
        .limit(size)
    )
    messages = db.execute(stmt).scalars().all()

    # Ko'rilgan xabarlarni o'qilgan deb belgilash
    db.execute(
        update(Message)
        .where(
            and_(
                Message.conversation_id == conversation_id,
                Message.sender_id != current_user.id,
                Message.is_read == False,
            )
        )
        .values(is_read=True)
    )
    db.commit()

    return messages


@router.delete("/{conversation_id}/message/{message_id}", status_code=200)
async def message_delete(
    db: db_dep,
    current_user: current_user_dep,
    conversation_id: int,
    message_id: int,
):
    """Xabarni o'chirish (faqat jo'natuvchi)."""
    message = db.execute(
        select(Message).where(
            and_(
                Message.id == message_id,
                Message.conversation_id == conversation_id,
            )
        )
    ).scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=404, detail="Xabar topilmadi.")

    if message.sender_id != current_user.id:
        raise HTTPException(status_code=403, detail="Faqat o'z xabaringizni o'chira olasiz.")

    db.delete(message)
    db.commit()
    return {"message": "Xabar o'chirildi."}


@router.patch("/{conversation_id}/message/{message_id}/read", response_model=MessageResponse)
async def message_mark_read(
    db: db_dep,
    current_user: current_user_dep,
    conversation_id: int,
    message_id: int,
):
    """Bitta xabarni o'qilgan deb belgilash."""
    message = db.execute(
        select(Message).where(
            and_(
                Message.id == message_id,
                Message.conversation_id == conversation_id,
            )
        )
    ).scalar_one_or_none()

    if not message:
        raise HTTPException(status_code=404, detail="Xabar topilmadi.")

    # Faqat qabul qiluvchi o'qilgan deb belgilashi mumkin
    if message.sender_id == current_user.id:
        raise HTTPException(status_code=400, detail="O'z xabaringizni o'qilgan deb belgilay olmaysiz.")

    message.is_read = True
    db.commit()
    db.refresh(message)
    return message
