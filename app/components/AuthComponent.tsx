"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Store, Smartphone, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import { auth } from "../utils/superbase/client";
import { api } from "../utils/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  isAdmin?: boolean;
}

interface AuthComponentProps {
  onLogin: (userData: User) => void;
}

export function AuthComponent({ onLogin }: AuthComponentProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "customer", // 👈 added default role
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTabChange = (tab: "login" | "register") => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await auth.getSession();
      if (data.session) {
        api.setAccessToken(data.session.access_token);
        const profileResult = await api.getProfile();
        if (profileResult.data) {
          const isAdmin = profileResult.data.profile.email.endsWith("@admin.com");
          onLogin({
            id: data.session.user.id,
            name: profileResult.data.profile.name,
            email: profileResult.data.profile.email,
            phone: profileResult.data.profile.phone,
            isAdmin,
          });
        }
      }
    };
    checkAuth();
  }, [onLogin]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await auth.signIn(
        loginData.email,
        loginData.password
      );

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        api.setAccessToken(data.session.access_token);
        const profileResult = await api.getProfile();

        if (profileResult.error) {
          setError("Failed to load profile");
          setIsLoading(false);
          return;
        }

        const isAdmin = profileResult.data.profile.email.endsWith("@admin.com");

        onLogin({
          id: data.session.user.id,
          name: profileResult.data.profile.name,
          email: profileResult.data.profile.email,
          phone: profileResult.data.profile.phone,
          isAdmin,
        });
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    }

    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (registerData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const result = await api.register({
        email: registerData.email,
        password: registerData.password,
        name: registerData.name,
        phone: registerData.phone,
        role: registerData.role, // 👈 send role to backend
      });

      if (result.error) {
        if (
          result.error.includes("already registered") ||
          result.error.includes("already exists")
        ) {
          setError(result.error);
          setLoginData({ email: registerData.email, password: "" });
          setTimeout(() => {
            setActiveTab("login");
            setError("This email is already registered. Please login below.");
          }, 2000);
        } else {
          setError(result.error);
        }
        setIsLoading(false);
        return;
      }

      setSuccess("Account created successfully! Switching to login...");
      setLoginData({
        email: registerData.email,
        password: registerData.password,
      });
      setRegisterData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        role: "customer",
      });

      setTimeout(() => {
        setActiveTab("login");
        setSuccess("Account created! Please login with your credentials.");
      }, 1500);
    } catch (err) {
      setError("Registration failed. Please try again.");
      console.error("Registration error:", err);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 bg-primary rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Groovy</h1>
              <p className="text-xs text-muted-foreground -mt-1">ShopLocal</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Connect with local shops in your area
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <AlertCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(v) => handleTabChange(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginData.email}
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={registerData.name}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          name: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Enter your email"
                      value={registerData.email}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          email: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                        <Smartphone className="h-4 w-4 text-muted-foreground mr-1" />
                        <span className="text-sm">+91</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="9876543210"
                        className="rounded-l-none"
                        value={registerData.phone}
                        onChange={(e) =>
                          setRegisterData({
                            ...registerData,
                            phone: e.target.value,
                          })
                        }
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* 👇 New Role Selector */}
                  <div className="space-y-2">
                    <Label htmlFor="role">Select Role</Label>
                    <select
                      id="role"
                      value={registerData.role}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          role: e.target.value,
                        })
                      }
                      className="w-full border rounded-md px-3 py-2"
                      disabled={isLoading}
                      required
                    >
                      <option value="customer">Customer</option>
                      <option value="user">User</option>
                      <option value="guest">Guest</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Create a password (min 6 characters)"
                      value={registerData.password}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      value={registerData.confirmPassword}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
