"""FastAPI main application."""

import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi_limiter import FastAPILimiter
from app.routers import pinned, query, export
from app.services.cache import close_redis, get_redis
from app.services.inference import close_client
from app.services.model_provider import ModelProvider, ModelError, RequiresPro, ModelUnavailable
from app.logging import setup_logging, logger
from app.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """App lifespan: startup/shutdown."""
    setup_logging()
    
    # Initialize Redis for Rate Limiting
    r = await get_redis()
    # verify redis connection
    try:
        await r.ping()
        await FastAPILimiter.init(r)
        logger.info("redis_connected_rate_limiter_init")
    except Exception as e:
        logger.error("redis_connection_failed", error=str(e))
        # We might want to fail hard here in production, or degrade gracefully?
        # For now, log error.

    # Initialize models
    provider = ModelProvider.get_instance()
    await provider.initialize()
    
    logger.info("startup", 
                gemini_configured=provider.gemini_configured, 
                gemma_token_set=bool(provider.gemma_token))
    
    yield
    await asyncio.gather(close_redis(), close_client())


app = FastAPI(
    title="KnowBear API",
    description="AI-powered layered explanations",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to strictly the Vercel app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Content Security Policy (CSP)
    # Allow scripts from self and vercel-analytics (common)
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live; " 
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' blob: data: https://*.googleusercontent.com; "
        "connect-src 'self' https://*.supabase.co https://*.groq.com https://api.groq.com; "
        "font-src 'self' data:; "
        "object-src 'none'; "
        "base-uri 'self'; "
        "form-action 'self'; "
        "frame-ancestors 'none';"
    )
    
    response.headers["Content-Security-Policy"] = csp
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "0" # Disable legacy auditor as we have CSP
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
    
    return response


@app.middleware("http")
async def structlog_middleware(request: Request, call_next):
    """Log requests with structlog."""
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        path=request.url.path,
        method=request.method,
        client_ip=request.client.host if request.client else None,
    )
    
    try:
        response = await call_next(request)
        structlog.contextvars.bind_contextvars(
            status_code=response.status_code,
        )
        if response.status_code >= 400:
             logger.warning("http_request_failed")
        else:
             logger.info("http_request_success")
        return response
    except Exception as e:
        logger.error("http_request_exception", error=str(e))
        raise


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global error handler."""
    logger.error("global_exception", error=str(exc))
    return JSONResponse(status_code=500, content={"error": "Internal server error"})


@app.exception_handler(ModelUnavailable)
async def model_unavailable_handler(request: Request, exc: ModelUnavailable):
    """Handle missing model configuration."""
    logger.warning("model_unavailable", error=str(exc))
    return JSONResponse(
        status_code=503,
        content={"error": "Service Unavailable", "detail": str(exc)}
    )


@app.exception_handler(RequiresPro)
async def requires_pro_handler(request: Request, exc: RequiresPro):
    """Handle pro-only feature access."""
    logger.info("requires_pro_access", error=str(exc))
    return JSONResponse(
        status_code=402,
        content={"error": "Payment Required", "detail": str(exc)}
    )


@app.exception_handler(ModelError)
async def model_error_handler(request: Request, exc: ModelError):
    """Handle general model errors."""
    logger.error("model_error", error=str(exc))
    return JSONResponse(
        status_code=400,
        content={"error": "Bad Request", "detail": str(exc)}
    )


# Mount routers
app.include_router(pinned.router, prefix="/api")
app.include_router(query.router, prefix="/api")
app.include_router(export.router, prefix="/api")


@app.get("/health")
async def health():
    """Health check with dependency status."""
    status = {"status": "ok", "dependencies": {}}
    
    # Check Google Generative AI
    try:
        import google.generativeai as genai
        status["dependencies"]["google-generativeai"] = f"installed ({genai.__version__})"
    except ImportError:
        status["dependencies"]["google-generativeai"] = "missing"
    except Exception as e:
        status["dependencies"]["google-generativeai"] = f"error: {str(e)}"
        
    # Check FPDF
    try:
        import fpdf
        status["dependencies"]["fpdf2"] = f"installed ({fpdf.__version__})"
    except ImportError:
        status["dependencies"]["fpdf2"] = "missing"
    except Exception as e:
        status["dependencies"]["fpdf2"] = f"error: {str(e)}"

    return status
