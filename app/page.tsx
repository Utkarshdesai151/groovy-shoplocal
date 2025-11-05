"use client"
import React, { useState, useEffect } from "react";
import { AuthProvider,useAuth  } from "./context/AuthContext"; 
import { RewardsProvider } from "./context/RewardsContext";
import { ErrorBoundary } from "next/dist/client/components/error-boundary";
import { AuthComponent } from "./components/AuthComponent";
import { LocationSelector } from "./components/LocationSelector";
import { ShopListing } from "./components/ShopListing";
import { ProductCatalog } from "./components/ProductCatalog";
import { SchedulingComponent } from "./components/SchedulingComponent";
import { PaymentComponent } from "./components/PaymentComponent";
import { OrderSuccess } from "./components/OrderSuccess";
import { MyOrders } from "./components/MyOrders";
import { AdminPanel } from "./components/AdminPanel";
import { Navbar } from "./components/Navbar";
import { SearchComponent } from "./components/SearchComponent";
import { UserProfile } from "./components/UserProfile";
import { ShopDetails } from "./components/ShopDetails";
import { Toaster } from "./components/ui/sonner";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
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
  location?: string;
}

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
  shopId?: string;
}

interface ScheduleData {
  product: Product;
  deliveryType: "delivery" | "pickup";
  date: string;
  timeSlot: string;
  notes: string;
}

type AppScreen =
  | "auth"
  | "location"
  | "shops"
  | "shopDetails"
  | "products"
  | "schedule"
  | "payment"
  | "success"
  | "orders"
  | "admin"
  | "search"
  | "profile";

function AppContent() {
  const { user, login, loading } = useAuth();
  const [currentScreen, setCurrentScreen] =
    useState<AppScreen>("auth");
  const [selectedLocation, setSelectedLocation] =
    useState<string>("");
  const [selectedShop, setSelectedShop] = useState<Shop | null>(
    null,
  );
  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);
  const [scheduleData, setScheduleData] =
    useState<ScheduleData | null>(null);
  const [completedOrderId, setCompletedOrderId] =
    useState<string>("");

  // Update screen when user logs in or auth check completes
  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in, navigate to location ONLY if on auth screen
        if (currentScreen === "auth") {
          console.log('User logged in, navigating to location');
          setCurrentScreen("location");
        }
      } else {
        // No user, force to auth screen
        console.log('No user detected, forcing auth screen');
        setCurrentScreen("auth");
      }
    }
  }, [user, loading]);

  // Handlers for navigation and state management
  const handleLogin = (userData: User) => {
    login(userData);
    setCurrentScreen("location");
  };

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen as AppScreen);
  };

  const handleLocationSelect = (location: string) => {
    setSelectedLocation(location);
    setCurrentScreen("shops");
  };

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(shop);
    setCurrentScreen("shopDetails");
  };

  const handleViewShopProducts = () => {
    setCurrentScreen("products");
  };

  const handleProductSchedule = (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen("schedule");
  };

  const handleScheduleSubmit = (data: ScheduleData) => {
    setScheduleData(data);
    setCurrentScreen("payment");
  };

  const handlePaymentComplete = (orderId: string) => {
    setCompletedOrderId(orderId);
    setCurrentScreen("success");
  };

  const handleStartOver = () => {
    setSelectedLocation("");
    setSelectedShop(null);
    setSelectedProduct(null);
    setScheduleData(null);
    setCompletedOrderId("");
    setCurrentScreen("location");
  };

  const handleBackToShops = () => {
    setSelectedShop(null);
    setSelectedProduct(null);
    setCurrentScreen("shops");
  };

  const handleBackToProducts = () => {
    setSelectedProduct(null);
    setCurrentScreen("products");
  };

  const handleBackToSchedule = () => {
    setCurrentScreen("schedule");
  };

  const handleLocationChange = () => {
    setSelectedShop(null);
    setSelectedProduct(null);
    setScheduleData(null);
    setCurrentScreen("location");
  };

  // Log current state for debugging
  useEffect(() => {
    console.log('App State:', { currentScreen, hasUser: !!user, loading });
  }, [currentScreen, user, loading]);

  // Render based on current screen
  const renderContent = () => {
    switch (currentScreen) {
      case "auth":
        return <AuthComponent onLogin={handleLogin} />;

      case "location":
        return (
          <LocationSelector
            onLocationSelect={handleLocationSelect}
          />
        );

      case "shops":
        return (
          <ShopListing
            location={selectedLocation}
            onShopSelect={handleShopSelect}
            onLocationChange={handleLocationChange}
          />
        );

      case "shopDetails":
        return selectedShop ? (
          <ShopDetails
            shop={selectedShop}
            onBack={handleBackToShops}
            onBrowseProducts={handleViewShopProducts}
          />
        ) : null;

      case "products":
        return selectedShop ? (
          <ProductCatalog
            shop={selectedShop}
            onBack={() => setCurrentScreen("shopDetails")}
            onScheduleItem={handleProductSchedule}
          />
        ) : null;

      case "schedule":
        return selectedProduct ? (
          <SchedulingComponent
            product={selectedProduct}
            onBack={handleBackToProducts}
            onProceedToPayment={handleScheduleSubmit}
          />
        ) : null;

      case "payment":
        return scheduleData ? (
          <PaymentComponent
            scheduleData={scheduleData}
            onBack={handleBackToSchedule}
            onPaymentComplete={handlePaymentComplete}
          />
        ) : null;

      case "success":
        return (
          <OrderSuccess
            orderId={completedOrderId}
            onStartOver={handleStartOver}
            onTrackOrder={() => setCurrentScreen("orders")}
          />
        );

      case "orders":
        return (
          <MyOrders
            onBack={() => setCurrentScreen("shops")}
          />
        );

      case "admin":
        return (
          <AdminPanel
            onBack={() => setCurrentScreen("shops")}
          />
        );

      case "search":
        return (
          <SearchComponent
            location={selectedLocation}
            onBack={() => setCurrentScreen("shops")}
            onShopSelect={handleShopSelect}
            onProductSelect={handleProductSchedule}
          />
        );

      case "profile":
        return (
          <UserProfile
            onBack={() => setCurrentScreen("shops")}
          />
        );

      default:
        return <AuthComponent onLogin={handleLogin} />;
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentScreen !== "auth" && (
        <Navbar
          onNavigate={handleNavigate}
          currentLocation={selectedLocation}
          showLocationChange={currentScreen === "shops"}
          onLocationChange={handleLocationChange}
        />
      )}
      {renderContent()}
      <Toaster />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RewardsProvider>
          <AppContent />
        </RewardsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}