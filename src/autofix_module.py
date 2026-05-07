from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List


@dataclass
class Payment:
    id: int
    receipt_id: int | None = None


@dataclass
class Receipt:
    id: int
    payment_id: int
    created_at: datetime


@dataclass
class Notification:
    id: int
    status: str  # queued, sent, failed


@dataclass
class Invoice:
    id: int
    total: float
    paid: float
    balance: float
    flagged_inconsistent: bool = False


@dataclass
class AuditLog:
    action: str
    entity: str
    entity_id: int
    detail: str
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


class InMemoryStore:
    def __init__(self) -> None:
        self.payments: List[Payment] = []
        self.receipts: List[Receipt] = []
        self.notifications: List[Notification] = []
        self.invoices: List[Invoice] = []
        self.audit_logs: List[AuditLog] = []
        self._receipt_id = 1

    def next_receipt_id(self) -> int:
        rid = self._receipt_id
        self._receipt_id += 1
        return rid


class AutofixService:
    def __init__(self, store: InMemoryStore) -> None:
        self.store = store

    def run(self, trigger: str) -> Dict[str, int | str]:
        created_receipts = self._create_missing_receipts()
        requeued_notifications = self._requeue_failed_notifications()
        flagged_invoices = self._flag_inconsistent_invoices()

        return {
            "trigger": trigger,
            "created_receipts": created_receipts,
            "requeued_notifications": requeued_notifications,
            "flagged_invoices": flagged_invoices,
            "audit_logs_written": created_receipts + requeued_notifications + flagged_invoices,
        }

    def _create_missing_receipts(self) -> int:
        count = 0
        for payment in self.store.payments:
            if payment.receipt_id is not None:
                continue

            receipt = Receipt(
                id=self.store.next_receipt_id(),
                payment_id=payment.id,
                created_at=datetime.now(timezone.utc),
            )
            self.store.receipts.append(receipt)
            payment.receipt_id = receipt.id
            self.store.audit_logs.append(
                AuditLog(
                    action="autofix.create_receipt",
                    entity="payment",
                    entity_id=payment.id,
                    detail=f"Created receipt {receipt.id} for payment {payment.id}",
                )
            )
            count += 1
        return count

    def _requeue_failed_notifications(self) -> int:
        count = 0
        for notification in self.store.notifications:
            if notification.status != "failed":
                continue
            notification.status = "queued"
            self.store.audit_logs.append(
                AuditLog(
                    action="autofix.requeue_notification",
                    entity="notification",
                    entity_id=notification.id,
                    detail=f"Re-queued failed notification {notification.id}",
                )
            )
            count += 1
        return count

    def _flag_inconsistent_invoices(self) -> int:
        count = 0
        for invoice in self.store.invoices:
            expected_balance = round(invoice.total - invoice.paid, 2)
            actual_balance = round(invoice.balance, 2)
            if expected_balance == actual_balance:
                continue
            if invoice.flagged_inconsistent:
                continue
            invoice.flagged_inconsistent = True
            self.store.audit_logs.append(
                AuditLog(
                    action="autofix.flag_invoice",
                    entity="invoice",
                    entity_id=invoice.id,
                    detail=(
                        f"Invoice {invoice.id} inconsistent: expected balance {expected_balance}, "
                        f"actual {actual_balance}"
                    ),
                )
            )
            count += 1
        return count
