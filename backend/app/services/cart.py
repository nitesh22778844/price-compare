import httpx

from app.core.config import get_settings
from app.core.logging import get_logger
from app.models.schemas import CartCheckoutResponse

logger = get_logger(__name__)


async def submit_cart(products: list[str]) -> CartCheckoutResponse:
    """Submit the whole cart to the external purchasing API in one call.

    For now every item is dispatched to the Flipkart endpoint. Once
    ``cart_amazon_url`` is configured, items can be split by source and sent to
    the matching store — the frontend already tracks each item's source to make
    that change straightforward.

    Exceptions (HTTP errors, timeouts) are allowed to propagate; the router maps
    them to a 502, mirroring the recommendations flow.
    """
    s = get_settings()

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            s.cart_flipkart_url,
            json={"products": products},
            headers={"Content-Type": "application/json"},
            timeout=60.0,
        )

    if resp.status_code >= 400:
        logger.error("Cart API error: HTTP %s — %s", resp.status_code, resp.text[:200])
        resp.raise_for_status()

    logger.info("Submitted %d cart item(s) to Flipkart", len(products))
    return CartCheckoutResponse(
        submitted=len(products),
        detail=f"Submitted {len(products)} item(s) to Flipkart.",
    )
