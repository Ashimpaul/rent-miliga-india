const Footer = () => (
  <footer className="animate-fade-in border-t border-border bg-card py-5 sm:py-8">
    <div className="container mx-auto px-3 text-center text-xs text-muted-foreground sm:px-4 sm:text-sm">
      <p className="text-sm font-semibold text-foreground sm:text-base">RentMiliga</p>
      <p className="mt-1">India's simple rental listing platform</p>
      <p className="mt-1.5 sm:mt-2">© {new Date().getFullYear()} RentMiliga. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
