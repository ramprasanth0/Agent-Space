import os
import boto3
import logging
from botocore.exceptions import ClientError

logger = logging.getLogger("agent-space")

# Create SES client
ses = boto3.client("ses", region_name=os.environ.get("AWS_REGION", "ap-south-2"))

def send_feedback_email(body: str):
    ses_sender = os.environ.get("SES_SENDER")
    ses_recipient = os.environ.get("SES_RECIPIENT", "essrramprasanth@gmail.com")
    
    if not ses_sender or not ses_recipient:
        logger.error("SES_SENDER or SES_RECIPIENT missing")
        raise RuntimeError("SES_SENDER or SES_RECIPIENT missing")

    send_args = {
        "Source": ses_sender,
        "Destination": {"ToAddresses": [ses_recipient]},
        "Message": {
            "Subject": {"Data": "New feedback", "Charset": "UTF-8"},
            "Body": {
                "Text": {"Data": body, "Charset": "UTF-8"},
                "Html": {"Data": f"<pre>{body}</pre>", "Charset": "UTF-8"},
            },
        },
    }

    try:
        response = ses.send_email(**send_args)
        logger.info("Feedback email sent successfully")
        return response
    except ClientError as e:
        logger.error(f"Failed to send feedback email: {str(e)}")
        raise
