"""In-memory token-based rate limiting for provider budget protection."""

from __future__ import annotations

import asyncio
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from config import get_settings

WINDOW_SECONDS = 3600


class TokenRateLimitExceeded(Exception):
    """Raised when token quota is exceeded for an IP."""

    def __init__(self, message: str, retry_after_seconds: int, retry_at_utc: str):
        super().__init__(message)
        self.message = message
        self.retry_after_seconds = retry_after_seconds
        self.retry_at_utc = retry_at_utc


@dataclass
class TokenUsage:
    timestamp: float
    tokens: int


_usage_by_ip: dict[str, deque[TokenUsage]] = defaultdict(deque)
_usage_totals_by_ip: dict[str, int] = defaultdict(int)
_token_rate_lock = asyncio.Lock()


def estimate_tokens(text: str) -> int:
    """Approximate token count from text length."""
    if not text:
        return 0
    return max(1, len(text) // 4)


async def consume_tokens(ip: str, tokens: int) -> None:
    """Consume tokens for the provided IP inside rolling one-hour window."""
    settings = get_settings()
    if not getattr(settings, "token_rate_limit_enabled", True):
        return
    if tokens <= 0:
        return

    max_tokens_per_hour = max(1, int(getattr(settings, "token_rate_limit_per_ip_hour", 12000)))

    now = datetime.now(timezone.utc).timestamp()
    cutoff = now - WINDOW_SECONDS

    async with _token_rate_lock:
        bucket = _usage_by_ip[ip]

        while bucket and bucket[0].timestamp <= cutoff:
            expired = bucket.popleft()
            _usage_totals_by_ip[ip] -= expired.tokens

        current_total = _usage_totals_by_ip[ip]
        projected_total = current_total + tokens
        if projected_total > max_tokens_per_hour:
            retry_after_seconds = int(max(1, WINDOW_SECONDS - (now - bucket[0].timestamp))) if bucket else WINDOW_SECONDS
            retry_at = datetime.now(timezone.utc) + timedelta(seconds=retry_after_seconds)
            raise TokenRateLimitExceeded(
                message=(
                    f"Token budget exceeded for this IP. Limit: {max_tokens_per_hour} tokens/hour. "
                    "Please try again later."
                ),
                retry_after_seconds=retry_after_seconds,
                retry_at_utc=retry_at.isoformat(),
            )

        bucket.append(TokenUsage(timestamp=now, tokens=tokens))
        _usage_totals_by_ip[ip] = projected_total
