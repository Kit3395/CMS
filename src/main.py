from __future__ import annotations

from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from fastapi import FastAPI, Header, HTTPException

from autofix_module import AutofixService, InMemoryStore

store = InMemoryStore()
autofix_service = AutofixService(store)
scheduler = BackgroundScheduler()


def _run_scheduled_autofix() -> None:
    autofix_service.run(trigger="cron")


@asynccontextmanager
async def lifespan(_: FastAPI):
    scheduler.add_job(_run_scheduled_autofix, "cron", minute="*/30", id="system-autofix")
    scheduler.start()
    try:
        yield
    finally:
        scheduler.shutdown(wait=False)


app = FastAPI(lifespan=lifespan)


@app.post("/system/autofix")
def run_autofix(x_role: str = Header(default="")):
    if x_role != "SU":
        raise HTTPException(status_code=403, detail="Only SU can trigger autofix")

    summary = autofix_service.run(trigger="manual")
    return {
        "ok": True,
        "summary": summary,
    }
