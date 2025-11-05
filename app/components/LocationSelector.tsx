"use client"
import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { MapPin, ChevronRight, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

interface LocationSelectorProps {
  onLocationSelect: (location: string) => void;
}

interface Location {
  name: string;
  shops: number;
  popular: boolean;
}

export function LocationSelector({ onLocationSelect }: LocationSelectorProps) {
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLocations = async () => {
      setIsLoading(true);
      setError('');

      try {
        const result = await api.getLocations();
        
        if (result.error) {
          setError(result.error);
        } else if (result.data?.locations) {
          setLocations(result.data.locations);
        }
      } catch (err) {
        setError('Failed to load locations. Please try again.');
        console.error('Fetch locations error:', err);
      }
      
      setIsLoading(false);
    };

    fetchLocations();
  }, []);

  const handleLocationSelect = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold">Select Your Area</h1>
          </div>
          <p className="text-muted-foreground">Choose your location to discover nearby shops</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Available Areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {locations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No locations available at the moment.</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  Retry
                </Button>
              </div>
            ) : (
              <>
                {locations.map((location) => (
                  <div
                    key={location.name}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedLocation === location.name
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedLocation(location.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{location.name}</h3>
                            {location.popular && (
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                Popular
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {location.shops} shops available
                          </p>
                        </div>
                      </div>
                      <ChevronRight className={`h-5 w-5 transition-colors ${
                        selectedLocation === location.name ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                ))}

                <Button 
                  onClick={handleLocationSelect} 
                  disabled={!selectedLocation}
                  className="w-full mt-6 bg-primary hover:bg-primary/90"
                >
                  Continue to Shops
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}