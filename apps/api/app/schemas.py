from datetime import datetime

from pydantic import BaseModel, Field


class PatchCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    source: str = Field(min_length=1, max_length=64)
    tags: list[str] = Field(default_factory=list)
    snapshot: dict


class PatchRead(BaseModel):
    id: int
    name: str
    source: str
    tags: list[str]
    snapshot: dict
    checksum: str
    created_at: datetime

    model_config = {"from_attributes": True}
