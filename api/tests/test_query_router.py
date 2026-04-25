import pytest

import routers.query as query_module


@pytest.mark.asyncio
async def test_query_generates_fresh_response(app_client, monkeypatch):
    async def fake_ensemble_generate(*_args, **_kwargs):
        return "generated"

    monkeypatch.setattr(query_module, "ensemble_generate", fake_ensemble_generate)
    resp = app_client.post("/api/query", json={"topic": "Cats", "levels": ["eli5"], "mode": "fast"})
    assert resp.status_code == 200
    body = resp.json()
    assert body["explanations"]["eli5"] == "generated"


@pytest.mark.asyncio
async def test_query_invalid_topic(app_client):
    resp = app_client.post("/api/query", json={"topic": "bad<topic>", "levels": ["eli5"], "mode": "fast"})
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_query_supports_all_levels_without_premium(app_client, monkeypatch):
    async def fake_ensemble_generate(_topic, _level, _use_premium, _mode):
        return "ok"

    monkeypatch.setattr(query_module, "ensemble_generate", fake_ensemble_generate)

    resp = app_client.post(
        "/api/query",
        json={"topic": "Space", "levels": ["eli5", "classic60"], "mode": "ensemble"},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert "eli5" in data["explanations"]
    assert "classic60" in data["explanations"]


@pytest.mark.asyncio
async def test_query_stream_emits_done(app_client, monkeypatch):
    async def fake_stream(*_args, **_kwargs):
        yield "Hello "
        yield "World"

    monkeypatch.setattr(query_module, "generate_stream_explanation", fake_stream)

    resp = app_client.post("/api/query/stream", json={"topic": "Ocean", "levels": ["eli5"], "mode": "fast"})
    assert resp.status_code == 200
    text = resp.text
    assert "data: [DONE]" in text
    assert "chunk" in text


@pytest.mark.asyncio
async def test_query_normalizes_and_caps_levels(app_client, monkeypatch):
    async def fake_ensemble_generate(_topic, level, *_args, **_kwargs):
        return f"{level}-ok"

    monkeypatch.setattr(query_module, "ensemble_generate", fake_ensemble_generate)

    resp = app_client.post(
        "/api/query",
        json={
            "topic": "Physics",
            "levels": ["eli5", "eli5", "eli10", "eli12", "eli15", "meme", "classic60"],
            "mode": "fast",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert list(data["explanations"].keys()) == ["eli5", "eli10", "eli12", "eli15"]
