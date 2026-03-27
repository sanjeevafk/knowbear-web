"""Query endpoints for generating explanations."""

import asyncio
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from logging_config import logger
from services.ensemble import ensemble_generate
from services.inference import generate_stream_explanation
from utils import FREE_LEVELS, PREMIUM_LEVELS, sanitize_topic

router = APIRouter(tags=["query"])

ALL_LEVELS = FREE_LEVELS + PREMIUM_LEVELS


class QueryRequest(BaseModel):
    topic: str = Field(..., min_length=1, max_length=200)
    levels: list[str] = Field(default=ALL_LEVELS)
    mode: str = "ensemble"
    temperature: float = 0.7
    regenerate: bool = False


class QueryResponse(BaseModel):
    topic: str
    explanations: dict[str, str]


def _normalize_mode(mode: str) -> str:
    return mode if mode in {"fast", "ensemble"} else "fast"


@router.post("/query", response_model=QueryResponse)
async def query_topic(req: QueryRequest) -> QueryResponse:
    """Generate explanations for a topic."""
    req.mode = _normalize_mode(req.mode)

    try:
        topic = sanitize_topic(req.topic)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

    levels = [level for level in req.levels if level in ALL_LEVELS]
    if not levels:
        levels = ["eli5"]

    explanations: dict[str, str] = {}
    logger.info("query_start_generation", topic=topic, levels=levels, mode=req.mode)
    tasks = {level: ensemble_generate(topic, level, False, req.mode) for level in levels}
    results = await asyncio.gather(*tasks.values(), return_exceptions=True)

    for level, result in zip(tasks.keys(), results):
        if isinstance(result, str):
            explanations[level] = result
        else:
            error_msg = str(result) if result else "Unknown error"
            explanations[level] = f"Error generating {level}: {error_msg}"
            logger.error("query_generation_failed", level=level, error=error_msg)

    return QueryResponse(topic=topic, explanations=explanations)


@router.post("/query/stream")
async def query_topic_stream(req: QueryRequest):
    """Stream explanations for a topic."""
    req.mode = _normalize_mode(req.mode)

    try:
        topic = sanitize_topic(req.topic)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e

    level = req.levels[0] if req.levels and req.levels[0] in ALL_LEVELS else "eli5"

    async def event_generator():
        full_content = ""
        buffer = ""
        last_flush_time = asyncio.get_event_loop().time()

        try:
            yield f"data: {json.dumps({'topic': topic, 'level': level})}\n\n"

            token_count = 0
            chunk_count = 0
            avg_chunk_size = 0.0

            async for chunk in generate_stream_explanation(
                topic,
                level,
                mode=req.mode,
                is_pro=False,
                temperature=req.temperature,
                regenerate=req.regenerate,
            ):
                full_content += chunk
                chunk_count += 1
                avg_chunk_size = (avg_chunk_size * (chunk_count - 1) + len(chunk)) / chunk_count

                if "__TRUNCATED__" in chunk:
                    chunk = chunk.replace("__TRUNCATED__", "")
                    if chunk:
                        buffer += chunk
                        if buffer:
                            yield f"data: {json.dumps({'chunk': buffer})}\n\n"
                            buffer = ""
                    yield f"data: {json.dumps({'warning': 'Response may be incomplete due to length limits. Try regenerating.'})}\n\n"
                    break

                buffer += chunk
                token_count += len(chunk.split())
                current_time = asyncio.get_event_loop().time()
                dynamic_timeout = 0.15 if avg_chunk_size > 10 else 0.25

                should_flush = (
                    token_count < 10
                    or buffer.endswith("\n\n")
                    or len(buffer) > 50
                    or buffer.endswith(". ")
                    or buffer.endswith("! ")
                    or buffer.endswith("? ")
                    or buffer.endswith(".\n")
                    or buffer.endswith("!\n")
                    or buffer.endswith("?\n")
                    or buffer.endswith(": ")
                    or buffer.endswith(";\n")
                    or (current_time - last_flush_time) > dynamic_timeout
                )

                if should_flush and buffer:
                    yield f"data: {json.dumps({'chunk': buffer})}\n\n"
                    buffer = ""
                    last_flush_time = current_time

            if buffer:
                yield f"data: {json.dumps({'chunk': buffer})}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as e:
            logger.error("streaming_failed", error=str(e), topic=topic)
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
