import logging
import os
import sys

# Handle watchtower import gracefully
try:
    import watchtower
    import boto3
    WATCHTOWER_AVAILABLE = True
except ImportError:
    WATCHTOWER_AVAILABLE = False

def setup_logger():
    """Setup logging with optional CloudWatch support."""
    # Import settings here to avoid circular imports
    from .config import settings
    
    logger = logging.getLogger("agent-space")
    logger.handlers.clear()
    logger.setLevel(logging.INFO)
    
    # Console handler (always available)
    console_handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # CloudWatch handler (only if available and not testing)
    if WATCHTOWER_AVAILABLE and not _is_testing():
        try:
            logs_client = boto3.client("logs", region_name=settings.aws_region)
            
            cw_handler = watchtower.CloudWatchLogHandler(
                log_group=settings.cloudwatch_log_group,      # ← Use lowercase field names
                stream_name=settings.cloudwatch_log_stream,   # ← Use lowercase field names
                boto3_client=logs_client,
                create_log_group=True,
                log_group_retention_days=7,
            )
            logger.addHandler(cw_handler)
            logger.info("CloudWatch logging enabled")
        except Exception as e:
            logger.warning(f"CloudWatch setup failed: {e}")
    elif _is_testing():
        logger.info("Running in test mode - console logging only")
    
    return logger

def _is_testing():
    """Check if we're running tests."""
    return "pytest" in sys.modules

logger = setup_logger()
