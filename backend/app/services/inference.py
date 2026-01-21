"""Groq inference service."""

import httpx
from app.config import get_settings
from app.prompts import PROMPTS

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# Global client for connection pooling
_client = httpx.AsyncClient(timeout=30.0)


async def close_client():
    await _client.aclose()


async def call_model(model: str, prompt: str, max_tokens: int = 1024, **kwargs) -> str:
    """Call API with given model and prompt."""
    
    # Check for new models first
    if model in ["gemini", "gemma"]:
        from app.services.model_provider import ModelProvider
        provider = ModelProvider.get_instance()
        return await provider.generate_text(model, prompt, **kwargs)
        
    # Fallback to Groq for everything else
    settings = get_settings()
    headers = {
        "Authorization": f"Bearer {settings.groq_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }
    resp = await _client.post(GROQ_URL, json=payload, headers=headers)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


async def generate_explanation(topic: str, level: str, model: str) -> str:
    """Generate explanation for topic at given level."""
    template = PROMPTS.get(level)
    if not template:
        raise ValueError(f"Unknown level: {level}")
    prompt = template.format(topic=topic)
    return await call_model(model, prompt)
