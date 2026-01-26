"""Groq inference service."""

import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from config import get_settings
from prompts import PROMPTS
from logging_config import logger



async def close_client():
    """No-op as ModelProvider manages its own clients."""
    pass


@retry(
    stop=stop_after_attempt(2),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException, httpx.HTTPStatusError)),
    reraise=True
)
async def call_model(model: str, prompt: str, max_tokens: int = 1024, **kwargs) -> str:
    """Call API with given model and prompt."""
    from services.model_provider import ModelProvider
    
    provider = ModelProvider.get_instance()
    
    task = kwargs.get("task", "general")
    if model in ["llama-3.3-70b-versatile", "deep_dive"]:
         task = "coding"
            
    try:
        result = await provider.route_inference(
            prompt=prompt, 
            task=task,
            model=model,
            **kwargs
        )

        return result["content"]
    except Exception as e:
         logger.error("inference_failed", error=str(e), model=model)
         raise e



async def generate_explanation(topic: str, level: str, model: str, **kwargs) -> str:
    """Generate explanation for topic at given level."""
    mode = kwargs.get("mode", "ensemble")
    template = PROMPTS.get(level)
    if not template:
        raise ValueError(f"Unknown level: {level}")
        
    prompt = template.format(topic=topic)
    
    # Task 3 Enhancement: Augment if Technical Depth Mode is active
    if mode == "technical_depth":
        augmentation = """
        
        AUGMENTED RESEARCH REQUIREMENTS (Technical Depth Mode):
        1. Academic Standards: Use advanced terminology, define equations, and use professional language.
        2. Web Quoting: Include specific references to authors, papers, or industry data (e.g. "According to the 2024 State of AI Report...").
        3. Visuals: Include at least one Mermaid.js diagram using ```mermaid code blocks.
        4. Explanatory Images: Include detailed [Image Placeholder: Description of a relevant scientific visualization] where it adds value.
        5. Performance: Answer must meet academic/research standards in accuracy and synthesis.
        6. Formatting: Use Markdown headers, bolding, and lists for readability.
        """
        prompt += augmentation
        
    return await call_model(model, prompt, **kwargs)


async def generate_stream_explanation(topic: str, level: str, **kwargs):
    """Stream explanation for topic at given level."""
    from services.model_provider import ModelProvider
    mode = kwargs.get("mode", "ensemble")
    template = PROMPTS.get(level)
    if not template:
        raise ValueError(f"Unknown level: {level}")
        
    prompt = template.format(topic=topic)
    
    if mode == "technical_depth":
        augmentation = """
        
        AUGMENTED RESEARCH REQUIREMENTS (Technical Depth Mode):
        1. Academic Standards: Use advanced terminology, define equations, and use professional language.
        2. Web Quoting: Include specific references to authors, papers, or industry data (e.g. "According to the 2024 State of AI Report...").
        3. Visuals: Include at least one Mermaid.js diagram using ```mermaid code blocks.
        4. Explanatory Images: Include detailed [Image Placeholder: Description of a relevant scientific visualization] where it adds value.
        5. Performance: Answer must meet academic/research standards in accuracy and synthesis.
        6. Formatting: Use Markdown headers, bolding, and lists for readability.
        """
        prompt += augmentation
    
    provider = ModelProvider.get_instance()
    async for chunk in provider.route_inference_stream(prompt, **kwargs):
        yield chunk
