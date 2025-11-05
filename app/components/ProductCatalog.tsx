"use client"
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Star, Clock, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

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
  shopId: string;
}

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
}

interface ProductCatalogProps {
  shop: Shop;
  onBack: () => void;
  onScheduleItem: (product: Product) => void;
}

export function ProductCatalog({ shop, onBack, onScheduleItem }: ProductCatalogProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Fresh Produce', 'Grains & Cereals', 'Dairy Products', 'Bakery', 'Beverages', 'Cooking Essentials'];

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await api.getProducts(shop.id);
        
        if (result.error) {
          setError(result.error);
        } else if (result.data?.products) {
          setProducts(result.data.products);
        }
      } catch (err) {
        setError('Failed to load products. Please try again.');
        console.error('Fetch products error:', err);
      }
      
      setIsLoading(false);
    };

    if (shop.id) {
      fetchProducts();
    }
  }, [shop.id]);

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading products from {shop.name}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="font-semibold">{shop.name}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {shop.rating}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {shop.deliveryTime}
                </div>
              </div>
            </div>
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

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            {error ? (
              <div>
                <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Unable to load products</p>
                <Button onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            ) : (
              <div>
                <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {selectedCategory === 'All' 
                    ? `No products available from ${shop.name} at the moment.`
                    : `No ${selectedCategory.toLowerCase()} products found.`
                  }
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative">
                    <ImageWithFallback
                      src={`https://images.unsplash.com/400x300?${product.image}`}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.discount && (
                      <Badge className="absolute top-3 left-3 bg-destructive">
                        {product.discount}% OFF
                      </Badge>
                    )}
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Badge variant="secondary">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-2">
                      <h3 className="font-semibold mb-1">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">₹{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">
                            ₹{product.originalPrice}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">{product.rating}</span>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => onScheduleItem(product)}
                      disabled={!product.inStock}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Now
                    </Button>
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