import json

import httpx
import pytest
import respx

from app.services.refresh import trigger_refresh


@pytest.mark.asyncio
async def test_trigger_refresh_posts_orders_body():
    with respx.mock:
        route = respx.post("https://refresh.test/amazon").mock(
            return_value=httpx.Response(202)
        )
        await trigger_refresh("amazon")
    assert route.called
    assert json.loads(route.calls[0].request.content) == {"orders": 2}


@pytest.mark.asyncio
async def test_trigger_refresh_raises_when_unconfigured(monkeypatch):
    # Blank out the Flipkart endpoint to simulate a missing env var.
    from app.core import config

    settings = config.get_settings()
    monkeypatch.setattr(settings, "refresh_flipkart_url", "")
    with pytest.raises(ValueError, match="No refresh endpoint"):
        await trigger_refresh("flipkart")


@pytest.mark.asyncio
async def test_trigger_refresh_surfaces_http_error():
    with respx.mock:
        respx.post("https://refresh.test/amazon").mock(
            return_value=httpx.Response(500, text="boom")
        )
        with pytest.raises(httpx.HTTPStatusError):
            await trigger_refresh("amazon")
