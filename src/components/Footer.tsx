import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="animate-fade-in border-t border-border bg-card py-5 sm:py-8">
    <div className="container mx-auto px-3 text-center text-xs text-muted-foreground sm:px-4 sm:text-sm">
      <div className="flex justify-center mb-6">
        <img 
          src="/logo.png" 
          alt="RentMilega Logo" 
          className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-all mix-blend-multiply dark:brightness-0 dark:invert dark:mix-blend-normal sm:h-48" 
        />
      </div>
      <p className="text-sm font-semibold text-foreground sm:text-base">RentMilega</p>
      <p className="mt-1">India's simple rental listing platform</p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <Link to="/help" className="text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm">
          Help
        </Link>
        <span className="text-border">•</span>
        <Link to="/about" className="text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm">
          About Us
        </Link>
        <span className="text-border">•</span>
        <Link to="/contact" className="text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm">
          Contact Us
        </Link>
        <span className="text-border">•</span>
        <Link to="/terms" className="text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm">
          Terms
        </Link>
        <span className="text-border">•</span>
        <Link to="/privacy" className="text-xs font-medium text-primary transition-colors hover:text-primary/80 sm:text-sm">
          Privacy
        </Link>
      </div>
      <p className="mt-2 sm:mt-3">
        © {new Date().getFullYear()} <span className="font-bold">RentMilega</span>. All Rights Reserved.
      </p>
      
      <div className="mt-8 pt-8 border-t border-border/50">
        <p className="text-sm font-bold text-foreground mb-4">Popular Rental Searches</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] sm:text-xs">
          <Link to="/rentals?q=House for rent in Silchar" className="hover:text-primary transition-colors">House for rent in Silchar</Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link to="/rentals?q=PG in Guwahati" className="hover:text-primary transition-colors">PG in Guwahati</Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link to="/rentals?q=Room for rent in Assam" className="hover:text-primary transition-colors">Room for rent in Assam</Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link to="/rentals?q=Flats for rent in Guwahati" className="hover:text-primary transition-colors">Flats for rent in Guwahati</Link>
          <span className="text-border hidden sm:inline">•</span>
          <Link to="/rentals?q=Rental listings in Silchar Assam" className="hover:text-primary transition-colors">Rental listings in Silchar Assam</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
