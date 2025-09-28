from __future__ import annotations

from fastapi import FastAPI

from .preferences_service import router as preferences_router

app = FastAPI(title="Codex Preference Service", version="0.1.0")
app.include_router(preferences_router)


@app.get("/healthz")
def health() -> dict[str, str]:
    return {"status": "ok"}
