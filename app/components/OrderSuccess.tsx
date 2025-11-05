"use client"
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, Clock, MapPin, Phone, Store, Copy, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/superbase/info';

interface OrderSuccessProps {
  orderId: string;
  onStartOver: () => void;
  onTrackOrder: () => void;
}

export function OrderSuccess({ orderId, onStartOver, onTrackOrder }: OrderSuccessProps) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      try {
        // Wait a bit for order to be saved
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f/orders/${orderId}`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          if (result.order) {
            setOrder(result.order);
          }
        } else {
          console.warn('Order fetch failed:', response.status);
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.name !== 'AbortError') {
          console.warn('Failed to load order details:', err);
        }
        // Don't show error to user - order was confirmed even if we can't fetch details
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy order ID:', err);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };

  const formatTimeSlot = (timeSlot: string) => {
    const [start, end] = timeSlot.split('-');
    return `${start} - ${end}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary/5 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={onStartOver} className="w-full">
            Go Back to Shopping
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Success Animation */}
        <div className="text-center">
          <div className="relative mx-auto w-24 h-24 mb-6">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping"></div>
          </div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">Your Groovy:ShopLocal order has been scheduled successfully</p>
        </div>

        {/* Order Details */}
        <Card className="shadow-lg border-green-200">
          <CardContent className="p-6 space-y-4">
            <div className="text-center border-b pb-4">
              <p className="text-sm text-muted-foreground">Order ID</p>
              <div className="flex items-center justify-center gap-2">
                <p className="font-bold text-lg">{orderId}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyOrderId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Copied!</p>
              )}
            </div>

            {order && (
              <div className="space-y-3">
                {(order.deliveryDate || order.scheduledDate) && order.timeSlot && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Scheduled Time</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(order.deliveryDate || order.scheduledDate)}</p>
                      <p className="text-sm text-muted-foreground">{formatTimeSlot(order.timeSlot)}</p>
                    </div>
                  </div>
                )}

                {order.deliveryType && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Delivery Type</span>
                    </div>
                    <Badge variant="outline">
                      {order.deliveryType === 'delivery' ? 'Home Delivery' : 'Store Pickup'}
                    </Badge>
                  </div>
                )}

                {(order.items?.[0]?.name || order.product?.name) && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Product</span>
                    </div>
                    <span className="text-sm font-medium">{order.items?.[0]?.name || order.product?.name}</span>
                  </div>
                )}

                {order.totalAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Amount</span>
                    <span className="text-sm font-bold">₹{order.totalAmount}</span>
                  </div>
                )}

                {order.paymentStatus && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Payment Status</span>
                    <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                      {order.paymentStatus === 'completed' ? 'Paid' : 'Cash on Delivery'}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-3">What happens next?</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">1</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Order Preparation</p>
                  <p className="text-sm text-muted-foreground">The shop will prepare your order</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">2</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Delivery Confirmation</p>
                  <p className="text-sm text-muted-foreground">You'll receive a call before delivery</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-primary">3</span>
                </div>
                <div>
                  <p className="font-medium text-sm">Order Delivered</p>
                  <p className="text-sm text-muted-foreground">Enjoy your fresh products!</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="bg-accent/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Phone className="h-4 w-4 text-primary" />
              <span className="font-medium">Need Help?</span>
            </div>
            <p className="text-sm text-muted-foreground">Call us at +91 8888-8888-88</p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={onTrackOrder}>
            Track Order
          </Button>
          <Button onClick={onStartOver} className="w-full bg-primary hover:bg-primary/90">
            Schedule Another Order
          </Button>
        </div>
      </div>
    </div>
  );
}