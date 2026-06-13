import httpx
import pytest
import respx

from app.services.cart import submit_cart

CART_URL = "https://purchase-history-production.up.railway.app/api/cart"

PRODUCTS = ["Amul Gold Milk", "Aashirvaad Atta 5kg"]


@pytest.fixture(autouse=True)
def _no_sleep(monkeypatch):
    """Skip the real busy-retry backoff so tests stay fast."""

    async def _instant(_seconds):
        return None

    monkeypatch.setattr("app.services.cart.asyncio.sleep", _instant)


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_posts_products_and_counts():
    route = respx.post(CART_URL).mock(return_value=httpx.Response(200, json={"ok": True}))

    result = await submit_cart(PRODUCTS)

    assert route.called
    assert result.submitted == 2
    assert "2" in result.detail


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_sends_product_names():
    route = respx.post(CART_URL).mock(return_value=httpx.Response(200, json={"ok": True}))

    await submit_cart(PRODUCTS)

    sent = route.calls.last.request
    assert b"Amul Gold Milk" in sent.content
    assert b"Aashirvaad Atta 5kg" in sent.content


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_accepts_202_started():
    # The real upstream is async: a fresh POST returns 202 "started", not 200.
    route = respx.post(CART_URL).mock(
        return_value=httpx.Response(202, json={"status": "started"})
    )

    result = await submit_cart(PRODUCTS)

    assert route.called
    assert result.submitted == 2


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_retries_on_409_then_succeeds():
    # First the upstream is busy (409), then a retry lands and is accepted (202).
    route = respx.post(CART_URL).mock(
        side_effect=[
            httpx.Response(409, json={"status": "running"}),
            httpx.Response(202, json={"status": "started"}),
        ]
    )

    result = await submit_cart(PRODUCTS)

    assert route.call_count == 2
    assert result.submitted == 2


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_accepts_when_persistently_busy():
    # A perpetually busy upstream should not block the user: the submit is
    # accepted so the cart can clear, with a "processing" message.
    route = respx.post(CART_URL).mock(
        return_value=httpx.Response(409, json={"status": "running"})
    )

    result = await submit_cart(PRODUCTS)

    # initial attempt + _BUSY_RETRY_ATTEMPTS retries
    assert route.call_count == 4
    assert result.submitted == 2
    assert "processed" in result.detail.lower()


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_drops_blank_names():
    route = respx.post(CART_URL).mock(return_value=httpx.Response(202, json={"status": "started"}))

    result = await submit_cart(["  ", "Lemon", ""])

    sent = route.calls.last.request
    assert b"Lemon" in sent.content
    # the blank/whitespace entries are filtered out
    assert result.submitted == 1


@pytest.mark.asyncio
async def test_submit_cart_no_call_when_all_blank():
    with respx.mock:
        route = respx.post(CART_URL).mock(return_value=httpx.Response(202))
        result = await submit_cart(["", "   "])
    assert not route.called
    assert result.submitted == 0


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_raises_on_5xx():
    respx.post(CART_URL).mock(return_value=httpx.Response(500, text="boom"))

    with pytest.raises(httpx.HTTPStatusError):
        await submit_cart(PRODUCTS)


@respx.mock
@pytest.mark.asyncio
async def test_submit_cart_raises_on_timeout():
    respx.post(CART_URL).mock(side_effect=httpx.ConnectTimeout("timed out"))

    with pytest.raises(httpx.ConnectTimeout):
        await submit_cart(PRODUCTS)


# ── Router ────────────────────────────────────────────────────────────────────


@respx.mock
def test_router_checkout_happy_path(client):
    route = respx.post(CART_URL).mock(return_value=httpx.Response(200, json={"ok": True}))

    resp = client.post("/api/cart/checkout", json={"products": PRODUCTS})

    assert resp.status_code == 200
    data = resp.json()
    assert data["submitted"] == 2
    assert route.called


def test_router_checkout_empty_products_rejected(client):
    resp = client.post("/api/cart/checkout", json={"products": []})
    assert resp.status_code == 422


def test_router_checkout_missing_products(client):
    resp = client.post("/api/cart/checkout", json={})
    assert resp.status_code == 422


@respx.mock
def test_router_checkout_upstream_failure_returns_502(client):
    respx.post(CART_URL).mock(return_value=httpx.Response(503, text="down"))

    resp = client.post("/api/cart/checkout", json={"products": PRODUCTS})

    assert resp.status_code == 502
    assert "unavailable" in resp.json()["detail"].lower()


@respx.mock
def test_router_checkout_persistent_busy_returns_200_accepted(client):
    respx.post(CART_URL).mock(return_value=httpx.Response(409, json={"status": "running"}))

    resp = client.post("/api/cart/checkout", json={"products": PRODUCTS})

    assert resp.status_code == 200
    assert "processed" in resp.json()["detail"].lower()
