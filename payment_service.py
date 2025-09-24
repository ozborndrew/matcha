import stripe
import os
from typing import Optional, Dict, Any
from models.order import Order, PaymentStatus
import logging

logger = logging.getLogger(__name__)

# Set Stripe API key (you'll need to add this to environment variables)
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_...")

class PaymentService:
    
    @staticmethod
    async def create_payment_intent(order: Order) -> Optional[Dict[str, Any]]:
        """Create Stripe payment intent for order"""
        try:
            # Convert PHP pesos to centavos (Stripe uses smallest currency unit)
            amount_in_centavos = int(order.total_amount * 100)
            
            payment_intent = stripe.PaymentIntent.create(
                amount=amount_in_centavos,
                currency='php',  # Philippine Peso
                metadata={
                    'order_id': order.id,
                    'order_number': order.order_number,
                    'customer_email': order.customer_email or 'guest@nanacafe.com'
                },
                description=f"Nana Cafe Order #{order.order_number}"
            )
            
            return {
                'payment_intent_id': payment_intent.id,
                'client_secret': payment_intent.client_secret,
                'amount': payment_intent.amount,
                'status': payment_intent.status
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating payment intent: {e}")
            return None
    
    @staticmethod
    async def confirm_payment(payment_intent_id: str) -> Optional[Dict[str, Any]]:
        """Confirm payment intent status"""
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            return {
                'payment_intent_id': payment_intent.id,
                'status': payment_intent.status,
                'amount_received': payment_intent.amount_received,
                'metadata': payment_intent.metadata
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error confirming payment: {e}")
            return None
        except Exception as e:
            logger.error(f"Error confirming payment: {e}")
            return None
    
    @staticmethod
    async def refund_payment(payment_intent_id: str, amount: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Refund payment"""
        try:
            refund_data = {
                'payment_intent': payment_intent_id
            }
            if amount:
                refund_data['amount'] = amount
                
            refund = stripe.Refund.create(**refund_data)
            
            return {
                'refund_id': refund.id,
                'status': refund.status,
                'amount': refund.amount
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating refund: {e}")
            return None
        except Exception as e:
            logger.error(f"Error creating refund: {e}")
            return None
    
    @staticmethod
    def get_payment_status_from_stripe_status(stripe_status: str) -> PaymentStatus:
        """Convert Stripe status to our PaymentStatus enum"""
        status_mapping = {
            'succeeded': PaymentStatus.PAID,
            'requires_payment_method': PaymentStatus.PENDING,
            'requires_confirmation': PaymentStatus.PENDING,
            'requires_action': PaymentStatus.PENDING,
            'processing': PaymentStatus.PENDING,
            'requires_capture': PaymentStatus.PENDING,
            'canceled': PaymentStatus.FAILED
        }
        return status_mapping.get(stripe_status, PaymentStatus.FAILED)
