import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="animate-fade-in border-t border-border bg-card py-5 sm:py-8">
    <div className="container mx-auto px-3 text-center text-xs text-muted-foreground sm:px-4 sm:text-sm">
      <p className="text-sm font-semibold text-foreground sm:text-base">RentMiliga</p>
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
      </div>
      <p className="mt-2 sm:mt-3">© {new Date().getFullYear()} RentMiliga. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
