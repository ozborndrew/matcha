import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Truck, MapPin, Clock, DollarSign, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { mockTimeSlots, deliverySettings } from '../data/mockData';
import { toast } from '../hooks/use-toast';

const DeliveryPickup = ({ onBackToMenu }) => {
  const [orderType, setOrderType] = useState('delivery');
  const [loading, setLoading] = useState(false);
  
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();

  // Form states
  const [deliveryForm, setDeliveryForm] = useState({
    full_name: user?.full_name || '',
    contact_number: user?.phone || '',
    delivery_address: '',
    delivery_date: '',
    delivery_time_slot: '',
    special_instructions: ''
  });

  const [pickupForm, setPickupForm] = useState({
    full_name: user?.full_name || '',
    contact_number: user?.phone || '',
    pickup_date: '',
    pickup_time_slot: '',
    special_instructions: ''
  });

  const [guestEmail, setGuestEmail] = useState('');

  // Calculate totals
  const subtotal = getTotalPrice();
  const deliveryFee = orderType === 'delivery' && subtotal < deliverySettings.free_delivery_threshold 
    ? deliverySettings.delivery_fee 
    : 0;
  const total = subtotal + deliveryFee;

  // Get tomorrow's date as minimum
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive"
      });
      return;
    }

    if (!user && !guestEmail) {
      toast({
        title: "Email required", 
        description: "Please provide your email address for order updates.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        customer_email: user?.email || guestEmail,
        order_type: orderType,
        items: cartItems,
        payment_method: 'stripe',
        delivery_info: orderType === 'delivery' ? deliveryForm : null,
        pickup_info: orderType === 'pickup' ? pickupForm : null
      };

      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${BACKEND_URL}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user && { Authorization: `Bearer ${localStorage.getItem('nanacafe-token')}` })
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const order = await response.json();
        
        // Create payment intent
        const paymentResponse = await fetch(`${BACKEND_URL}/api/orders/${order.id}/payment-intent`, {
          method: 'POST'
        });

        if (paymentResponse.ok) {
          const paymentData = await paymentResponse.json();
          
          // For demo purposes, automatically confirm payment
          // In a real app, you'd use Stripe.js to handle the payment
          setTimeout(async () => {
            try {
              await fetch(`${BACKEND_URL}/api/orders/${order.id}/confirm-payment`, {
                method: 'POST'
              });
              
              toast({
                title: "Order placed successfully!",
                description: `Your order #${order.order_number} has been confirmed. You'll receive an email confirmation shortly.`,
              });
              
              clearCart();
              
              // Reset forms
              setDeliveryForm({
                full_name: user?.full_name || '',
                contact_number: user?.phone || '',
                delivery_address: '',
                delivery_date: '',
                delivery_time_slot: '',
                special_instructions: ''
              });
              
              setPickupForm({
                full_name: user?.full_name || '',
                contact_number: user?.phone || '',
                pickup_date: '',
                pickup_time_slot: '',
                special_instructions: ''
              });
              
              setGuestEmail('');
              
              if (onBackToMenu) {
                onBackToMenu();
              }
              
            } catch (error) {
              console.error('Error confirming payment:', error);
            }
          }, 2000);
          
          toast({
            title: "Processing payment...",
            description: "Please wait while we process your order.",
          });
          
        } else {
          throw new Error('Failed to create payment');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create order');
      }
      
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: "Order failed",
        description: error.message || "There was an error processing your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = () => {
    const element = document.getElementById('delivery');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="delivery" className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Delivery &
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Pick-up Options</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose your preferred option and place your order for fresh coffee and pastries
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <span>Place Your Order</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="delivery" className="flex items-center space-x-2">
                      <Truck className="h-4 w-4" />
                      <span>Delivery</span>
                    </TabsTrigger>
                    <TabsTrigger value="pickup" className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Pick-up</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* Delivery Information */}
                  {orderType === 'delivery' && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Delivery Information</span>
                      </div>
                      <p className="text-sm text-blue-800">
                        Minimum order of ₱{deliverySettings.free_delivery_threshold} for free delivery within city limits. 
                        Orders below ₱{deliverySettings.free_delivery_threshold} will incur a ₱{deliverySettings.delivery_fee} delivery fee.
                      </p>
                    </div>
                  )}

                  <form onSubmit={handleSubmitOrder}>
                    {/* Guest Email (if not logged in) */}
                    {!user && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <Label htmlFor="guest_email" className="text-sm font-medium text-amber-800">
                          Email for Order Updates *
                        </Label>
                        <Input
                          id="guest_email"
                          type="email"
                          placeholder="Enter your email address"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                    )}

                    <TabsContent value="delivery">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="delivery_name">Full Name *</Label>
                            <Input
                              id="delivery_name"
                              value={deliveryForm.full_name}
                              onChange={(e) => setDeliveryForm(prev => ({ ...prev, full_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="delivery_contact">Contact Number *</Label>
                            <Input
                              id="delivery_contact"
                              type="tel"
                              value={deliveryForm.contact_number}
                              onChange={(e) => setDeliveryForm(prev => ({ ...prev, contact_number: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="delivery_address">Delivery Address *</Label>
                          <Textarea
                            id="delivery_address"
                            placeholder="Enter your complete delivery address"
                            value={deliveryForm.delivery_address}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, delivery_address: e.target.value }))}
                            required
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="delivery_date">Preferred Delivery Date *</Label>
                            <Input
                              id="delivery_date"
                              type="date"
                              min={getTomorrowDate()}
                              value={deliveryForm.delivery_date}
                              onChange={(e) => setDeliveryForm(prev => ({ ...prev, delivery_date: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="delivery_time">Preferred Delivery Time *</Label>
                            <Select 
                              value={deliveryForm.delivery_time_slot} 
                              onValueChange={(value) => setDeliveryForm(prev => ({ ...prev, delivery_time_slot: value }))}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockTimeSlots.map(slot => (
                                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="delivery_instructions">Special Instructions (Optional)</Label>
                          <Textarea
                            id="delivery_instructions"
                            placeholder="Any special delivery instructions..."
                            value={deliveryForm.special_instructions}
                            onChange={(e) => setDeliveryForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pickup">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pickup_name">Full Name *</Label>
                            <Input
                              id="pickup_name"
                              value={pickupForm.full_name}
                              onChange={(e) => setPickupForm(prev => ({ ...prev, full_name: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pickup_contact">Contact Number *</Label>
                            <Input
                              id="pickup_contact"
                              type="tel"
                              value={pickupForm.contact_number}
                              onChange={(e) => setPickupForm(prev => ({ ...prev, contact_number: e.target.value }))}
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="pickup_date">Preferred Pick-up Date *</Label>
                            <Input
                              id="pickup_date"
                              type="date"
                              min={getTomorrowDate()}
                              value={pickupForm.pickup_date}
                              onChange={(e) => setPickupForm(prev => ({ ...prev, pickup_date: e.target.value }))}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="pickup_time">Preferred Pick-up Time *</Label>
                            <Select 
                              value={pickupForm.pickup_time_slot} 
                              onValueChange={(value) => setPickupForm(prev => ({ ...prev, pickup_time_slot: value }))}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockTimeSlots.map(slot => (
                                  <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="pickup_instructions">Special Instructions (Optional)</Label>
                          <Textarea
                            id="pickup_instructions"
                            placeholder="Any special instructions for your order..."
                            value={pickupForm.special_instructions}
                            onChange={(e) => setPickupForm(prev => ({ ...prev, special_instructions: e.target.value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <div className="mt-6">
                      <Button
                        type="submit"
                        disabled={loading || cartItems.length === 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                      >
                        {loading ? (
                          'Processing Order...'
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Place {orderType === 'delivery' ? 'Delivery' : 'Pick-up'} Order
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-0 sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <span>Order Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🛒</div>
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <Button 
                      onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })}
                      variant="outline"
                    >
                      Browse Menu
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items */}
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.product_id} className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.product_name}</div>
                            <div className="text-xs text-gray-600">₱{item.unit_price.toFixed(2)} × {item.quantity}</div>
                          </div>
                          <div className="text-sm font-medium">
                            ₱{item.total_price.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₱{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Delivery Fee:</span>
                        <span>
                          {deliveryFee === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `₱${deliveryFee.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      {subtotal < deliverySettings.free_delivery_threshold && orderType === 'delivery' && (
                        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                          Add ₱{(deliverySettings.free_delivery_threshold - subtotal).toFixed(2)} more for free delivery!
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span className="text-amber-600">₱{total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryPickup;
