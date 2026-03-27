import pytest

import services.search as search_module


@pytest.mark.asyncio
async def test_search_context_returns_provider_result(monkeypatch):
    manager = search_module.SearchManager()
    monkeypatch.setattr(manager, "_select_provider", lambda _q: "serper")

    async def fake_serper(_query):
        return "fresh-content"

    monkeypatch.setattr(manager, "_search_serper", fake_serper)
    result = await manager.get_search_context("cats", mode="fast")
    assert result == "fresh-content"


def test_select_provider_visual_keyword(monkeypatch):
    monkeypatch.setattr(search_module.random, "random", lambda: 0.1)
    manager = search_module.SearchManager()
    assert manager._select_provider("image of cat") == "serper"


@pytest.mark.asyncio
async def test_search_context_fallback(monkeypatch):
    manager = search_module.SearchManager()

    async def fail(_query):
        raise RuntimeError("nope")

    async def ok(_query):
        return "fallback"

    monkeypatch.setattr(manager, "_search_tavily", fail)
    monkeypatch.setattr(manager, "_search_serper", ok)
    monkeypatch.setattr(manager, "_search_exa", fail)

    result = await manager.get_search_context("topic", mode="ensemble")
    assert result == "fallback"


@pytest.mark.asyncio
async def test_search_profile_controls_result_size(monkeypatch):
    manager = search_module.SearchManager()

    called = {}

    async def fake_tavily(_query, profile="fast"):
        called["profile"] = profile
        return "ok"

    monkeypatch.setattr(manager, "_select_provider", lambda _q: "tavily")
    monkeypatch.setattr(manager, "_search_tavily", fake_tavily)

    await manager.get_search_context("topic", mode="ensemble")
    assert called["profile"] == "ensemble"
