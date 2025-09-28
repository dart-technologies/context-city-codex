from __future__ import annotations

import json
import uuid
from dataclasses import dataclass, field
from datetime import timedelta
from pathlib import Path
from typing import Any, Dict, Optional
from urllib import error, request

from .video_assembly import Storyboard


@dataclass
class StorageConfig:
    """Configuration for render storage backends."""

    provider: str = 'local'
    output_dir: Path = Path('renders')
    base_url: Optional[str] = None
    retention_days: int = 7
    generate_signed_urls: bool = True
    gcs_bucket: Optional[str] = None
    gcs_prefix: str = 'renders'
    gcs_credentials: Optional[str] = None
    signed_url_ttl: int = 3600
    copy_video_asset: bool = False


@dataclass
class StorageResult:
    """Details about stored render artifacts."""

    provider: str
    render_id: str
    manifest_path: str
    payload_path: str
    storyboard_path: str
    response_path: str
    signed_manifest_url: Optional[str] = None
    signed_video_url: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)


class LocalRenderStorage:
    """Persists render artifacts to the local filesystem and fabricates signed URL placeholders."""

    def __init__(self, config: StorageConfig) -> None:
        if config.provider != 'local':
            raise ValueError(f'Unsupported provider for LocalRenderStorage: {config.provider}')
        self.config = config
        self.output_dir = Path(config.output_dir)

    def store(
        self,
        *,
        storyboard: Storyboard,
        render_payload: Dict[str, Any],
        manifest: Dict[str, Any],
        render_response: Dict[str, Any],
    ) -> StorageResult:
        render_id = self._resolve_render_id(render_response)
        render_dir = self.output_dir / storyboard.poi.id / render_id
        render_dir.mkdir(parents=True, exist_ok=True)

        manifest_path = render_dir / 'manifest.json'
        payload_path = render_dir / 'render_payload.json'
        storyboard_path = render_dir / 'storyboard.json'
        response_path = render_dir / 'render_response.json'

        manifest_path.write_text(json.dumps(manifest, indent=2))
        payload_path.write_text(json.dumps(render_payload, indent=2))
        storyboard_path.write_text(json.dumps(storyboard.to_dict(), indent=2))
        response_path.write_text(json.dumps(render_response, indent=2))

        signed_manifest_url = self._make_signed_url(storyboard.poi.id, render_id, 'manifest.json')
        signed_video_url = self._resolve_video_url(render_response, storyboard.poi.id, render_id)

        metadata = {
            'retention_days': self.config.retention_days,
            'locale': storyboard.poi.locale,
            'asset_count': len(storyboard.segments),
        }

        return StorageResult(
            provider=self.config.provider,
            render_id=render_id,
            manifest_path=str(manifest_path),
            payload_path=str(payload_path),
            storyboard_path=str(storyboard_path),
            response_path=str(response_path),
            signed_manifest_url=signed_manifest_url,
            signed_video_url=signed_video_url,
            metadata=metadata,
        )

    def _resolve_render_id(self, render_response: Dict[str, Any]) -> str:
        for key in ('render_id', 'id', 'job_id'):
            value = render_response.get(key)
            if isinstance(value, str) and value:
                return value
        return f'render-{uuid.uuid4().hex[:12]}'

    def _make_signed_url(self, poi_id: str, render_id: str, filename: str) -> Optional[str]:
        if not self.config.base_url or not self.config.generate_signed_urls:
            return None
        base = self.config.base_url.rstrip('/')
        return f'{base}/{poi_id}/{render_id}/{filename}?signature=demo'

    def _resolve_video_url(
        self,
        render_response: Dict[str, Any],
        poi_id: str,
        render_id: str,
    ) -> Optional[str]:
        for key in ('download_url', 'result_url', 'url', 'video_url'):
            value = render_response.get(key)
            if isinstance(value, str) and value:
                return value
        if self.config.base_url and self.config.generate_signed_urls:
            base = self.config.base_url.rstrip('/')
            return f'{base}/{poi_id}/{render_id}/render.mp4?signature=demo'
        return None


class GCSRenderStorage:
    """Uploads render artifacts to Google Cloud Storage and returns signed URLs."""

    def __init__(self, config: StorageConfig) -> None:
        if config.provider != 'gcs':
            raise ValueError(f'Unsupported provider for GCSRenderStorage: {config.provider}')
        if not config.gcs_bucket:
            raise ValueError('StorageConfig.gcs_bucket is required when provider is "gcs"')

        try:
            from google.cloud import storage as gcs_storage
        except ImportError as exc:  # pragma: no cover - exercised via tests with stubs
            raise RuntimeError(
                'google-cloud-storage must be installed to use the GCS storage provider'
            ) from exc

        self.config = config
        if config.gcs_credentials:
            self.client = gcs_storage.Client.from_service_account_json(config.gcs_credentials)
        else:
            self.client = gcs_storage.Client()
        self.bucket = self.client.bucket(config.gcs_bucket)

    def store(
        self,
        *,
        storyboard: Storyboard,
        render_payload: Dict[str, Any],
        manifest: Dict[str, Any],
        render_response: Dict[str, Any],
    ) -> StorageResult:
        render_id = self._resolve_render_id(render_response)
        manifest_blob = self._upload_json(storyboard, render_id, 'manifest.json', manifest)
        payload_blob = self._upload_json(storyboard, render_id, 'render_payload.json', render_payload)
        storyboard_blob = self._upload_json(
            storyboard,
            render_id,
            'storyboard.json',
            storyboard.to_dict(),
        )
        response_blob = self._upload_json(storyboard, render_id, 'render_response.json', render_response)

        signed_manifest_url = self._signed_url(manifest_blob)
        signed_video_url = self._resolve_video_url(render_response)

        if self.config.copy_video_asset:
            video_blob = self._copy_video_if_available(storyboard, render_id, render_response)
            if video_blob is not None:
                signed_video_url = self._signed_url(video_blob) or signed_video_url

        metadata = {
            'retention_days': self.config.retention_days,
            'locale': storyboard.poi.locale,
            'asset_count': len(storyboard.segments),
            'bucket': self.bucket.name,
            'object_prefix': self.config.gcs_prefix,
        }

        return StorageResult(
            provider=self.config.provider,
            render_id=render_id,
            manifest_path=self._blob_uri(manifest_blob),
            payload_path=self._blob_uri(payload_blob),
            storyboard_path=self._blob_uri(storyboard_blob),
            response_path=self._blob_uri(response_blob),
            signed_manifest_url=signed_manifest_url,
            signed_video_url=signed_video_url,
            metadata=metadata,
        )

    def _resolve_render_id(self, render_response: Dict[str, Any]) -> str:
        for key in ('render_id', 'id', 'job_id'):
            value = render_response.get(key)
            if isinstance(value, str) and value:
                return value
        return f'render-{uuid.uuid4().hex[:12]}'

    def _object_path(self, storyboard: Storyboard, render_id: str, filename: str) -> str:
        prefix = (self.config.gcs_prefix or '').strip('/')
        parts = [part for part in (prefix, storyboard.poi.id, render_id, filename) if part]
        return '/'.join(parts)

    def _upload_json(
        self,
        storyboard: Storyboard,
        render_id: str,
        filename: str,
        payload: Dict[str, Any],
    ):
        blob = self.bucket.blob(self._object_path(storyboard, render_id, filename))
        blob.upload_from_string(json.dumps(payload, indent=2), content_type='application/json')
        return blob

    def _copy_video_if_available(
        self,
        storyboard: Storyboard,
        render_id: str,
        render_response: Dict[str, Any],
    ):
        source_url = self._resolve_video_url(render_response)
        if not source_url:
            return None
        blob = self.bucket.blob(self._object_path(storyboard, render_id, 'render.mp4'))
        try:
            payload = self._fetch_bytes(source_url)
        except CreatomateCopyError:
            return None
        blob.upload_from_string(payload, content_type='video/mp4')
        return blob

    def _fetch_bytes(self, url: str) -> bytes:
        try:
            with request.urlopen(url, timeout=30) as response:
                return response.read()
        except error.URLError as exc:  # pragma: no cover - exercised in integration
            raise CreatomateCopyError(f'Failed to fetch render asset from {url}') from exc

    def _resolve_video_url(self, render_response: Dict[str, Any]) -> Optional[str]:
        for key in ('download_url', 'result_url', 'url', 'video_url'):
            value = render_response.get(key)
            if isinstance(value, str) and value:
                return value
        return None

    def _signed_url(self, blob) -> Optional[str]:
        if not self.config.generate_signed_urls:
            return None
        try:
            return blob.generate_signed_url(
                expiration=timedelta(seconds=self.config.signed_url_ttl),
                method='GET',
            )
        except Exception:  # pragma: no cover - depends on credentials capabilities
            return None

    def _blob_uri(self, blob) -> str:
        return f'gs://{self.bucket.name}/{blob.name}'


class CreatomateCopyError(RuntimeError):
    """Raised when a remote render asset cannot be copied into storage."""


def create_storage(config: StorageConfig) -> LocalRenderStorage | GCSRenderStorage:
    if config.provider == 'local':
        return LocalRenderStorage(config)
    if config.provider == 'gcs':
        return GCSRenderStorage(config)
    raise ValueError(f'Unsupported storage provider: {config.provider}')


__all__ = [
    'StorageConfig',
    'StorageResult',
    'LocalRenderStorage',
    'GCSRenderStorage',
    'CreatomateCopyError',
    'create_storage',
]
