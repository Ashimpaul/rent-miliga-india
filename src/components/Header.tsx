import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, Moon, Sun, Menu, LogOut, Info, PhoneCall, HelpCircle, Plus, MapPin, ChevronDown, Heart, Globe, BookOpen, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useAuth } from "../contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_ITEMS = [
  { path: "/home", label: "Home", icon: Home },
  { path: "/", label: "Find Rentals", icon: Search },
  { path: "/blogs", label: "Blog", icon: BookOpen },
  { path: "/post", label: "Post Property", icon: PlusCircle },
];

const SIDEBAR_EXTRA_ITEMS = [
  { path: "/about", label: "About Us", icon: Info },
  { path: "/blogs", label: "Blog", icon: BookOpen },
  { path: "/contact", label: "Contact Us", icon: PhoneCall },
  { path: "/help", label: "Help & FAQ", icon: HelpCircle },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const { isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 animate-fade-in border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto px-4 py-2 sm:py-0">
        <div className="flex min-h-[40px] items-center justify-between sm:min-h-[65px]">
          {/* Mobile: Left Hamburger */}
          <div className="flex items-center gap-2 sm:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 pt-10">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item, i) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "default" : "ghost"}
                      className="justify-start"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to={item.path}>
                        <item.icon className="mr-2 h-4 w-4" /> {item.label}
                      </Link>
                    </Button>
                  ))}
                  {isAdmin && (
                    <Button
                      variant={isActive("/admin") ? "default" : "ghost"}
                      className="justify-start text-primary font-bold"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to="/admin">
                        <ShieldCheck className="mr-2 h-4 w-4" /> Admin Dashboard
                      </Link>
                    </Button>
                  )}
                  <div className="my-2 border-t border-border" />
                  {SIDEBAR_EXTRA_ITEMS.map((item) => (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? "secondary" : "ghost"}
                      className="justify-start"
                      asChild
                      onClick={() => setOpen(false)}
                    >
                      <Link to={item.path}>
                        <item.icon className="mr-2 h-4 w-4" /> {item.label}
                      </Link>
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            
            <Link to="/" className="flex items-center shrink-0">
              <img 
                src="/logo.png" 
                alt="RentMilega" 
                className="h-10 w-auto object-contain mix-blend-multiply dark:brightness-0 dark:invert dark:mix-blend-normal sm:h-24" 
              />
            </Link>
          </div>

          {/* Desktop Logo */}
          <div className="hidden items-center sm:flex">
            <Link to="/" className="group flex items-center">
              <img 
                src="/logo.png" 
                alt="RentMilega Logo" 
                className="h-20 w-auto object-contain transition-transform duration-300 group-hover:scale-105 sm:h-24 mix-blend-multiply dark:brightness-0 dark:invert dark:mix-blend-normal" 
              />
            </Link>
            
            <div className="ml-6 hidden lg:block">
              <Button variant="outline" size="sm" className="h-9 gap-2 border-primary/20 hover:border-primary/50 transition-colors cursor-default">
                <Globe className="h-4 w-4 text-primary" />
                <span className="font-semibold">India</span>
              </Button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                className="transition-all duration-200"
                asChild
              >
                <Link to={item.path}>
                  <item.icon className="mr-1.5 h-3.5 w-3.5" /> {item.label}
                </Link>
              </Button>
            ))}
            {isAdmin && (
              <Button
                variant={isActive("/admin") ? "secondary" : "ghost"}
                size="sm"
                className="transition-all duration-200 text-primary font-bold"
                asChild
              >
                <Link to="/admin">
                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" /> Admin
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="ml-2 bg-primary text-white font-bold"
              asChild
            >
              <Link to="/post">
                <Plus className="mr-1.5 h-4 w-4" /> Post Your Property
              </Link>
            </Button>
          </nav>

          {/* Mobile: Right Actions (Location & Theme) */}
          <div className="flex items-center gap-1 sm:hidden">
            <div className="flex items-center gap-1 px-2 h-8 text-[11px] font-semibold text-muted-foreground border border-border rounded-md">
              <MapPin className="h-3 w-3 text-primary" />
              <span>India</span>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile: Second row search (OLX Style) */}
        <div className="mt-2 sm:hidden pb-1">
          <Link to="/rentals" className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 h-10 text-muted-foreground transition-all active:scale-95">
            <Search className="h-4 w-4" />
            <span className="text-sm">For Rent: Houses & PGs in India...</span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
