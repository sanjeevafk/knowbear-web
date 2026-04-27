"""Minimal Upstash Redis REST client for rate limiting and caching."""

from __future__ import annotations

import os

import httpx

from logging_config import logger

_redis_client: "UpstashRedisClient | None" = None


class UpstashRedisClient:
    """Thin wrapper around Upstash Redis REST API."""

    def __init__(self):
        self.base_url = os.getenv("UPSTASH_REDIS_REST_URL", "").rstrip("/")
        self.token = os.getenv("UPSTASH_REDIS_REST_TOKEN", "").strip()
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(0.6), limits=httpx.Limits(max_connections=8, max_keepalive_connections=4))

    @property
    def configured(self) -> bool:
        return bool(self.base_url and self.token)

    @property
    def _headers(self) -> dict[str, str]:
        return {"authorization": f"Bearer {self.token}"}

    async def close(self) -> None:
        await self._client.aclose()

    async def _post(self, path: str, body: object) -> object | None:
        if not self.configured:
            return None
        try:
            response = await self._client.post(
                f"{self.base_url}{path}",
                headers=self._headers,
                json=body,
            )
            if response.status_code >= 400:
                logger.warning("upstash_request_failed", status_code=response.status_code, path=path)
                return None
            payload = response.json()
            if isinstance(payload, dict):
                return payload.get("result")
            return payload
        except Exception as exc:
            logger.warning("upstash_request_exception", path=path, error=str(exc))
            return None

    async def ping(self) -> bool:
        result = await self._post("", ["PING"])
        return str(result).upper() == "PONG"

    async def get(self, key: str) -> str | None:
        result = await self._post("", ["GET", key])
        if result is None:
            return None
        return str(result)

    async def setex(self, key: str, ttl_seconds: int, value: str) -> bool:
        result = await self._post("", ["SETEX", key, str(ttl_seconds), value])
        return str(result).upper() == "OK"

    async def incrby(self, key: str, amount: int) -> int | None:
        result = await self._post("", ["INCRBY", key, str(amount)])
        if result is None:
            return None
        return int(result)

    async def decrby(self, key: str, amount: int) -> int | None:
        result = await self._post("", ["DECRBY", key, str(amount)])
        if result is None:
            return None
        return int(result)

    async def expire(self, key: str, ttl_seconds: int) -> bool:
        result = await self._post("", ["EXPIRE", key, str(ttl_seconds)])
        return bool(result)

    async def ttl(self, key: str) -> int | None:
        result = await self._post("", ["TTL", key])
        if result is None:
            return None
        return int(result)


def get_upstash_redis_client() -> UpstashRedisClient:
    global _redis_client
    if _redis_client is None:
        _redis_client = UpstashRedisClient()
    return _redis_client


async def close_upstash_redis_client() -> None:
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
