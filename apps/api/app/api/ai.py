import asyncio
import json
from copy import deepcopy
from urllib import error as urllib_error
from urllib import request as urllib_request

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.settings import Settings, get_settings

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

SYSTEM_PROMPT = """You are a BOSS Katana Gen 3 patch advisor.

You are advising on a single Katana patch snapshot from a web editor. The patch JSON is authoritative.

Rules:
- Only suggest changes to fields that already exist in the provided patch JSON.
- Prefer concrete Katana changes over vague tone adjectives.
- Focus on guitar tone shaping: EQ, gain, level, booster/mod/fx/delay/reverb, noise suppressor, routing, send/return, solo, pedal FX.
- When values look like raw device values, still reference the exact field path and exact suggested numeric value.
- If a value is likely centered or neutral, say so plainly.
- Avoid inventing unsupported pedals, controls, or hidden parameters.
- Keep suggestions practical and audible.
- Return at most 6 suggested_changes.
- Keep each rationale short.
- Return at most 3 cautions.
- Return JSON only. No markdown. No prose outside the JSON object.

The JSON object must match this shape:
{
  "summary": "short summary",
  "overall_goal": "what tone direction these changes aim for",
  "suggested_changes": [
    {
      "area": "amp|booster|mod|fx|delay|reverb|eq1|eq2|ns|routing|solo|send_return|pedalfx|colors|delay2",
      "field": "precise field path",
      "current_value": "string or number",
      "suggested_value": "string or number",
      "rationale": "short audible reason"
    }
  ],
  "cautions": [
    "short caution"
  ],
  "proposed_patch": { "full patch object with the suggested changes already applied" }
}
"""


class PatchAdviceRequest(BaseModel):
    patch: dict = Field(description="Katana patch snapshot")
    slot_label: str | None = Field(default=None, max_length=16)
    question: str | None = Field(default=None, max_length=800)


class PatchAdviceChange(BaseModel):
    area: str
    field: str
    current_value: object
    suggested_value: object
    rationale: str


class PatchAdviceResponse(BaseModel):
    summary: str
    overall_goal: str
    suggested_changes: list[PatchAdviceChange]
    cautions: list[str]
    proposed_patch: dict
    model: str | None = None


def _apply_path_value(target: dict, field_path: str, value: object) -> None:
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
    current[leaf] = value


def _materialize_proposed_patch(source_patch: dict, changes: list[PatchAdviceChange]) -> dict:
    proposed = deepcopy(source_patch)
    for change in changes:
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
    if "proposed_patch" not in advice_payload:
        validated_changes = [PatchAdviceChange.model_validate(item) for item in advice_payload.get("suggested_changes", [])]
        advice_payload["proposed_patch"] = _materialize_proposed_patch(request_payload.patch, validated_changes)
    advice = PatchAdviceResponse.model_validate(advice_payload)
    return advice.model_copy(update={"model": settings.openai_model})


@router.post("/patch-advice", response_model=PatchAdviceResponse)
async def get_patch_advice(
    payload: PatchAdviceRequest,
    settings: Settings = Depends(get_settings),
) -> PatchAdviceResponse:
    return await asyncio.to_thread(_call_openai_patch_advisor, settings, payload)
