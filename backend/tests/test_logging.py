import logging

from app.core import logging as app_logging
from app.core.logging import _RedactingFilter


class _FakeSettings:
    sf_client_secret = "supersecretvalue123"
    openrouter_api_key = ""


def _record(msg: str, args) -> logging.LogRecord:
    return logging.LogRecord("test", logging.ERROR, __file__, 1, msg, args, None)


def test_redacting_filter_substitutes_args(monkeypatch):
    # Regression: the filter must render %-args *before* clearing them, otherwise
    # parameterized logs (e.g. upstream error bodies) print literal "%s".
    monkeypatch.setattr(app_logging, "get_settings", lambda: _FakeSettings())
    rec = _record("Cart API error: HTTP %s — %s", (400, "bad body"))
    _RedactingFilter().filter(rec)
    assert rec.getMessage() == "Cart API error: HTTP 400 — bad body"


def test_redacting_filter_redacts_secret(monkeypatch):
    monkeypatch.setattr(app_logging, "get_settings", lambda: _FakeSettings())
    rec = _record("token=%s", ("supersecretvalue123",))
    _RedactingFilter().filter(rec)
    msg = rec.getMessage()
    assert "supersecretvalue123" not in msg
    assert "***REDACTED***" in msg
