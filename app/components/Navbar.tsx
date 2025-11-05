"use client"
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useRewards } from '../context/RewardsContext';
import { Button } from './ui/button';
import { 
  ShoppingBag, 
  Gift, 
  User, 
  LogOut, 
  History,
  ShieldCheck,
  MapPin,
  Search,
  UserCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import '../../app/index.css'

interface NavbarProps {
  onNavigate: (screen: string) => void;
  currentLocation?: string;
  showLocationChange?: boolean;
  onLocationChange?: () => void;
}

export function Navbar({ 
  onNavigate, 
  currentLocation, 
  showLocationChange,
  onLocationChange 
}: NavbarProps) {
  const { user, logout } = useAuth();
  const { totalRewards } = useRewards();

  const handleLogout = () => logout();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-md transition-shadow duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group hover:scale-105 transition-transform duration-200"
            onClick={() => onNavigate('shops')}
          >
            <ShoppingBag className="h-8 w-8 text-primary" />
            <div>
              <h1 className="font-bold text-primary text-lg">Groovy</h1>
              <p className="text-xs text-muted-foreground -mt-1">ShopLocal</p>
            </div>
          </div>

          {/* Location Display */}
         

          <div className="flex items-center space-x-3">
            
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onNavigate('search')}
              className="rounded-full hover:bg-gray-100 transition-colors duration-200"
            >
              <Search className="h-5 w-5 text-muted-foreground" />
            </Button>

            {/* Rewards Display */}
            <div className="hidden sm:flex items-center space-x-2 bg-accent/20 px-4 py-1.5 rounded-full hover:bg-accent/30 transition-colors duration-200">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">{totalRewards} Points</span>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100 transition-colors duration-200">
                  <User className="h-5 w-5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 shadow-lg rounded-lg border border-gray-200">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Rewards on mobile */}
                <DropdownMenuItem className="sm:hidden hover:bg-accent/20 transition-colors duration-200">
                  <Gift className="h-4 w-4 mr-2 text-primary" />
                  <span>{totalRewards} Reward Points</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onNavigate('profile')} className="hover:bg-gray-100 transition-colors duration-200">
                  <UserCircle className="h-4 w-4 mr-2" />
                  <span>My Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => onNavigate('orders')} className="hover:bg-gray-100 transition-colors duration-200">
                  <History className="h-4 w-4 mr-2" />
                  <span>My Orders</span>
                </DropdownMenuItem>

                {user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onNavigate('admin')} className="hover:bg-gray-100 transition-colors duration-200">
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-red-100 transition-colors duration-200">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
