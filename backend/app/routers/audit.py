from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.audit import AuditLog
from ..models.user import User
from ..services.auth import require_role

router = APIRouter(prefix="/api/audit-logs", tags=["Audit Logs"])

@router.get("")
def get_audit_logs(
    limit: int = Query(50, ge=1, le=200),
    action: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    admin: User = Depends(require_role(["admin"]))
):
    query = db.query(AuditLog).order_by(AuditLog.timestamp.desc())
    if action:
        query = query.filter(AuditLog.action.ilike(f"%{action}%"))
    logs = query.limit(limit).all()

    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "user_id": log.user_id,
            "user_email": log.user_email,
            "role": log.role,
            "action": log.action,
            "entity_type": log.entity_type,
            "details": log.details,
            "status": log.status,
            "ip_address": log.ip_address
        }
        for log in logs
    ]
