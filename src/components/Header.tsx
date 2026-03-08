import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Rent<span className="text-primary">Miliga</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant={isActive("/") ? "default" : "ghost"} size="sm" asChild>
            <Link to="/"><Home className="mr-1.5 h-3.5 w-3.5" /> Home</Link>
          </Button>
          <Button variant={isActive("/rentals") ? "default" : "ghost"} size="sm" asChild>
            <Link to="/rentals"><Search className="mr-1.5 h-3.5 w-3.5" /> Find Rentals</Link>
          </Button>
          <Button variant={isActive("/post") ? "default" : "ghost"} size="sm" asChild>
            <Link to="/post"><PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Post Property</Link>
          </Button>
          <Button variant="ghost" size="icon" className="ml-1 h-8 w-8" onClick={toggle}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
