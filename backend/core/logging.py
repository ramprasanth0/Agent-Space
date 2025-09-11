import logging
import boto3
import watchtower
from .config import settings

def setup_logger():
    # Create logger
    logger = logging.getLogger("agent-space")
    logger.setLevel(logging.INFO)

    # Create CloudWatch handler
    logs_client = boto3.client("logs", region_name=settings.AWS_REGION)
    cw_handler = watchtower.CloudWatchLogHandler(
        log_group=settings.CLOUDWATCH_LOG_GROUP,
        stream_name=settings.CLOUDWATCH_LOG_STREAM,
        boto3_client=logs_client,
        create_log_group=True,
        log_group_retention_days=7,
    )
    
    # Add handler to logger
    logger.addHandler(cw_handler)
    
    return logger

# Create a singleton logger instance
logger = setup_logger()