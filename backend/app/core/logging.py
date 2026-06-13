import logging
import sys

from app.core.config import get_settings


class _RedactingFilter(logging.Filter):
    """Remove sensitive values from log records."""

    _redact_attrs = ("sf_client_secret", "openrouter_api_key")

    def filter(self, record: logging.LogRecord) -> bool:
        try:
            settings = get_settings()
            secrets = [
                secret
                for attr in self._redact_attrs
                if (secret := getattr(settings, attr, None)) and len(secret) > 8
            ]
            if secrets:
                # Render the message (applying %-args) *before* redacting, then
                # drop args. Clearing args first would leave %s placeholders
                # unsubstituted in the output.
                message = record.getMessage()
                for secret in secrets:
                    message = message.replace(secret, "***REDACTED***")
                record.msg = message
                record.args = ()
        except Exception:
            pass
        return True


def configure_logging() -> None:
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    handler = logging.StreamHandler(sys.stdout)
    handler.addFilter(_RedactingFilter())
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s — %(message)s",
        handlers=[handler],
        force=True,
    )


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.filters:
        logger.addFilter(_RedactingFilter())
    return logger
