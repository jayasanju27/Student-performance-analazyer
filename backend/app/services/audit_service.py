from sqlalchemy.orm import Session
from datetime import datetime
from ..models.audit import AuditLog

def record_audit_log(
    db: Session,
    action: str,
    entity_type: str,
    details: str,
    user_id: int = None,
    user_email: str = None,
    role: str = None,
    status: str = "SUCCESS",
    ip_address: str = None
):
    try:
        log = AuditLog(
            timestamp=datetime.utcnow(),
            user_id=user_id,
            user_email=user_email,
            role=role,
            action=action,
            entity_type=entity_type,
            details=details,
            status=status,
            ip_address=ip_address
        )
        db.add(log)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Failed to write audit log: {e}")
