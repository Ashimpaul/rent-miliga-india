import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="animate-fade-in border-t border-border bg-card py-8 sm:py-12">
    <div className="container mx-auto px-4 text-center text-xs text-muted-foreground sm:text-sm">
      <div className="flex justify-center mb-6">
        <img 
          src="/logo.png" 
          alt="RentMilega Logo" 
          className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition-all mix-blend-multiply dark:brightness-0 dark:invert dark:mix-blend-normal sm:h-40" 
        />
      </div>
      <p className="text-base font-bold text-foreground sm:text-lg">RentMilega</p>
      <p className="mt-1 text-sm">India's simple rental listing platform</p>
      
      <div className="mt-6 flex flex-col items-center gap-2 text-xs sm:text-sm">
        <p>Email: <a href="mailto:rentmilega@gmail.com" className="text-primary hover:underline font-medium">rentmilega@gmail.com</a></p>
        <p>Phone: <a href="tel:9612963394" className="text-primary hover:underline font-medium">+91 96129 63394</a></p>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 px-4">
        <Link to="/help" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          Help
        </Link>
        <span className="text-border hidden sm:inline">•</span>
        <Link to="/about" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          About Us
        </Link>
        <span className="text-border hidden sm:inline">•</span>
        <Link to="/blogs" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          Blog
        </Link>
        <span className="text-border hidden sm:inline">•</span>
        <Link to="/contact" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          Contact
        </Link>
        <span className="text-border hidden sm:inline">•</span>
        <Link to="/privacy" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
          Privacy
        </Link>
        <span className="text-border hidden sm:inline">•</span>
        <Link to="/blogs" className="text-sm font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg transition-colors hover:bg-primary/10">
          Latest Blog
        </Link>
      </div>
      <p className="mt-6 text-[10px] sm:text-xs">
        © {new Date().getFullYear()} <span className="font-bold text-foreground">RentMilega</span>. All Rights Reserved.
      </p>
      
      <div className="mt-10 pt-8 border-t border-border/50">
        <p className="text-sm font-bold text-foreground mb-4">Popular Rental Searches</p>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] sm:text-xs px-2">
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
