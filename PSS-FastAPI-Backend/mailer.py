"""Send email through SMTP (Gmail by default)."""
import smtplib
from email.message import EmailMessage

from config import get_settings


def send_email(to: str, subject: str, body: str) -> None:
    settings = get_settings()
    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30) as smtp:
        smtp.starttls()
        smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)


def completion_email_body(gift_card_link: str) -> str:
    return f"""Hello,

Thank you for taking part in the Peer Support System (PSS) LLM Evaluation study. Your responses have been saved.

As a thank-you for your time, here is your gift card:
{gift_card_link}

If you have any questions, please reply to this email.

Best regards,
PSS LLM Evaluation Research Team
"""
