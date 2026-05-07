from datetime import date
from typing import Literal

from fastapi import Depends, FastAPI, HTTPException, Header
from pydantic import BaseModel, EmailStr, Field

app = FastAPI(title="Resident Self-Service API")


class Profile(BaseModel):
    resident_id: int
    name: str
    email: EmailStr
    phone: str


class AccountResponse(BaseModel):
    profile: Profile
    balance: float
    next_due_date: date | None


class Invoice(BaseModel):
    id: int
    status: Literal["paid", "pending", "overdue"]
    amount: float
    due_date: date


class Payment(BaseModel):
    id: int
    invoice_id: int
    amount: float
    paid_at: date
    method: str


class Receipt(BaseModel):
    id: int
    payment_id: int
    download_url: str


class UpdateProfileRequest(BaseModel):
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=7, max_length=20)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=8)
    new_password: str = Field(min_length=8)


class ResidentRecord(BaseModel):
    profile: Profile
    password: str
    balance: float
    next_due_date: date | None
    invoices: list[Invoice]
    payments: list[Payment]
    receipts: list[Receipt]


DB: dict[int, ResidentRecord] = {
    1001: ResidentRecord(
        profile=Profile(
            resident_id=1001,
            name="Alex Rivera",
            email="alex.rivera@example.com",
            phone="+1-555-0100",
        ),
        password="currentPassword1",
        balance=350.00,
        next_due_date=date(2026, 6, 1),
        invoices=[
            Invoice(id=1, status="paid", amount=1200.00, due_date=date(2026, 4, 1)),
            Invoice(id=2, status="pending", amount=1200.00, due_date=date(2026, 5, 1)),
        ],
        payments=[
            Payment(id=1, invoice_id=1, amount=1200.00, paid_at=date(2026, 4, 2), method="card")
        ],
        receipts=[
            Receipt(id=1, payment_id=1, download_url="https://example.com/receipts/1.pdf")
        ],
    )
}


def get_current_resident(x_resident_id: int | None = Header(default=None)) -> ResidentRecord:
    """
    Very simple resident auth context for this implementation.
    In production, replace with a real auth token and claims extraction.
    """
    if x_resident_id is None:
        raise HTTPException(status_code=401, detail="Missing resident identity")

    resident = DB.get(x_resident_id)
    if not resident:
        raise HTTPException(status_code=403, detail="Resident not authorized")
    return resident


@app.get("/me/account", response_model=AccountResponse)
def get_account(resident: ResidentRecord = Depends(get_current_resident)):
    return AccountResponse(
        profile=resident.profile,
        balance=resident.balance,
        next_due_date=resident.next_due_date,
    )


@app.get("/me/invoices", response_model=list[Invoice])
def get_invoices(resident: ResidentRecord = Depends(get_current_resident)):
    return resident.invoices


@app.get("/me/payments", response_model=list[Payment])
def get_payments(resident: ResidentRecord = Depends(get_current_resident)):
    return resident.payments


@app.get("/me/receipts", response_model=list[Receipt])
def get_receipts(resident: ResidentRecord = Depends(get_current_resident)):
    return resident.receipts


@app.patch("/me/profile", response_model=Profile)
def patch_profile(payload: UpdateProfileRequest, resident: ResidentRecord = Depends(get_current_resident)):
    updated = resident.profile.model_copy(deep=True)

    if payload.email is not None:
        updated.email = payload.email
    if payload.phone is not None:
        updated.phone = payload.phone

    resident.profile = updated
    return resident.profile


@app.patch("/me/password")
def patch_password(payload: ChangePasswordRequest, resident: ResidentRecord = Depends(get_current_resident)):
    if resident.password != payload.current_password:
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    resident.password = payload.new_password
    return {"message": "Password updated successfully"}
