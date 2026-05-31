"""Fire-and-forget triggers for source-specific product refresh APIs.

Each tool maps to a single HTTPS endpoint (configured via env). The endpoints
take no auth and are expected to return quickly (they enqueue work and return),
so we POST with a short timeout and only care that the trigger was accepted.
"""

import httpx

from app.core import config
from app.core.logging import get_logger

logger = get_logger(__name__)

# Human-readable labels for confirmation messages.
SOURCE_LABELS: dict[str, str] = {
    "amazon": "Amazon",
    "flipkart": "Flipkart",
}


def _url_for(source: str) -> str:
    s = config.get_settings()
    return {
        "amazon": s.refresh_amazon_url,
        "flipkart": s.refresh_flipkart_url,
    }.get(source, "")


async def trigger_refresh(source: str) -> None:
    """POST to the configured refresh endpoint for `source`.

    Raises ValueError if the endpoint is not configured, and httpx errors if the
    request fails — callers translate these into user-facing messages.
    """
    url = _url_for(source)
    if not url:
        raise ValueError(
            f"No refresh endpoint is configured for {SOURCE_LABELS.get(source, source)}."
        )

    body = {"orders": config.get_settings().refresh_orders}
    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=body, timeout=15.0)

    if resp.status_code >= 400:
        logger.error("Refresh trigger for %s failed: HTTP %s", source, resp.status_code)
        resp.raise_for_status()

    logger.info("Triggered %s product refresh (HTTP %s)", source, resp.status_code)
