from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from enum import Enum

from sqlalchemy import (
    JSON,
    BigInteger,
    Boolean,
    Date,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    RESIDENT = "resident"


class InvoiceStatus(str, Enum):
    DRAFT = "draft"
    ISSUED = "issued"
    PARTIAL = "partial"
    PAID = "paid"
    OVERDUE = "overdue"
    VOID = "void"


class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    ACH = "ach"
    WIRE = "wire"
    CHECK = "check"


class DisputeStatus(str, Enum):
    OPEN = "open"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    IN_APP = "in_app"


class JobStatus(str, Enum):
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(SAEnum(UserRole, name="user_role"), nullable=False, default=UserRole.RESIDENT)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    resident: Mapped["Resident"] = relationship(back_populates="user", uselist=False)


class Resident(Base, TimestampMixin):
    __tablename__ = "residents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    unit_number: Mapped[str] = mapped_column(String(50), nullable=False)
    lease_start_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    lease_end_date: Mapped[datetime | None] = mapped_column(Date, nullable=True)
    phone: Mapped[str | None] = mapped_column(String(25), nullable=True)
    emergency_contact_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(25), nullable=True)

    user: Mapped[User] = relationship(back_populates="resident")


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"
    __table_args__ = (Index("ix_invoices_resident_status_due", "resident_id", "status", "due_date"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    resident_id: Mapped[int] = mapped_column(ForeignKey("residents.id", ondelete="RESTRICT"), nullable=False)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    issue_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    due_date: Mapped[datetime] = mapped_column(Date, nullable=False)
    subtotal: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=Decimal("0.00"))
    total_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    balance_due: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    status: Mapped[InvoiceStatus] = mapped_column(SAEnum(InvoiceStatus, name="invoice_status"), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class InvoiceItem(Base, TimestampMixin):
    __tablename__ = "invoice_items"
    __table_args__ = (Index("ix_invoice_items_invoice", "invoice_id"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    description: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False, default=Decimal("1.00"))
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    line_total: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"
    __table_args__ = (Index("ix_payments_invoice_paid", "invoice_id", "paid_at"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id", ondelete="RESTRICT"), nullable=False)
    resident_id: Mapped[int] = mapped_column(ForeignKey("residents.id", ondelete="RESTRICT"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    method: Mapped[PaymentMethod] = mapped_column(SAEnum(PaymentMethod, name="payment_method"), nullable=False)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    transaction_reference: Mapped[str | None] = mapped_column(String(100), nullable=True)


class Receipt(Base, TimestampMixin):
    __tablename__ = "receipts"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    payment_id: Mapped[int] = mapped_column(ForeignKey("payments.id", ondelete="CASCADE"), nullable=False, unique=True)
    receipt_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    document_url: Mapped[str | None] = mapped_column(String(500), nullable=True)


class Dispute(Base, TimestampMixin):
    __tablename__ = "disputes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    invoice_id: Mapped[int] = mapped_column(ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False)
    resident_id: Mapped[int] = mapped_column(ForeignKey("residents.id", ondelete="CASCADE"), nullable=False)
    opened_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[DisputeStatus] = mapped_column(SAEnum(DisputeStatus, name="dispute_status"), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    channel: Mapped[NotificationChannel] = mapped_column(
        SAEnum(NotificationChannel, name="notification_channel"), nullable=False
    )
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (Index("ix_audit_logs_entity", "entity_type", "entity_id"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    metadata: Mapped[dict] = mapped_column(JSON, nullable=False, default={})
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class SystemSetting(Base, TimestampMixin):
    __tablename__ = "system_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[dict] = mapped_column(JSON, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)


class Announcement(Base, TimestampMixin):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)


class ImportJob(Base, TimestampMixin):
    __tablename__ = "import_jobs"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    requested_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    source_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[JobStatus] = mapped_column(SAEnum(JobStatus, name="job_status"), nullable=False)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    failed_rows: Mapped[int] = mapped_column(Integer, nullable=False, default=0)


class ImportJobError(Base):
    __tablename__ = "import_job_errors"
    __table_args__ = (Index("ix_import_job_errors_job_row", "import_job_id", "row_number"),)

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    import_job_id: Mapped[int] = mapped_column(ForeignKey("import_jobs.id", ondelete="CASCADE"), nullable=False)
    row_number: Mapped[int] = mapped_column(Integer, nullable=False)
    field_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    error_message: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


class Export(Base, TimestampMixin):
    __tablename__ = "exports"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True)
    requested_by_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    export_type: Mapped[str] = mapped_column(String(100), nullable=False)
    filters: Mapped[dict] = mapped_column(JSON, nullable=False, default={})
    status: Mapped[JobStatus] = mapped_column(SAEnum(JobStatus, name="export_job_status"), nullable=False)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
