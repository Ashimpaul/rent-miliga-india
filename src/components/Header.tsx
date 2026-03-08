import { Link } from "react-router-dom";
import { Home, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md">
    <div className="container mx-auto flex h-16 items-center justify-between px-4">
      <Link to="/" className="text-xl font-bold text-primary">
        RentMiliga
      </Link>
      <nav className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/"><Home className="mr-1 h-4 w-4" /> Home</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/post"><PlusCircle className="mr-1 h-4 w-4" /> Post Listing</Link>
        </Button>
      </nav>
    </div>
  </header>
);

export default Header;
