import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Mail, Lock, LogOut, ArrowLeft, ShieldCheck, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdminBlogManagement from "@/components/AdminBlogManagement";

const Admin = () => {
  const { login, isAdmin, logout } = useAuth();
  console.log("Admin page render. isAdmin:", isAdmin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const success = await login(email, password);
      if (success) {
        toast.success("Admin login successful");
        navigate("/admin");
      } else {
        toast.error("Invalid email or password");
        setPassword("");
      }
    } catch (err) {
      toast.error("Login failed, please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center py-12 px-4">
        <div className="w-full max-w-4xl space-y-6 animate-fade-up">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "Manage your website content and settings." 
                : "Enter your admin credentials to continue."}
            </p>
          </div>

          {isAdmin ? (
            <div className="w-full space-y-8" data-testid="admin-dashboard">
              <div className="flex flex-col items-center justify-center space-y-4 bg-primary/5 border border-primary/10 p-6 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <h2 className="text-lg font-bold">Administrator Session Active</h2>
                </div>
                <div className="flex gap-3">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Homepage
                    </Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="blog" className="w-full">
                <div className="flex justify-center">
                  <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="blog">Manage Blog</TabsTrigger>
                    <TabsTrigger value="general">Site Settings</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="blog" className="mt-8 animate-fade-up">
                  <React.Suspense fallback={<div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
                    <AdminBlogManagement />
                  </React.Suspense>
                </TabsContent>

                <TabsContent value="general" className="mt-8 animate-fade-up">
                  <div className="bg-card border border-border rounded-xl p-8 shadow-sm text-center">
                    <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4 opacity-20" />
                    <h3 className="text-xl font-bold mb-2">General Settings</h3>
                    <p className="text-muted-foreground">Additional website settings will appear here in future updates.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="admin@rentmilega.in"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                  ) : (
                    "Access Admin Panel"
                  )}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Unauthorized access is restricted.
                </p>
              </form>
            </div>
          )}
          
          <div className="text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center">
              <ArrowLeft className="mr-1 h-3 w-3" /> Back to RentMilega
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
