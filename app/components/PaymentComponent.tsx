"use client"
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, CreditCard, Wallet, Banknote, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import { projectId, publicAnonKey } from '../utils/superbase/info';
import { toast } from 'sonner';

interface ScheduleData {
  product: any;
  deliveryType: 'delivery' | 'pickup';
  date: string;
  timeSlot: string;
  notes: string;
}

interface PaymentComponentProps {
  scheduleData: ScheduleData;
  onBack: () => void;
  onPaymentComplete: (orderId: string) => void;
}

export function PaymentComponent({ scheduleData, onBack, onPaymentComplete }: PaymentComponentProps) {
  const { user } = useAuth();
  const { addRewards, calculateRewards } = useRewards();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const totalAmount = scheduleData.product.price + (scheduleData.deliveryType === 'delivery' ? 10 : 0);
  const rewardsToEarn = calculateRewards(totalAmount);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create order in backend with rewards
      const orderData = {
        userEmail: user?.email || '',
        userName: user?.name || '',
        items: [{
          name: scheduleData.product.name,
          quantity: 1,
          price: scheduleData.product.price
        }],
        totalAmount,
        rewardsEarned: rewardsToEarn,
        paymentMethod,
        deliveryType: scheduleData.deliveryType,
        deliveryDate: scheduleData.date,
        timeSlot: scheduleData.timeSlot,
        notes: scheduleData.notes,
        deliveryCharges: scheduleData.deliveryType === 'delivery' ? 10 : 0,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed'
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f/orders/create`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Order creation failed:', errorData);
          throw new Error(errorData.error || 'Failed to create order');
        }

        const result = await response.json();
        console.log('Order creation result:', result);
        
        // Add rewards
        await addRewards(totalAmount);
        
        toast.success(`Order placed! You earned ${rewardsToEarn} reward points!`);

        // Payment successful - extract orderId correctly
        const orderId = result.order?.orderId || result.orderId;
        if (!orderId) {
          console.error('No orderId in response:', result);
          throw new Error('Order created but no ID received');
        }
        
        onPaymentComplete(orderId);
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timed out. Please check your connection and try again.');
        }
        throw fetchError;
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatTimeSlot = (timeSlot: string) => {
    const [start, end] = timeSlot.split('-');
    return `${start} - ${end}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} disabled={isProcessing}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Payment</h1>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Secure Payment
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={`https://images.unsplash.com/150x150?${scheduleData.product.image}`}
                alt={scheduleData.product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{scheduleData.product.name}</h3>
                <p className="text-sm text-muted-foreground">₹{scheduleData.product.price}</p>
              </div>
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Delivery Type:</span>
                <Badge variant="outline">
                  {scheduleData.deliveryType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Date:</span>
                <span className="text-sm font-medium">{formatDate(scheduleData.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Time:</span>
                <span className="text-sm font-medium">{formatTimeSlot(scheduleData.timeSlot)}</span>
              </div>
              {scheduleData.notes && (
                <div className="flex items-start justify-between">
                  <span className="text-sm">Notes:</span>
                  <span className="text-sm text-muted-foreground max-w-xs text-right">
                    {scheduleData.notes}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bill Details */}
        <Card>
          <CardHeader>
            <CardTitle>Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{scheduleData.product.price}</span>
              </div>
              {scheduleData.deliveryType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>₹10</span>
                </div>
              )}
              <div className="flex justify-between text-green-600">
                <span>Platform Fee</span>
                <span>Free</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} disabled={isProcessing}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, RuPay</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Wallet className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">UPI</p>
                      <p className="text-sm text-muted-foreground">PhonePe, Google Pay, Paytm</p>
                    </div>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Banknote className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-muted-foreground">Pay when you receive</p>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>

            {/* Card Details Form */}
            {paymentMethod === 'card' && (
              <div className="mt-6 space-y-4">
                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    disabled={isProcessing}
                  />
                </div>
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.name}
                    onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                    disabled={isProcessing}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Expiry</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Details */}
            {paymentMethod === 'upi' && (
              <div className="mt-6">
                <Label htmlFor="upiId">UPI ID</Label>
                <Input
                  id="upiId"
                  placeholder="username@paytm"
                  disabled={isProcessing}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pay Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full bg-primary hover:bg-primary/90 h-12"
        >
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              {paymentMethod === 'cod' ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Confirm Order
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  Pay ₹{totalAmount}
                </>
              )}
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}