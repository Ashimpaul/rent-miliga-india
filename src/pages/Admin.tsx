import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { Lock, LogOut, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Admin = () => {
  const [password, setPassword] = useState("");
  const { login, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      toast.success("Admin login successful");
      navigate("/");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 animate-fade-up">
          <div className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Portal</h1>
            <p className="text-muted-foreground">
              {isAdmin 
                ? "You are currently logged in as an administrator." 
                : "Enter your administrator password to continue."}
            </p>
          </div>

          {isAdmin ? (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">Administrator Access Active</span>
              </div>
              
              <div className="grid grid-cols-1 gap-3 pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Go to Homepage
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => {
                    logout();
                    toast.success("Logged out successfully");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout from Admin
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Administrator Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="••••••••"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full font-semibold">
                  Access Admin Panel
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
