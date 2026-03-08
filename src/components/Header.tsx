import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, PlusCircle, Moon, Sun, Menu, MoreVertical, HelpCircle, Info, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: Home },
  { path: "/rentals", label: "Find Rentals", icon: Search },
  { path: "/post", label: "Post Property", icon: PlusCircle },
];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path: string) => location.pathname === path;
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 animate-fade-in border-b border-border bg-card/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform duration-300 group-hover:scale-110">
            <Home className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">
            Rent<span className="text-primary">Miliga</span>
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

          <Button
            variant="ghost"
            size="sm"
            className="transition-all duration-200 hover:scale-105"
            asChild
          >
            <Link to="/help">
              <HelpCircle className="mr-1.5 h-3.5 w-3.5" /> Help
            </Link>
          </Button>

          {/* Three-dot menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/about")} className="cursor-pointer gap-2">
                <Info className="h-4 w-4" /> About Us
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/contact")} className="cursor-pointer gap-2">
                <Mail className="h-4 w-4" /> Contact Us
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggle} className="cursor-pointer gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* Mobile nav */}
        <div className="flex items-center gap-1 sm:hidden">
          {/* Three-dot menu (mobile) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => navigate("/about")} className="cursor-pointer gap-2">
                <Info className="h-4 w-4" /> About Us
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/contact")} className="cursor-pointer gap-2">
                <Mail className="h-4 w-4" /> Contact Us
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggle} className="cursor-pointer gap-2">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5 transition-transform duration-200" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64 pt-10">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <nav className="flex flex-col gap-2">
                {[
                  ...NAV_ITEMS,
                  { path: "/help", label: "Help", icon: HelpCircle },
                  { path: "/about", label: "About Us", icon: Info },
                  { path: "/contact", label: "Contact Us", icon: Mail },
                ].map((item, i) => (
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
