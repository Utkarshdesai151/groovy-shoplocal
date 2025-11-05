"use client"
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, Clock, MapPin, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

interface Shop {
  id: string;
  name: string;
  category: string;
  rating: number;
  deliveryTime: string;
  distance: string;
  image: string;
  isOpen: boolean;
  featured: boolean;
  location: string;
}

interface ShopListingProps {
  location: string;
  onShopSelect: (shop: Shop) => void;
  onLocationChange: () => void;
}

export function ShopListing({ location, onShopSelect, onLocationChange }: ShopListingProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Grocery', 'Electronics', 'Fashion', 'Pharmacy', 'Home & Garden'];

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await api.getShops(location);
        
        if (result.error) {
          setError(result.error);
        } else if (result.data?.shops) {
          setShops(result.data.shops);
        }
      } catch (err) {
        setError('Failed to load shops. Please try again.');
        console.error('Fetch shops error:', err);
      }
      
      setIsLoading(false);
    };

    if (location) {
      fetchShops();
    }
  }, [location]);

  const filteredShops = selectedCategory === 'All' 
    ? shops 
    : shops.filter(shop => shop.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading shops in {location}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onLocationChange}
                className="text-primary hover:text-primary/80"
              >
                <MapPin className="h-4 w-4 mr-1" />
                {location}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <h1 className="font-semibold">ShopLocal</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Categories */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap ${
                  selectedCategory === category 
                    ? 'bg-primary text-white' 
                    : 'hover:bg-primary/10'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Shop Grid */}
        {filteredShops.length === 0 ? (
          <div className="text-center py-12">
            {error ? (
              <div>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Unable to load shops</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <div>
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {selectedCategory === 'All' 
                    ? `No shops available in ${location} at the moment.`
                    : `No ${selectedCategory.toLowerCase()} shops found in ${location}.`
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredShops.map((shop) => (
              <Card 
                key={shop.id} 
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  !shop.isOpen ? 'opacity-75' : ''
                }`}
                onClick={() => shop.isOpen && onShopSelect(shop)}
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/800x400?${shop.image}`}
                      alt={shop.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {shop.featured && (
                      <Badge className="absolute top-3 left-3 bg-primary">
                        Featured
                      </Badge>
                    )}
                    {!shop.isOpen && (
                      <div className="absolute inset-0 bg-black/50 rounded-t-lg flex items-center justify-center">
                        <Badge variant="destructive">Closed</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold mb-1">{shop.name}</h3>
                        <p className="text-sm text-muted-foreground">{shop.category}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{shop.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {shop.deliveryTime}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {shop.distance}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}