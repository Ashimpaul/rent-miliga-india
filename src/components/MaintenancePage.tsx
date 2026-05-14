
import React from "react";
import { Home, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MaintenancePageProps {
  isError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ 
  isError = false, 
  errorMessage, 
  onRetry 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 text-center">
        <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          {isError ? (
            <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          ) : (
            <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin-slow" />
          )}
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">
          {isError ? "Oops! Something went wrong" : "We'll be right back!"}
        </h1>
        
        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
          {isError 
            ? "We're experiencing some technical difficulties. Our team is already working to fix the issue!"
            : "We're currently performing scheduled maintenance to improve your experience. We appreciate your patience!"}
        </p>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <p className="text-xs font-mono text-red-600 dark:text-red-400 break-all">
              {errorMessage}
            </p>
          </div>
        )}

        <div className="space-y-3">
          {isError && onRetry && (
            <Button 
              onClick={onRetry}
              className="w-full h-12 text-base font-bold rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Try Again
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-bold rounded-xl"
            asChild
          >
            <a href="/">
              <Home className="w-4 h-4 mr-2" /> Go to Homepage
            </a>
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Need help? Contact us at support@rentmilega.in
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
