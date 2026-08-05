from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.session import Base

STATUS_AVAILABLE = "AVAILABLE"
STATUS_USED = "USED"
STATUS_REVOKED = "REVOKED"
STATUS_EXPIRED = "EXPIRED"
STATUS_DISABLED = "DISABLED"


class LicenseKey(Base):
    __tablename__ = "license_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, nullable=False, default=STATUS_AVAILABLE)
    assigned_to_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    used_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id])
    used_by = relationship("User", foreign_keys=[used_by_user_id])
