from collections.abc import Generator

from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.katana import AmpClient
from app.settings import get_settings


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_amp_client() -> AmpClient:
    settings = get_settings()
    return AmpClient(
        midi_port=settings.katana_midi_port,
        timeout_seconds=settings.amidi_timeout_seconds,
        rq1_timeout_seconds=settings.amidi_rq1_timeout_seconds,
    )
