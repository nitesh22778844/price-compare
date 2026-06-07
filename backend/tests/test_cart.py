import httpx
import pytest
import respx

from app.services.cart import submit_cart

CART_URL = "https://purchase-history-production.up.railway.app/api/cart"

PRODUCTS = ["Amul Gold Milk", "Aashirvaad Atta 5kg"]


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
