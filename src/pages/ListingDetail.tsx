import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase, type Listing } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Phone, MapPin, IndianRupee, ArrowLeft, Loader2 } from "lucide-react";

const ListingDetail = () => {
  const { id } = useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("listings")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data }) => {
        setListing(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-muted-foreground">Listing not found</p>
          <Button asChild><Link to="/">Go Home</Link></Button>
        </div>
      </div>
    );
  }

  const images = [listing.image1, listing.image2, listing.image3].filter(Boolean) as string[];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-6">
          <Link to="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to listings
          </Link>

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className="overflow-hidden rounded-lg">
              <img
                src={images[activeImage]}
                alt={listing.title}
                className="aspect-video w-full object-cover"
              />
              {images.length > 1 && (
                <div className="mt-2 flex gap-2">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-16 w-20 overflow-hidden rounded-md border-2 ${
                        i === activeImage ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-foreground">{listing.title}</h1>
            <div className="mt-2 flex items-center gap-1 text-2xl font-bold text-primary">
              <IndianRupee className="h-5 w-5" />
              {listing.rent.toLocaleString("en-IN")}/mo
            </div>
            <p className="mt-1 text-sm capitalize text-muted-foreground">{listing.property_type}</p>

            {listing.description && (
              <p className="mt-4 text-foreground">{listing.description}</p>
            )}

            {/* Location */}
            <div className="mt-6 rounded-lg border border-border p-4">
              <h2 className="mb-2 font-semibold text-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" /> Location
              </h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">State:</span> {listing.state}</div>
                <div><span className="text-muted-foreground">City:</span> {listing.city}</div>
                <div><span className="text-muted-foreground">Area:</span> {listing.area}</div>
                {listing.pincode && <div><span className="text-muted-foreground">Pincode:</span> {listing.pincode}</div>}
              </div>
              {listing.address && (
                <p className="mt-2 text-sm"><span className="text-muted-foreground">Address:</span> {listing.address}</p>
              )}
              {(listing as any).google_map_link && (
                <a
                  href={(listing as any).google_map_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <MapPin className="h-4 w-4" /> View on Google Maps
                </a>
              )}
            </div>

            {/* Contact */}
            <div className="mt-4 rounded-lg border border-border p-4">
              <h2 className="mb-2 font-semibold text-foreground">Contact</h2>
              <p className="text-sm">{listing.owner_name}</p>
              <p className="text-sm text-muted-foreground">{listing.phone_number}</p>
              <Button className="mt-3 w-full" size="lg" asChild>
                <a href={`tel:${listing.phone_number}`}>
                  <Phone className="mr-2 h-4 w-4" /> Call Owner
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ListingDetail;
