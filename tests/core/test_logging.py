import logging

# Import the module that calls setup_logger()
from backend.core import logging as log_mod

APP_LOGGER_NAME = "agent-space"
app_logger       = log_mod.logger


# ── 1. handler sanity check ───────────────────────────────────────────────────
def test_logger_has_stream_handler():
    """
    Ensure there is **at least one** StreamHandler so logs always appear
    on stdout/stderr even when CloudWatch is unavailable.
    """
    assert any(isinstance(h, logging.StreamHandler) for h in app_logger.handlers)


# ── 2. verify log capture via caplog ──────────────────────────────────────────
def test_logger_emits_and_is_captured(caplog):
    caplog.set_level(logging.INFO, logger=APP_LOGGER_NAME)

    app_logger.info("pytest-log-message")

    assert "pytest-log-message" in caplog.text
