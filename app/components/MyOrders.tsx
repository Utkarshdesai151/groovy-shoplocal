"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Package,
  Gift,
  Calendar,
  CreditCard,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { projectId, publicAnonKey } from "../utils/superbase/info";
import { toast } from "sonner";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  rewardsEarned: number;
  paymentMethod: string;
  deliveryType: string;
  deliveryDate: string;
  timeSlot: string;
  paymentStatus: string;
  createdAt: string;
}

interface MyOrdersProps {
  onBack: () => void;
}

export function MyOrders({ onBack }: MyOrdersProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterPayment, setFilterPayment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, filterPayment, sortBy]);

  const fetchOrders = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-4ca6791f/orders/user/${user.email}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        toast.error("Failed to load orders");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error loading orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];
    if (filterPayment !== "all") {
      filtered = filtered.filter(
        (order) => order.paymentMethod === filterPayment
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "date-asc":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "amount-desc":
          return b.totalAmount - a.totalAmount;
        case "amount-asc":
          return a.totalAmount - b.totalAmount;
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const getOrderStatus = (order: Order) => {
    const deliveryDate = new Date(order.deliveryDate);
    const now = new Date();
    const hoursUntilDelivery =
      (deliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDelivery < 0)
      return { status: "Delivered", color: "bg-green-100 text-green-700" };
    if (hoursUntilDelivery <= 24)
      return {
        status: "Preparing",
        color: "bg-blue-100 text-blue-700",
        timeText: `Ready in ${Math.ceil(hoursUntilDelivery)}h`,
      };
    return {
      status: "Scheduled",
      color: "bg-purple-100 text-purple-700",
      timeText: `In ${Math.ceil(hoursUntilDelivery / 24)} days`,
    };
  };

  const totalSpent = orders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );
  const totalRewardsEarned = orders.reduce(
    (sum, order) => sum + (order.rewardsEarned || 0),
    0
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">My Orders</h1>
            <p className="text-sm text-muted-foreground">
              Track and manage your orders
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-lg font-bold">{orders.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold">₹{totalSpent}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center gap-3">
              <Gift className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rewards Earned</p>
                <p className="text-lg font-bold">{totalRewardsEarned} pts</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-5 flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-2">
                Filter by Payment
              </label>
              <Select value={filterPayment} onValueChange={setFilterPayment}>
                <SelectTrigger>
                  <SelectValue placeholder="All Payments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="cod">Cash on Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-2">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="amount-desc">Highest Amount</SelectItem>
                  <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders */}
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-16">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold">No Orders Found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {filterPayment !== "all" || sortBy !== "date-desc"
                ? "Try adjusting your filters."
                : "Start shopping to see your orders here."}
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <Card key={order.orderId} className="hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.orderId}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge
                        variant={
                          order.paymentStatus === "completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {order.paymentMethod.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {order.deliveryType === "delivery"
                          ? "Delivery"
                          : "Pickup"}
                      </Badge>
                    </div>
                  </div>
                  <div
                    className={`mt-3 inline-block px-3 py-1 rounded-lg text-sm font-medium ${getOrderStatus(order).color}`}
                  >
                    {getOrderStatus(order).status}{" "}
                    {getOrderStatus(order).timeText &&
                      `• ${getOrderStatus(order).timeText}`}
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="p-5 space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Items</p>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between text-sm text-muted-foreground"
                        >
                          <span>
                            {item.name} × {item.quantity}
                          </span>
                          <span>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(order.deliveryDate)} • {order.timeSlot}
                  </div>

                  {order.rewardsEarned > 0 && (
                    <div className="flex items-center text-sm text-orange-600">
                      <Gift className="h-4 w-4 mr-2" />
                      Earned {order.rewardsEarned} points
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">
                      ₹{order.totalAmount}
                    </span>
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
