import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, Moon, Sun, Menu, LogOut, Info, PhoneCall, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/rentals", label: "Find Rentals", icon: Search },
  { path: "/post", label: "Post Property", icon: PlusCircle },
];

const SIDEBAR_EXTRA_ITEMS = [
  { path: "/about", label: "About Us", icon: Info },
  { path: "/contact", label: "Contact Us", icon: PhoneCall },
  { path: "/help", label: "Help & FAQ", icon: HelpCircle },
];

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 animate-fade-in border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-110">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Rent<span className="text-primary">Milega</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.path}
              variant={isActive(item.path) ? "default" : "ghost"}
              size="sm"
              className="transition-all duration-200 hover:scale-105"
              asChild
            >
              <Link to={item.path}>
                <item.icon className="mr-1.5 h-3.5 w-3.5" /> {item.label}
              </Link>
            </Button>
          ))}

          {isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              className="transition-all duration-200 hover:scale-105"
              onClick={logout}
            >
              <LogOut className="mr-1.5 h-3.5 w-3.5" /> Logout
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="ml-1 h-8 w-8 transition-all duration-200 hover:scale-105"
            onClick={toggle}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 sm:hidden">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 border-border"
            onClick={toggle}
          >
            {theme === "dark" ? <Sun className="h-4 w-4 text-foreground" /> : <Moon className="h-4 w-4 text-foreground" />}
          </Button>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5 transition-transform duration-200" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-2">
                {NAV_ITEMS.map((item, i) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    className="animate-slide-up justify-start opacity-0"
                    style={{ animationDelay: `${i * 0.1}s` }}
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to={item.path}>
                      <item.icon className="mr-2 h-4 w-4" /> {item.label}
                    </Link>
                  </Button>
                ))}

                <div className="my-2 border-t border-border" />

                {SIDEBAR_EXTRA_ITEMS.map((item, i) => (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "secondary" : "ghost"}
                    className="animate-slide-up justify-start opacity-0"
                    style={{ animationDelay: `${(NAV_ITEMS.length + i) * 0.1}s` }}
                    asChild
                    onClick={() => setOpen(false)}
                  >
                    <Link to={item.path}>
                      <item.icon className="mr-2 h-4 w-4" /> {item.label}
                    </Link>
                  </Button>
                ))}

                {isAdmin && (
                  <>
                    <div className="my-2 border-t border-border" />
                    <Button
                      variant="ghost"
                      className="animate-slide-up justify-start opacity-0"
                      style={{ animationDelay: `${(NAV_ITEMS.length + SIDEBAR_EXTRA_ITEMS.length) * 0.1}s` }}
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
