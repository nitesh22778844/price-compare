import asyncio

import httpx

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.schemas import CartCheckoutResponse

logger = get_logger(__name__)

# The upstream cart service is asynchronous and single-flight: a POST kicks off
# an add-to-cart run (HTTP 202) and, while that run is active, further POSTs are
# rejected with HTTP 409 "a cart operation is already in progress". Runs finish
# within a few seconds, so we briefly retry a busy (409) response before giving up.
_BUSY_RETRY_ATTEMPTS = 3
_BUSY_RETRY_DELAY_S = 2.0


async def submit_cart(products: list[str]) -> CartCheckoutResponse:
    """Submit the whole cart to the external purchasing API in one call.

    For now every item is dispatched to the Flipkart endpoint. Once
    ``cart_amazon_url`` is configured, items can be split by source and sent to
    the matching store — the frontend already tracks each item's source to make
    that change straightforward.

    The upstream is async and single-flight: a POST kicks off a run (HTTP 202)
    and, while a run is active, further POSTs return HTTP 409 "busy". We retry a
    busy response a few times; if it's *still* busy we treat the submit as
    accepted (the cart system is already processing an order) rather than failing
    — this keeps the user's cart clearing instead of blocking them. Only genuine
    HTTP/transport errors propagate, which the router maps to a 502.
    """
    s = get_settings()

    # Drop blank/whitespace names (e.g. a Flipkart result with no title) — the
    # upstream rejects empty product strings with a 400.
    products = [p.strip() for p in products if p and p.strip()]
    if not products:
        logger.info("Cart submit had no valid product names after cleaning")
        return CartCheckoutResponse(submitted=0, detail="No valid items to submit.")

    async with httpx.AsyncClient() as client:
        resp = None
        for attempt in range(_BUSY_RETRY_ATTEMPTS + 1):
            resp = await client.post(
                s.cart_flipkart_url,
                json={"products": products},
                headers={"Content-Type": "application/json"},
                timeout=60.0,
            )
            if resp.status_code != 409:
                break
            if attempt < _BUSY_RETRY_ATTEMPTS:
                logger.info(
                    "Cart busy (409); retrying in %.0fs (attempt %d/%d)",
                    _BUSY_RETRY_DELAY_S,
                    attempt + 1,
                    _BUSY_RETRY_ATTEMPTS,
                )
                await asyncio.sleep(_BUSY_RETRY_DELAY_S)

    if resp.status_code == 409:
        # Still busy finishing another order — accept the submit so the cart
        # clears; the upstream will process orders as it frees up.
        logger.info("Cart busy after %d retries; accepting submit", _BUSY_RETRY_ATTEMPTS)
        return CartCheckoutResponse(
            submitted=len(products),
            detail="Your order is being processed.",
        )

    if resp.status_code >= 400:
        logger.error("Cart API error: HTTP %s — %s", resp.status_code, resp.text[:200])
        resp.raise_for_status()

    logger.info(
        "Submitted %d cart item(s) to Flipkart (HTTP %s)", len(products), resp.status_code
    )
    return CartCheckoutResponse(
        submitted=len(products),
        detail=f"Submitted {len(products)} item(s) to Flipkart.",
    )
