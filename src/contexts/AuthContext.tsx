import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";

interface AuthContextType {
  isAdmin: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
  user: null,
  login: async () => false,
  logout: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutRef = useRef<(() => Promise<void>) | null>(null);
  
  // Auto-logout after 30 minutes of inactivity (1800000 ms)
  const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  // Store logout in ref to avoid circular dependency
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    // Only set timer if user is logged in
    if (user) {
      inactivityTimeoutRef.current = setTimeout(() => {
        if (logoutRef.current) {
          logoutRef.current();
          toast.warning("Logged out due to inactivity");
        }
      }, INACTIVITY_TIMEOUT);
    }
  }, [user]);

  // Set up event listeners for user activity
  useEffect(() => {
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 
      'touchstart', 'click', 'wheel'
    ];

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });

    // Initialize timer
    resetInactivityTimer();

    // Cleanup
    return () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [user, resetInactivityTimer]);

  // Check admin status by verifying with the database
  const checkAdminStatus = async (userId: string | undefined) => {
    if (!userId) {
      setIsAdmin(false);
      return;
    }

    try {
      // Query admin_config table to check if user is admin
      const { data, error } = await supabase
        .from('admin_config')
        .select('admin_user_id')
        .eq('id', 'config')
        .single();

      if (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
        return;
      }

      setIsAdmin(data?.admin_user_id === userId);
    } catch (err) {
      console.error("Unexpected error checking admin status:", err);
      setIsAdmin(false);
    }
  };

  // Check auth state on mount
  useEffect(() => {
    let mounted = true;

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setUser(session?.user ?? null);
          await checkAdminStatus(session?.user?.id);
        }
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (mounted) {
          setUser(session?.user ?? null);
          await checkAdminStatus(session?.user?.id);
          setLoading(false);
          // Reset timer on auth change
          resetInactivityTimer();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resetInactivityTimer]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase login error:", error);
        toast.error(`Login failed: ${error.message}`);
        return false;
      }

      toast.success("Logged in successfully!");
      return true;
    } catch (err: any) {
      console.error("Unexpected login error:", err);
      toast.error(`Login failed: ${err.message}`);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ isAdmin, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
