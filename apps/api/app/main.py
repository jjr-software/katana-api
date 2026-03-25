from fastapi import FastAPI

from app.api.patches import router as patches_router
from app.health import run_startup_checks

app = FastAPI(title="Katana API", version="0.1.0")
app.include_router(patches_router)


@app.on_event("startup")
def startup() -> None:
    run_startup_checks()


@app.get("/api/healthz")
def healthz() -> dict[str, str]:
    return {"status": "ok"}
