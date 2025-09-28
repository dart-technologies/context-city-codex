from __future__ import annotations

import logging
import os
from typing import Any, Dict

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ..preferences import PreferenceResult, _coerce_service_payload

logger = logging.getLogger(__name__)


class PreferenceProfile(BaseModel):
    profile: Dict[str, Any]


class PreferenceResponse(BaseModel):
    primary_locale: str = Field(..., description="Primary language code inferred for the Codex user")
    secondary_locales: list[str] = Field(default_factory=list)
    needs_captions: bool = False
    needs_audio_description: bool = False
    needs_haptics: bool = False
    needs_reduced_motion: bool = False
    notes: list[str] = Field(default_factory=list)

    @classmethod
    def from_result(cls, result: PreferenceResult) -> "PreferenceResponse":
        return cls(**result.__dict__)


router = APIRouter()


async def _call_gpt_service(payload: Dict[str, Any]) -> Dict[str, Any]:
    endpoint = os.environ.get("CODEX_PREFERENCES_ENDPOINT")
    api_key = os.environ.get("CODEX_PREFERENCES_API_KEY")
    if not endpoint or not api_key:
        raise HTTPException(status_code=500, detail="Preference service missing CODEX_PREFERENCES_* env vars")

    timeout = float(os.environ.get("CODEX_PREFERENCES_TIMEOUT", "6"))
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            response = await client.post(endpoint, json=payload, headers=headers)
        except httpx.HTTPError as exc:
            logger.error("GPT preference call failed: %s", exc)
            raise HTTPException(status_code=502, detail="Failed to reach GPT preference endpoint") from exc

    if response.status_code >= 400:
        logger.error("GPT preference endpoint returned %s: %s", response.status_code, response.text)
        raise HTTPException(status_code=502, detail="GPT preference endpoint returned an error")

    try:
        return response.json()
    except ValueError as exc:
        logger.error("GPT preference endpoint returned invalid JSON: %s", response.text)
        raise HTTPException(status_code=502, detail="Invalid JSON from GPT preference endpoint") from exc


@router.post("/preferences", response_model=PreferenceResponse)
async def infer_preferences(body: PreferenceProfile) -> PreferenceResponse:
    payload = {"profile": body.profile}
    service_response = await _call_gpt_service(payload)
    result = _coerce_service_payload(service_response)
    return PreferenceResponse.from_result(result)
