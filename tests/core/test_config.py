import logging

# ── import the module that calls setup_logger ──────────────────────────────
from backend.core import logging as log_mod     # ← this is backend/core/logging.py

APP_LOGGER_NAME = "agent-space"                 # keep the name in one place
app_logger = log_mod.logger                     # the instance created by setup_logger


# ───────────────────────── 1. handler sanity check ─────────────────────────
def test_logger_has_stream_handler():
    """
    The app logger must have at least one StreamHandler so that logs
    appear on stdout/stderr when CloudWatch is unavailable (e.g. CI).
    """
    assert any(isinstance(h, logging.StreamHandler) for h in app_logger.handlers)


# ───────────────────────── 2. message goes to caplog ──────────────────────
def test_logger_emits_and_is_captured(caplog):
    """
    Verify that a log produced by the app logger is captured with pytest’s
    built-in caplog fixture.
    """
    caplog.set_level(logging.INFO, logger=APP_LOGGER_NAME)

    app_logger.info("pytest-log-message")

    assert "pytest-log-message" in caplog.text
