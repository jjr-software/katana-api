from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_name: str = "katana-api"
    database_url: str = "postgresql+psycopg://katana:katana@db:5432/katana"
    pipewire_socket: str = "/run/user/1000/pipewire-0"
    midi_device_dir: str = "/dev/snd"


@lru_cache
def get_settings() -> Settings:
    return Settings()
