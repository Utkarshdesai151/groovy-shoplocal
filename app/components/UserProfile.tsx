"use client"
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Gift, 
  Package, 
  Edit2, 
  Save,
  Plus,
  Trash2,
  Home,
  Briefcase,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  landmark?: string;
  isDefault: boolean;
}

interface UserProfileProps {
  onBack: () => void;
}

export function UserProfile({ onBack }: UserProfileProps) {
  const { user, updateUser } = useAuth();
  const { totalRewards } = useRewards();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      label: 'Home',
      address: '123 Main Street, Apartment 4B',
      landmark: 'Near Central Park',
      isDefault: true,
    },
    {
      id: '2',
      type: 'work',
      label: 'Office',
      address: '456 Business Ave, Floor 12',
      landmark: 'Next to Metro Station',
      isDefault: false,
    },
  ]);

  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    label: '',
    address: '',
    landmark: '',
  });

  const handleProfileUpdate = () => {
    updateUser({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
    });
    setIsEditingProfile(false);
    toast.success('Profile updated successfully!');
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.address) {
      toast.error('Please fill in all required fields');
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };

    setAddresses([...addresses, address]);
    setNewAddress({
      type: 'home',
      label: '',
      address: '',
      landmark: '',
    });
    setIsAddingAddress(false);
    toast.success('Address added successfully!');
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
    toast.success('Default address updated!');
  };

  const handleDeleteAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    toast.success('Address deleted!');
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1>My Profile</h1>
          <p className="text-muted-foreground mt-1">Manage your account settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Reward Points</p>
                  <p className="font-bold text-2xl text-primary">{totalRewards}</p>
                  <p className="text-xs text-muted-foreground mt-1">≈ ₹{totalRewards * 10} value</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Saved Addresses</p>
                  <p className="font-bold text-2xl">{addresses.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Delivery locations</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="addresses">
              <MapPin className="h-4 w-4 mr-2" />
              Addresses
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Personal Information</CardTitle>
                  {!isEditingProfile ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileData({
                            name: user?.name || '',
                            email: user?.email || '',
                            phone: user?.phone || '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleProfileUpdate}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      disabled={!isEditingProfile}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      disabled={!isEditingProfile}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      disabled={!isEditingProfile}
                      className="flex-1"
                    />
                  </div>
                </div>

                {user?.isAdmin && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-2">
                      <Badge variant="default">Admin Account</Badge>
                      <p className="text-sm text-muted-foreground">
                        You have administrative privileges
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses">
            <div className="space-y-4">
              {/* Add Address Button */}
              {!isAddingAddress && (
                <Button
                  onClick={() => setIsAddingAddress(true)}
                  className="w-full"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Address
                </Button>
              )}

              {/* Add Address Form */}
              {isAddingAddress && (
                <Card className="border-primary">
                  <CardHeader>
                    <CardTitle className="text-base">Add New Address</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="addressType">Address Type</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {['home', 'work', 'other'].map((type) => (
                          <Button
                            key={type}
                            variant={newAddress.type === type ? 'default' : 'outline'}
                            size="sm"
                            onClick={() =>
                              setNewAddress({
                                ...newAddress,
                                type: type as 'home' | 'work' | 'other',
                              })
                            }
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="label">Label</Label>
                      <Input
                        id="label"
                        placeholder="e.g., Home, Office, etc."
                        value={newAddress.label}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, label: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Full Address *</Label>
                      <Input
                        id="address"
                        placeholder="House/Flat no., Street name"
                        value={newAddress.address}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, address: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label htmlFor="landmark">Landmark (Optional)</Label>
                      <Input
                        id="landmark"
                        placeholder="Nearby landmark"
                        value={newAddress.landmark}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, landmark: e.target.value })
                        }
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddAddress} className="flex-1">
                        Save Address
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingAddress(false);
                          setNewAddress({
                            type: 'home',
                            label: '',
                            address: '',
                            landmark: '',
                          });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Saved Addresses */}
              {addresses.map((address) => (
                <Card key={address.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className="p-2 bg-accent rounded-lg h-fit">
                          {getAddressIcon(address.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium">{address.label}</h3>
                            {address.isDefault && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {address.address}
                          </p>
                          {address.landmark && (
                            <p className="text-sm text-muted-foreground">
                              Landmark: {address.landmark}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!address.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSetDefaultAddress(address.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAddress(address.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {addresses.length === 0 && !isAddingAddress && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3>No addresses saved</h3>
                    <p className="text-muted-foreground mt-2">
                      Add an address to get started
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
