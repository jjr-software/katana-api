import asyncio
import json
from copy import deepcopy
from urllib import error as urllib_error
from urllib import request as urllib_request

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from pydantic import ValidationError

from app.settings import Settings, get_settings

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

SYSTEM_PROMPT = """You are a BOSS Katana Gen 3 patch advisor.

You are advising on a single Katana patch snapshot from a web editor. The patch JSON is authoritative.

Rules:
- Only suggest changes to fields that already exist in the provided patch JSON.
- Pick exactly one numeric control field and exactly one numeric suggested value.
- Prefer concrete Katana changes over vague tone adjectives.
- Focus on guitar tone shaping: EQ, gain, level, booster/mod/fx/delay/reverb, noise suppressor, routing, send/return, solo, pedal FX.
- Use dotted object paths only, for example `amp.volume` or `stages.booster.effect_level`.
- Do not use array indexing, bracket syntax, or `raw` fields.
- If a value is likely centered or neutral, say so plainly.
- Avoid inventing unsupported pedals, controls, or hidden parameters.
- Keep suggestions practical and audible.
- Keep the rationale short.
- Return JSON only. No markdown. No prose outside the JSON object.

The JSON object must match this shape:
{
  "summary": "short summary",
  "suggested_change": {
    "field": "precise dotted field path",
    "current_value": "number",
    "suggested_value": "number",
    "rationale": "short audible reason"
  }
}
"""


class PatchAdviceRequest(BaseModel):
    patch: dict = Field(description="Katana patch snapshot")
    slot_label: str | None = Field(default=None, max_length=16)
    question: str | None = Field(default=None, max_length=800)


class PatchAdviceChange(BaseModel):
    field: str
    current_value: int | float
    suggested_value: int | float
    rationale: str


class PatchAdviceResponse(BaseModel):
    summary: str
    suggested_change: PatchAdviceChange
    proposed_patch: dict
    model: str | None = None


def _resolve_path(target: dict, field_path: str) -> tuple[dict, str]:
    if "[" in field_path or "]" in field_path or ".raw" in field_path or field_path.startswith("raw"):
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned unsupported field path syntax",
                "field": field_path,
            },
        )
    path = [segment for segment in field_path.split(".") if segment]
    if not path:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned empty field path",
                "field": field_path,
            },
        )
    current: object = target
    for segment in path[:-1]:
        if not isinstance(current, dict) or segment not in current:
            raise HTTPException(
                status_code=502,
                detail={
                    "message": "AI returned unknown field path",
                    "field": field_path,
                    "missing_segment": segment,
                },
            )
        current = current[segment]
    if not isinstance(current, dict):
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned non-object parent path",
                "field": field_path,
            },
        )
    leaf = path[-1]
    if leaf not in current:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned unknown leaf field",
                "field": field_path,
                "leaf": leaf,
            },
        )
    return current, leaf


def _read_numeric_field(source_patch: dict, field_path: str) -> int | float:
    parent, leaf = _resolve_path(source_patch, field_path)
    value = parent[leaf]
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise HTTPException(
            status_code=502,
            detail={
                "message": "AI returned non-numeric field",
                "field": field_path,
                "value": value,
            },
        )
    return value


def _apply_path_value(target: dict, field_path: str, value: int | float) -> None:
    parent, leaf = _resolve_path(target, field_path)
    parent[leaf] = value


def _materialize_proposed_patch(source_patch: dict, change: PatchAdviceChange) -> dict:
    proposed = deepcopy(source_patch)
    _apply_path_value(proposed, change.field, change.suggested_value)
    proposed.pop("config_hash_sha256", None)
    return proposed


def _extract_response_text(payload: dict) -> str:
    output_text = payload.get("output_text")
    if isinstance(output_text, str) and output_text.strip():
        return output_text.strip()
    output = payload.get("output")
    if isinstance(output, list):
        chunks: list[str] = []
        for item in output:
            if not isinstance(item, dict):
                continue
            content = item.get("content")
            if not isinstance(content, list):
                continue
            for block in content:
                if not isinstance(block, dict):
                    continue
                if block.get("type") != "output_text":
                    continue
                text = block.get("text")
                if isinstance(text, str) and text.strip():
                    chunks.append(text.strip())
        if chunks:
            return "\n".join(chunks)
    raise HTTPException(
        status_code=502,
        detail={
            "message": "OpenAI response missing output_text",
            "response": payload,
        },
    )


def _call_openai_patch_advisor(settings: Settings, request_payload: PatchAdviceRequest) -> PatchAdviceResponse:
    user_prompt = {
        "slot_label": request_payload.slot_label,
        "question": (request_payload.question or "Suggest the most useful concrete improvements for this patch.").strip(),
        "patch": request_payload.patch,
    }
    body = {
        "model": settings.openai_model,
        "input": [
            {
                "role": "system",
                "content": [{"type": "input_text", "text": SYSTEM_PROMPT}],
            },
            {
                "role": "user",
                "content": [{"type": "input_text", "text": json.dumps(user_prompt, separators=(",", ":"))}],
            },
        ],
        "max_output_tokens": 4000,
        "reasoning": {
            "effort": "minimal",
        },
        "text": {
            "verbosity": "low",
        },
    }
    req = urllib_request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(body).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {settings.openai_api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=60) as response:
            raw = response.read().decode("utf-8")
    except urllib_error.HTTPError as exc:
        response_text = exc.read().decode("utf-8", errors="replace")
        raise HTTPException(
            status_code=502,
            detail={
                "message": "OpenAI request failed",
                "status": exc.code,
                "response": response_text,
            },
        ) from exc
    except urllib_error.URLError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "OpenAI network request failed",
                "error": str(exc),
            },
        ) from exc
    payload = json.loads(raw)
    advice_json = _extract_response_text(payload)
    try:
        advice_payload = json.loads(advice_json)
    except json.JSONDecodeError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "OpenAI returned non-JSON advice",
                "output_text": advice_json,
            },
        ) from exc
    try:
        validated_change = PatchAdviceChange.model_validate(advice_payload.get("suggested_change"))
    except ValidationError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "message": "OpenAI returned invalid advice shape",
                "errors": exc.errors(),
                "payload": advice_payload,
            },
        ) from exc
    actual_current = _read_numeric_field(request_payload.patch, validated_change.field)
    advice_payload["suggested_change"] = validated_change.model_copy(update={"current_value": actual_current}).model_dump()
    if "proposed_patch" not in advice_payload:
        advice_payload["proposed_patch"] = _materialize_proposed_patch(request_payload.patch, validated_change)
    advice = PatchAdviceResponse.model_validate(advice_payload)
    return advice.model_copy(update={"model": settings.openai_model})


@router.post("/patch-advice", response_model=PatchAdviceResponse)
async def get_patch_advice(
    payload: PatchAdviceRequest,
    settings: Settings = Depends(get_settings),
) -> PatchAdviceResponse:
    return await asyncio.to_thread(_call_openai_patch_advisor, settings, payload)
