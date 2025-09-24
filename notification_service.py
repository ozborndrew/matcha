import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, List
from models.order import Order, OrderStatus
from models.user import User
import logging

logger = logging.getLogger(__name__)

class NotificationService:
    
    def __init__(self):
        # Email configuration (you can use Gmail SMTP or any other provider)
        self.smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "587"))
        self.email_username = os.getenv("EMAIL_USERNAME", "")
        self.email_password = os.getenv("EMAIL_PASSWORD", "")
        self.from_email = os.getenv("FROM_EMAIL", "noreply@nanacafe.com")
    
    async def send_email(self, to_email: str, subject: str, body: str, html_body: Optional[str] = None) -> bool:
        """Send email notification"""
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.from_email
            msg['To'] = to_email
            
            # Add plain text part
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                if self.email_username and self.email_password:
                    server.login(self.email_username, self.email_password)
                server.send_message(msg)
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return False
    
    async def send_order_confirmation(self, order: Order) -> bool:
        """Send order confirmation email"""
        if not order.customer_email:
            return False
            
        subject = f"Order Confirmation - Nana Cafe #{order.order_number}"
        
        # Create order items list
        items_text = "\
".join([
            f"- {item.product_name} x{item.quantity} = ₱{item.total_price:.2f}"
            for item in order.items
        ])
        
        delivery_info = ""
        if order.order_type.value == "delivery" and order.delivery_info:
            delivery_info = f"""
Delivery Information:
- Address: {order.delivery_info.delivery_address}
- Date: {order.delivery_info.delivery_date}
- Time: {order.delivery_info.delivery_time_slot}
- Contact: {order.delivery_info.contact_number}
"""
        elif order.order_type.value == "pickup" and order.pickup_info:
            delivery_info = f"""
Pickup Information:
- Date: {order.pickup_info.pickup_date}
- Time: {order.pickup_info.pickup_time_slot}  
- Contact: {order.pickup_info.contact_number}
"""
        
        body = f"""
Dear Customer,

Thank you for your order at Nana Cafe!

Order Details:
- Order Number: {order.order_number}
- Order Type: {order.order_type.value.title()}
- Status: {order.status.value.title()}

Items Ordered:
{items_text}

Subtotal: ₱{order.subtotal:.2f}
Delivery Fee: ₱{order.delivery_fee:.2f}
Total Amount: ₱{order.total_amount:.2f}

{delivery_info}

We'll notify you when your order status changes.

Thank you for choosing Nana Cafe!

Best regards,
Nana Cafe Team
"""
        
        return await self.send_email(order.customer_email, subject, body)
    
    async def send_status_update(self, order: Order, new_status: OrderStatus) -> bool:
        """Send order status update email"""
        if not order.customer_email:
            return False
            
        subject = f"Order Update - Nana Cafe #{order.order_number}"
        
        status_messages = {
            OrderStatus.CONFIRMED: "Your order has been confirmed and we're preparing it!",
            OrderStatus.PREPARING: "Your order is being prepared by our team.",
            OrderStatus.READY: "Your order is ready for pickup!" if order.order_type.value == "pickup" 
                              else "Your order is ready and will be delivered soon!",
            OrderStatus.OUT_FOR_DELIVERY: "Your order is out for delivery!",
            OrderStatus.COMPLETED: "Your order has been completed. Thank you!",
            OrderStatus.CANCELLED: "Your order has been cancelled. If you have any questions, please contact us."
        }
        
        message = status_messages.get(new_status, f"Your order status has been updated to {new_status.value}.")
        
        body = f"""
Dear Customer,

Order Status Update for #{order.order_number}

{message}

Order Type: {order.order_type.value.title()}
Total Amount: ₱{order.total_amount:.2f}

Thank you for choosing Nana Cafe!

Best regards,
Nana Cafe Team
"""
        
        return await self.send_email(order.customer_email, subject, body)
    
    async def send_admin_notification(self, order: Order) -> bool:
        """Send new order notification to admin"""
        admin_email = os.getenv("ADMIN_EMAIL", "admin@nanacafe.com")
        
        subject = f"New Order Received - #{order.order_number}"
        
        items_text = "\
".join([
            f"- {item.product_name} x{item.quantity} = ₱{item.total_price:.2f}"
            for item in order.items
        ])
        
        body = f"""
New order received at Nana Cafe!

Order Details:
- Order Number: {order.order_number}
- Order Type: {order.order_type.value.title()}
- Customer: {order.customer_email or 'Guest'}
- Total Amount: ₱{order.total_amount:.2f}

Items:
{items_text}

Please log in to the admin panel to manage this order.
"""
        
        return await self.send_email(admin_email, subject, body)
