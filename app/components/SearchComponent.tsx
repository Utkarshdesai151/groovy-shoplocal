"use client"
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Search, X, ArrowLeft, Store, Package, Clock, Star, TrendingUp } from 'lucide-react';
import '../styles/globals.css'
import "../index.css"

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

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  rating: number;
  shopId?: string;
  shopName?: string;
}

interface SearchComponentProps {
  onBack: () => void;
  onShopSelect: (shop: Shop) => void;
  onProductSelect: (product: Product) => void;
  location: string;
}

export function SearchComponent({ 
  onBack, 
  onShopSelect, 
  onProductSelect,
  location 
}: SearchComponentProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'shops' | 'products'>('shops');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Mock data for shops
  const allShops: Shop[] = [
    {
      id: '1',
      name: 'Fresh Vegetables Market',
      category: 'Vegetables',
      rating: 4.5,
      deliveryTime: '20-30 min',
      distance: '1.2 km',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400',
      isOpen: true,
      featured: true,
    },
    {
      id: '2',
      name: 'Organic Fruit Store',
      category: 'Fruits',
      rating: 4.8,
      deliveryTime: '15-25 min',
      distance: '0.8 km',
      image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400',
      isOpen: true,
      featured: true,
    },
    {
      id: '3',
      name: 'Daily Dairy Products',
      category: 'Dairy',
      rating: 4.3,
      deliveryTime: '25-35 min',
      distance: '2.1 km',
      image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400',
      isOpen: true,
      featured: false,
    },
    {
      id: '4',
      name: 'Spice Bazaar',
      category: 'Spices',
      rating: 4.6,
      deliveryTime: '30-40 min',
      distance: '3.5 km',
      image: 'https://images.unsplash.com/photo-1596040033229-a0b4c0de4c26?w=400',
      isOpen: true,
      featured: false,
    },
  ];

  // Mock data for products
  const allProducts: Product[] = [
    {
      id: '1',
      name: 'Fresh Tomatoes',
      price: 40,
      description: 'Farm fresh tomatoes',
      image: 'https://images.unsplash.com/photo-1546470427-227e04e1cfbe?w=300',
      category: 'Vegetables',
      rating: 4.5,
      shopName: 'Fresh Vegetables Market',
    },
    {
      id: '2',
      name: 'Organic Bananas',
      price: 60,
      description: 'Naturally ripened bananas',
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300',
      category: 'Fruits',
      rating: 4.7,
      shopName: 'Organic Fruit Store',
    },
    {
      id: '3',
      name: 'Fresh Milk',
      price: 50,
      description: 'Pure cow milk',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300',
      category: 'Dairy',
      rating: 4.4,
      shopName: 'Daily Dairy Products',
    },
    {
      id: '4',
      name: 'Turmeric Powder',
      price: 120,
      description: 'Premium quality turmeric',
      image: 'https://images.unsplash.com/photo-1615485500834-bc10199bc1bf?w=300',
      category: 'Spices',
      rating: 4.8,
      shopName: 'Spice Bazaar',
    },
    {
      id: '5',
      name: 'Fresh Potatoes',
      price: 30,
      description: 'Farm fresh potatoes',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300',
      category: 'Vegetables',
      rating: 4.3,
      shopName: 'Fresh Vegetables Market',
    },
  ];

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('groovy_search_history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      
      // Filter shops
      const shops = allShops.filter(shop => 
        shop.name.toLowerCase().includes(query) || 
        shop.category.toLowerCase().includes(query)
      );
      setFilteredShops(shops);

      // Filter products
      const products = allProducts.filter(product => 
        product.name.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
      setFilteredProducts(products);
    } else {
      setFilteredShops([]);
      setFilteredProducts([]);
    }
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() && !searchHistory.includes(query.trim())) {
      const newHistory = [query.trim(), ...searchHistory].slice(0, 5);
      setSearchHistory(newHistory);
      localStorage.setItem('groovy_search_history', JSON.stringify(newHistory));
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('groovy_search_history');
  };

  const popularSearches = ['Vegetables', 'Fruits', 'Dairy', 'Organic', 'Spices'];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for shops or products..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 h-12 bg-input-background"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery ? (
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'shops' | 'products')}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="shops">
                <Store className="h-4 w-4 mr-2" />
                Shops ({filteredShops.length})
              </TabsTrigger>
              <TabsTrigger value="products">
                <Package className="h-4 w-4 mr-2" />
                Products ({filteredProducts.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="shops">
              {filteredShops.length > 0 ? (
                <div className="space-y-4">
                  {filteredShops.map((shop) => (
                    <Card
                      key={shop.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onShopSelect(shop)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={shop.image}
                            alt={shop.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-medium">{shop.name}</h3>
                                <p className="text-sm text-muted-foreground">{shop.category}</p>
                              </div>
                              <Badge variant={shop.isOpen ? 'default' : 'secondary'}>
                                {shop.isOpen ? 'Open' : 'Closed'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{shop.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{shop.deliveryTime}</span>
                              </div>
                              <span>{shop.distance}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No shops found for "{searchQuery}"</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="products">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onProductSelect(product)}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-20 h-20 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium mb-1">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {product.shopName}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-primary">₹{product.price}</span>
                              <div className="flex items-center gap-1 text-sm">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{product.rating}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No products found for "{searchQuery}"</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            {/* Search History */}
            {searchHistory.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Recent Searches</h3>
                    <Button variant="ghost" size="sm" onClick={clearHistory}>
                      Clear
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, idx) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => setSearchQuery(term)}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {term}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Popular Searches */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Popular Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.map((term, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => setSearchQuery(term)}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Search Tips */}
            <Card className="bg-accent/50">
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Search Tips</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Search by shop name, product name, or category</li>
                  <li>• Use specific keywords for better results</li>
                  <li>• Try "organic", "fresh", or category names</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
