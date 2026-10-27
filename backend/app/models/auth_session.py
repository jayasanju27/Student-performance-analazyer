from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String

from ..database import Base


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id = Column(String(64), primary_key=True)
    user_id = Column(ForeignKey("users.id"), nullable=False, index=True)
    last_activity_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
