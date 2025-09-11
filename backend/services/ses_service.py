import os
import boto3
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger("agent-space")

# --- env-driven config ---
AWS_REGION = os.environ.get("AWS_REGION", "ap-south-2")  # choose your SES region
SES_SENDER = os.environ.get("SES_SENDER")                # verified SES sender (email or domain)
SES_RECIPIENT = os.environ.get("SES_RECIPIENT", "essrramprasanth@gmail.com")  # fixed inbox

# --- boto3 SES client ---
ses = boto3.client("ses", region_name=AWS_REGION)

def send_feedback_email(body: str):
    if not SES_SENDER or not SES_RECIPIENT:
        logger.error("SES_SENDER or SES_RECIPIENT missing")
        raise RuntimeError("SES_SENDER or SES_RECIPIENT missing")

    send_args = {
        "Source": SES_SENDER,  # must be a verified identity in SES
        "Destination": {"ToAddresses": [SES_RECIPIENT]},
        "Message": {
            "Subject": {"Data": "New feedback", "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": body, "Charset": "UTF-8"},
                "Html": {"Data": f"<pre>{body}</pre>", "Charset": "UTF-8"},
            },
        },
    }

    try:
        ses.send_email(**send_args)
        logger.info("Feedback email sent successfully")
    except ClientError as e:
        logger.error(f"Failed to send feedback email: {str(e)}")
        raise