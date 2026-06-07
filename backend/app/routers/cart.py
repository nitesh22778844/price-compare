from fastapi import APIRouter, HTTPException

from app.core.logging import get_logger
from app.models.schemas import CartCheckoutRequest, CartCheckoutResponse
from app.services.cart import submit_cart

router = APIRouter(tags=["cart"])
logger = get_logger(__name__)


@router.post("/cart/checkout", response_model=CartCheckoutResponse)
async def checkout(req: CartCheckoutRequest) -> CartCheckoutResponse:
    try:
        return await submit_cart(req.products)
    except Exception as exc:
        logger.exception("Cart checkout error")
        raise HTTPException(
            status_code=502,
            detail="The order service is currently unavailable. Please try again.",
        ) from exc
