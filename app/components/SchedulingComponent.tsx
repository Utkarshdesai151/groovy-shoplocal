"use client"
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Clock, Calendar, MapPin, Truck } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  discount?: number;
}

interface SchedulingComponentProps {
  product: Product;
  onBack: () => void;
  onProceedToPayment: (scheduleData: ScheduleData) => void;
}

interface ScheduleData {
  product: Product;
  deliveryType: 'delivery' | 'pickup';
  date: string;
  timeSlot: string;
  notes: string;
}

export function SchedulingComponent({ product, onBack, onProceedToPayment }: SchedulingComponentProps) {
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Generate next 7 days
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      });
    }
    return dates;
  };

  const timeSlots = [
    { value: '09:00-11:00', label: '9:00 AM - 11:00 AM', available: true },
    { value: '11:00-13:00', label: '11:00 AM - 1:00 PM', available: true },
    { value: '13:00-15:00', label: '1:00 PM - 3:00 PM', available: false },
    { value: '15:00-17:00', label: '3:00 PM - 5:00 PM', available: true },
    { value: '17:00-19:00', label: '5:00 PM - 7:00 PM', available: true },
    { value: '19:00-21:00', label: '7:00 PM - 9:00 PM', available: true }
  ];

  const dates = generateDates();

  const handleSchedule = () => {
    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select both date and time slot');
      return;
    }

    const scheduleData: ScheduleData = {
      product,
      deliveryType,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      notes
    };

    onProceedToPayment(scheduleData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="font-semibold">Schedule Order</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Product Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <ImageWithFallback
                src={`https://images.unsplash.com/150x150?${product.image}`}
                alt={product.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-bold">₹{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Type */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Delivery Option
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={deliveryType} onValueChange={(value) => setDeliveryType(value as 'delivery' | 'pickup')}>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Home Delivery</p>
                      <p className="text-sm text-muted-foreground">Delivered to your doorstep</p>
                    </div>
                    <Badge variant="secondary">+₹10</Badge>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Store Pickup</p>
                      <p className="text-sm text-muted-foreground">Collect from store</p>
                    </div>
                    <Badge variant="outline">Free</Badge>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {dates.map((date) => (
                <Button
                  key={date.value}
                  variant={selectedDate === date.value ? "default" : "outline"}
                  className={`h-auto p-3 flex flex-col gap-1 ${
                    selectedDate === date.value ? 'bg-primary text-white' : ''
                  }`}
                  onClick={() => setSelectedDate(date.value)}
                >
                  <span className="text-xs">{date.label.split(' ')[0]}</span>
                  <span className="text-sm font-semibold">
                    {date.label.split(' ')[2]}
                  </span>
                  {date.isToday && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      Today
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Slot Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Select Time Slot
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.value}
                  variant={selectedTimeSlot === slot.value ? "default" : "outline"}
                  className={`h-auto p-3 ${
                    !slot.available ? 'opacity-50 cursor-not-allowed' : ''
                  } ${selectedTimeSlot === slot.value ? 'bg-primary text-white' : ''}`}
                  disabled={!slot.available}
                  onClick={() => slot.available && setSelectedTimeSlot(slot.value)}
                >
                  <div className="text-center">
                    <p className="font-medium">{slot.label}</p>
                    {!slot.available && (
                      <p className="text-xs text-muted-foreground">Not Available</p>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Special Instructions (Optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special instructions for delivery/pickup..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span>₹{product.price}</span>
              </div>
              {deliveryType === 'delivery' && (
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span>₹10</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total Amount</span>
                <span>₹{product.price + (deliveryType === 'delivery' ? 10 : 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proceed Button */}
        <Button 
          onClick={handleSchedule}
          className="w-full bg-primary hover:bg-primary/90"
          disabled={!selectedDate || !selectedTimeSlot}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
}