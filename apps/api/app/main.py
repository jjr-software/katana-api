from fastapi import FastAPI

from app.api.amp import router as amp_router
from app.api.audio import router as audio_router
from app.amp_queue import amp_job_queue
from app.api.patches import router as patches_router
from app.health import run_startup_checks

app = FastAPI(title="Katana API", version="0.1.0")
app.include_router(patches_router)
app.include_router(amp_router)
app.include_router(audio_router)


@app.on_event("startup")
async def startup() -> None:
    run_startup_checks()
    await amp_job_queue.start()


@app.on_event("shutdown")
async def shutdown() -> None:
    await amp_job_queue.stop()


@app.get("/api/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
