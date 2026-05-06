from datetime import datetime, timezone
from typing import Dict, List, Literal, Optional
from uuid import uuid4

from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="CMS Admin Management API")


class AdminCreateRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=100)
    role: Literal["admin", "editor", "viewer"] = "admin"


class AdminUpdateRequest(BaseModel):
    role: Optional[Literal["admin", "editor", "viewer"]] = None
    status: Optional[Literal["active", "inactive"]] = None


class AdminRecord(BaseModel):
    id: str
    email: EmailStr
    name: str
    role: Literal["admin", "editor", "viewer"]
    status: Literal["active", "inactive", "deleted"]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class AuditEntry(BaseModel):
    id: str
    actor_role: str
    action: Literal["create", "list", "update", "delete"]
    target_admin_id: Optional[str] = None
    metadata: Dict[str, str]
    timestamp: datetime


admins: Dict[str, AdminRecord] = {}
audit_log: List[AuditEntry] = []


def require_su(actor_role: Optional[str]) -> None:
    if actor_role != "SU":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Super-user access required",
        )


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def write_audit(
    actor_role: str,
    action: Literal["create", "list", "update", "delete"],
    target_admin_id: Optional[str] = None,
    metadata: Optional[Dict[str, str]] = None,
) -> None:
    audit_log.append(
        AuditEntry(
            id=str(uuid4()),
            actor_role=actor_role,
            action=action,
            target_admin_id=target_admin_id,
            metadata=metadata or {},
            timestamp=now_utc(),
        )
    )


@app.post("/admins", response_model=AdminRecord, status_code=status.HTTP_201_CREATED)
def create_admin(payload: AdminCreateRequest, x_user_role: Optional[str] = Header(default=None)):
    require_su(x_user_role)

    if any(admin.email == payload.email and admin.status != "deleted" for admin in admins.values()):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin email already exists")

    admin_id = str(uuid4())
    timestamp = now_utc()
    record = AdminRecord(
        id=admin_id,
        email=payload.email,
        name=payload.name,
        role=payload.role,
        status="active",
        created_at=timestamp,
        updated_at=timestamp,
    )
    admins[admin_id] = record
    write_audit("SU", "create", admin_id, {"email": payload.email, "role": payload.role})
    return record


@app.get("/admins", response_model=List[AdminRecord])
def list_admins(include_deleted: bool = False, x_user_role: Optional[str] = Header(default=None)):
    require_su(x_user_role)

    records = list(admins.values())
    if not include_deleted:
        records = [admin for admin in records if admin.status != "deleted"]

    write_audit("SU", "list", metadata={"include_deleted": str(include_deleted).lower()})
    return records


@app.patch("/admins/{admin_id}", response_model=AdminRecord)
def update_admin(admin_id: str, payload: AdminUpdateRequest, x_user_role: Optional[str] = Header(default=None)):
    require_su(x_user_role)

    record = admins.get(admin_id)
    if not record or record.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    changes: Dict[str, str] = {}
    updated_values = record.model_dump()

    if payload.role is not None and payload.role != record.role:
        updated_values["role"] = payload.role
        changes["role"] = payload.role

    if payload.status is not None and payload.status != record.status:
        updated_values["status"] = payload.status
        changes["status"] = payload.status

    if not changes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No changes provided")

    updated_values["updated_at"] = now_utc()
    updated_record = AdminRecord(**updated_values)
    admins[admin_id] = updated_record

    write_audit("SU", "update", admin_id, changes)
    return updated_record


@app.delete("/admins/{admin_id}", response_model=AdminRecord)
def delete_admin(admin_id: str, soft_delete: bool = True, x_user_role: Optional[str] = Header(default=None)):
    require_su(x_user_role)

    record = admins.get(admin_id)
    if not record or record.status == "deleted":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    updated_values = record.model_dump()
    updated_values["status"] = "deleted" if soft_delete else "inactive"
    updated_values["updated_at"] = now_utc()
    if soft_delete:
        updated_values["deleted_at"] = now_utc()

    updated_record = AdminRecord(**updated_values)
    admins[admin_id] = updated_record

    write_audit(
        "SU",
        "delete",
        admin_id,
        {"mode": "soft_delete" if soft_delete else "deactivate", "result_status": updated_record.status},
    )
    return updated_record


@app.get("/audit-logs", response_model=List[AuditEntry])
def get_audit_logs(x_user_role: Optional[str] = Header(default=None)):
    require_su(x_user_role)
    return audit_log
