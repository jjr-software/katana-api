from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_name: str = "katana-api"
    database_url: str = "postgresql+psycopg://katana:katana@db:5432/katana"
    pipewire_socket: str = "/run/user/1000/pipewire-0"
    midi_device_dir: str = "/dev/snd"
    katana_midi_port: str = "hw:1,0,0"
    amidi_timeout_seconds: float = 2.0
    full_sync_timeout_seconds: float = 120.0
    quick_sync_timeout_seconds: float = 45.0


@lru_cache
def get_settings() -> Settings:
    return Settings()
