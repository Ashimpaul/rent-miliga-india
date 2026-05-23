
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Lock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ResetPassword = () =&gt; {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState&lt;string | null&gt;(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() =&gt; {
    const checkSession = async () =&gt; {
      try {
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");

        if (accessToken &amp;&amp; refreshToken &amp;&amp; type === "recovery") {
          const { error: setSessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (setSessionError) {
            console.error("Error setting session from recovery link:", setSessionError);
            setError("Invalid or expired password reset link. Please request a new one.");
            setCheckingSession(false);
            return;
          }
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Invalid or expired password reset link. Please request a new one.");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, [searchParams]);

  const handleResetPassword = async (e: React.FormEvent) =&gt; {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length &lt; 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Password reset successfully!");
      
      setTimeout(() =&gt; {
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    &lt;div className="flex min-h-screen flex-col"&gt;
      &lt;Header /&gt;
      &lt;main className="flex-1 flex items-center justify-center py-12 px-4"&gt;
        &lt;Card className="w-full max-w-md shadow-xl"&gt;
          &lt;CardHeader className="text-center"&gt;
            &lt;CardTitle className="text-2xl font-bold"&gt;
              {checkingSession ? "Verifying Link..." : (success ? "Password Updated!" : "Reset Your Password")}
            &lt;/CardTitle&gt;
            &lt;CardDescription&gt;
              {checkingSession 
                ? "Please wait while we verify your password reset link..." 
                : (success 
                  ? "Your password has been reset. Redirecting to homepage..." 
                  : "Enter a new password for your account")}
            &lt;/CardDescription&gt;
          &lt;/CardHeader&gt;
          
          &lt;CardContent&gt;
            {checkingSession ? (
              &lt;div className="flex justify-center py-12"&gt;
                &lt;div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /&gt;
              &lt;/div&gt;
            ) : (
              &lt;&gt;
                {error &amp;&amp; (
                  &lt;div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3"&gt;
                    &lt;AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /&gt;
                    &lt;p className="text-sm text-destructive"&gt;{error}&lt;/p&gt;
                  &lt;/div&gt;
                )}

                {success ? (
                  &lt;div className="text-center py-8"&gt;
                    &lt;CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" /&gt;
                    &lt;p className="text-muted-foreground"&gt;
                      You will be redirected to the homepage shortly.
                    &lt;/p&gt;
                    &lt;Button asChild className="mt-6"&gt;
                      &lt;Link to="/"&gt;
                        &lt;ArrowLeft className="h-4 w-4 mr-2" /&gt;
                        Go Home Now
                      &lt;/Link&gt;
                    &lt;/Button&gt;
                  &lt;/div&gt;
                ) : (
                  &lt;form onSubmit={handleResetPassword} className="space-y-4"&gt;
                    &lt;div className="space-y-2"&gt;
                      &lt;label htmlFor="password" className="text-sm font-medium flex items-center gap-2"&gt;
                        &lt;Lock className="h-4 w-4" /&gt;
                        New Password
                      &lt;/label&gt;
                      &lt;Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) =&gt; setPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        minLength={6}
                      /&gt;
                    &lt;/div&gt;

                    &lt;div className="space-y-2"&gt;
                      &lt;label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2"&gt;
                        &lt;Lock className="h-4 w-4" /&gt;
                        Confirm Password
                      &lt;/label&gt;
                      &lt;Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) =&gt; setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        minLength={6}
                      /&gt;
                    &lt;/div&gt;

                    &lt;Button 
                      type="submit" 
                      className="w-full font-bold" 
                      disabled={loading}
                    &gt;
                      {loading ? "Resetting Password..." : "Reset Password"}
                    &lt;/Button&gt;
                  &lt;/form&gt;
                )}
              &lt;/&gt;
            )}
          &lt;/CardContent&gt;

          {!success &amp;&amp; !checkingSession &amp;&amp; (
            &lt;CardFooter className="justify-center"&gt;
              &lt;Button variant="ghost" size="sm" asChild&gt;
                &lt;Link to="/"&gt;
                  &lt;ArrowLeft className="h-4 w-4 mr-2" /&gt;
                  Back to Home
                &lt;/Link&gt;
              &lt;/Button&gt;
            &lt;/CardFooter&gt;
          )}
        &lt;/Card&gt;
      &lt;/main&gt;
      &lt;Footer /&gt;
    &lt;/div&gt;
  );
};

export default ResetPassword;
