import os
import logging
import requests

logger = logging.getLogger(__name__)

def send_alert(message: str) -> None:
    """
    Send an alert message to configured Discord and/or Slack webhooks.
    """
    discord_webhook = os.getenv('DISCORD_WEBHOOK_URL')
    slack_webhook = os.getenv('SLACK_WEBHOOK_URL')

    if not discord_webhook and not slack_webhook:
        logger.debug("No alerts sent: webhook URLs are not configured.")
        return

    # Send to Discord
    if discord_webhook:
        try:
            payload = {"content": message}
            resp = requests.post(discord_webhook, json=payload, timeout=10)
            resp.raise_for_status()
            logger.info("Sent alert to Discord.")
        except Exception as e:
            logger.error(f"Failed to send Discord alert: {e}")

    # Send to Slack
    if slack_webhook:
        try:
            payload = {"text": message}
            resp = requests.post(slack_webhook, json=payload, timeout=10)
            resp.raise_for_status()
            logger.info("Sent alert to Slack.")
        except Exception as e:
            logger.error(f"Failed to send Slack alert: {e}")
