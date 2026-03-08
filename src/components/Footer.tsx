const Footer = () => (
  <footer className="border-t border-border bg-card py-8">
    <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
      <p className="font-semibold text-foreground">RentMiliga</p>
      <p className="mt-1">India's simple rental listing platform</p>
      <p className="mt-2">© {new Date().getFullYear()} RentMiliga. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
