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


class PatchConfigUpsert(BaseModel):
    snapshot: dict


class PatchConfigRead(BaseModel):
    hash_id: str
    snapshot: dict
    created_at: datetime

    model_config = {"from_attributes": True}


class PatchSetCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    notes: str = Field(default="")


class PatchSetRead(BaseModel):
    id: int
    name: str
    notes: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PatchSetMemberUpsert(BaseModel):
    hash_id: str = Field(min_length=64, max_length=64)
    variation_note: str = Field(default="")


class PatchSetMemberRead(BaseModel):
    id: int
    patch_set_id: int
    hash_id: str
    variation_note: str
    created_at: datetime

    model_config = {"from_attributes": True}
