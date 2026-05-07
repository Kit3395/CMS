import csv
import io
import os
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, HTTPException, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from dotenv import load_dotenv
from app.db import SessionLocal, engine, Base
from app.models import (
    ImportJob,
    ImportJobError,
    User,
    Resident
)

load_dotenv()

app = FastAPI()

# Create tables on startup
Base.metadata.create_all(bind=engine)


# Dependency: DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ─────────────────────────────────────────────
# POST /imports/residents  (Admin/SU only)
# ─────────────────────────────────────────────
@app.post("/imports/residents")
async def import_residents(
    request: Request,
    file: UploadFile = File(...),
):
    role = request.headers.get("x-role")
    if role not in ("ADMIN", "SU"):
        raise HTTPException(status_code=403, detail="Admin/SU role required")

    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be CSV")

    db: Session = next(get_db())

    # Create import job
    job = ImportJob(
        started_at=datetime.utcnow(),
        status="processing",
        total_rows=0,
        success_rows=0,
        error_rows=0,
    )
    db.add(job)
    db.commit()
    db.refresh(job)

    content = await file.read()
    text = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(text))

    row_number = 1

    for row in reader:
        job.total_rows += 1

        try:
            # Validate required fields
            required = ["name", "email", "phase", "block", "lot"]
            for field in required:
                if not row.get(field):
                    raise ValueError(f"Missing required field: {field}")

            # Validate email format
            if "@" not in row["email"]:
                raise ValueError("Invalid email format")

            # Duplicate email check
            existing = db.query(User).filter(User.email == row["email"]).first()
            if existing:
                raise ValueError("Duplicate email")

            # Create User + Resident
            user = User(
                name=row["name"],
                email=row["email"],
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            resident = Resident(
                user_id=user.id,
                phase=row["phase"],
                block=row["block"],
                lot=row["lot"],
            )
            db.add(resident)

            job.success_rows += 1

        except Exception as e:
            # Log row-level error
            err = ImportJobError(
                job_id=job.id,
                row_number=row_number,
                raw_row=str(row),
                error_message=str(e),
            )
            db.add(err)
            job.error_rows += 1

        row_number += 1
        db.commit()

    # Finalize job
    job.status = "completed"
    job.completed_at = datetime.utcnow()
    db.commit()

    return {
        "job_id": job.id,
        "total_rows": job.total_rows,
        "success_rows": job.success_rows,
        "error_rows": job.error_rows,
    }
