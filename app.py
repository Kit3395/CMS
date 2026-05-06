from fastapi import FastAPI, UploadFile, File, Depends, Header, HTTPException
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import declarative_base, sessionmaker, Session
import csv
import io

DATABASE_URL = "sqlite:///./cms.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class ImportJob(Base):
    __tablename__ = "import_jobs"
    id = Column(Integer, primary_key=True, index=True)
    import_type = Column(String(50), nullable=False)
    total_rows = Column(Integer, default=0, nullable=False)
    success_rows = Column(Integer, default=0, nullable=False)
    error_rows = Column(Integer, default=0, nullable=False)
    status = Column(String(20), default="processing", nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class ImportJobError(Base):
    __tablename__ = "import_job_errors"
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("import_jobs.id"), nullable=False)
    row_number = Column(Integer, nullable=False)
    raw_row = Column(Text, nullable=False)
    error_message = Column(Text, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True, index=True)


class Resident(Base):
    __tablename__ = "residents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    phase = Column(String(50), nullable=False)
    block = Column(String(50), nullable=False)
    lot = Column(String(50), nullable=False)


class ImportSummary(BaseModel):
    job_id: int
    total_rows: int
    success_rows: int
    error_rows: int


app = FastAPI(title="CMS Import API")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_admin_or_su(x_role: str = Header(default="")):
    if x_role not in {"Admin", "SU"}:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


@app.post("/imports/residents", response_model=ImportSummary, dependencies=[Depends(require_admin_or_su)])
async def import_residents(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")

    content = await file.read()
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))

    required_fields = ["name", "email", "phase", "block", "lot"]
    if not reader.fieldnames:
        raise HTTPException(status_code=400, detail="CSV must include a header row")

    missing_headers = [h for h in required_fields if h not in reader.fieldnames]
    if missing_headers:
        raise HTTPException(status_code=400, detail=f"Missing required headers: {', '.join(missing_headers)}")

    job = ImportJob(import_type="residents", status="processing")
    db.add(job)
    db.commit()
    db.refresh(job)

    total = success = errors = 0

    for row_index, row in enumerate(reader, start=2):
        total += 1
        values = {k: (row.get(k) or "").strip() for k in required_fields}

        missing = [k for k, v in values.items() if not v]
        if missing:
            errors += 1
            db.add(ImportJobError(
                job_id=job.id,
                row_number=row_index,
                raw_row=str(row),
                error_message=f"Missing required fields: {', '.join(missing)}",
            ))
            continue

        try:
            EmailStr._validate(values["email"])
        except Exception:
            errors += 1
            db.add(ImportJobError(
                job_id=job.id,
                row_number=row_index,
                raw_row=str(row),
                error_message="Invalid email format",
            ))
            continue

        existing = db.query(User).filter(User.email == values["email"]).first()
        if existing:
            errors += 1
            db.add(ImportJobError(
                job_id=job.id,
                row_number=row_index,
                raw_row=str(row),
                error_message="Email already exists",
            ))
            continue

        user = User(name=values["name"], email=values["email"])
        db.add(user)
        db.flush()

        resident = Resident(user_id=user.id, phase=values["phase"], block=values["block"], lot=values["lot"])
        db.add(resident)
        success += 1

    job.total_rows = total
    job.success_rows = success
    job.error_rows = errors
    job.status = "completed"

    db.commit()

    return ImportSummary(job_id=job.id, total_rows=total, success_rows=success, error_rows=errors)
