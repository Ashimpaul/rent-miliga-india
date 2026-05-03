import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase, type Listing } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Phone, MapPin, IndianRupee, ArrowLeft, ArrowRight, Loader2, Pencil, Trash2, Lock, Eye, EyeOff, MessageCircle, Share2, Crown } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { PROPERTY_TYPES, INDIAN_STATES, COUNTRIES } from "@/lib/constants";
import WatermarkedImage from "@/components/WatermarkedImage";

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  const [passwordDialog, setPasswordDialog] = useState<"edit" | "delete" | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "", property_type: "", rent: "", description: "",
    state: "", city: "", area: "", address: "", pincode: "",
    owner_name: "", phone_number: "", google_map_link: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    supabase.from("listings").select("*").eq("id", id).single()
      .then(({ data }) => { setListing(data as any); setLoading(false); });
  }, [id]);

  const startEditing = () => {
    setEditForm({
      title: listing?.title || "", property_type: listing?.property_type || "",
      rent: String(listing?.rent || ""), description: listing?.description || "",
      state: listing?.state || "", city: listing?.city || "",
      area: listing?.area || "", address: listing?.address || "",
      pincode: listing?.pincode || "", owner_name: listing?.owner_name || "",
      phone_number: listing?.phone_number || "", google_map_link: listing?.google_map_link || "",
    });
    setEditing(true);
  };

  const currencySymbol = "₹";

  const verifyPassword = async (action: "edit" | "delete") => {
    if (!id || !password) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.rpc("verify_listing_password", {
        listing_id: id, input_password: password,
      });
      if (error) throw error;
      if (!data) { toast.error("Incorrect password"); return; }
      setPasswordDialog(null);
      setPassword("");
      if (action === "edit") {
        startEditing();
      } else {
        await handleDelete();
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error("Failed to delete listing"); return; }
    toast.success("Listing deleted successfully");
    navigate("/");
  };

  const handleShare = async () => {
    if (!listing) return;
    const url = window.location.href;
    const shareData: any = {
      title: `${listing.title} | RentMilega`,
      text: `Check out this ${listing.property_type} for rent in ${listing.area}, ${listing.city}. Monthly Rent: ₹${Number(listing.rent).toLocaleString("en-IN")}.`,
      url: url,
    };

    try {
      // Check if we can share files
      if (listing.image1 && navigator.canShare && (navigator as any).canShare({ files: [new File([], "test.jpg", { type: "image/jpeg" })] })) {
        try {
          const response = await fetch(listing.image1, { mode: 'cors', cache: 'no-cache' });
          const blob = await response.blob();
          const file = new File([blob], `${listing.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`, { type: "image/jpeg" });
          
          if ((navigator as any).canShare({ files: [file] })) {
            // Some browsers prefer only files or only text/url. 
            // We'll try to provide everything but prioritize the file for better preview.
            await navigator.share({
              ...shareData,
              files: [file]
            });
            return; // Success
          }
        } catch (fileErr) {
          console.error("Error preparing image for share:", fileErr);
          // Fall back to standard share below
        }
      }

      // Standard share fallback (no files)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      // Only show error if it's not a user cancellation
      if ((err as Error).name !== 'AbortError') {
        console.error("Error sharing:", err);
        // Final fallback: copy to clipboard
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    if (!editForm.title || !editForm.property_type || !editForm.rent || !editForm.state || !editForm.city || !editForm.area || !editForm.owner_name || !editForm.phone_number) {
      toast.error("Please fill all required fields"); return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("listings").update({
        title: editForm.title, property_type: editForm.property_type,
        rent: Number(editForm.rent), description: editForm.description || null,
        state: editForm.state, city: editForm.city, area: editForm.area,
        address: editForm.address || null, pincode: editForm.pincode || null,
        owner_name: editForm.owner_name, phone_number: editForm.phone_number,
        google_map_link: editForm.google_map_link || null,
      }).eq("id", id);
      if (error) throw error;
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      setListing(data as any);
      setEditing(false);
      toast.success("Listing updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const setEdit = (key: string, value: string) => setEditForm((f) => ({ ...f, [key]: value }));

  const statesList = INDIAN_STATES;

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

  const images = [
    listing.image1, listing.image2, listing.image3, listing.image4, listing.image5,
    listing.image6, listing.image7, listing.image8, listing.image9, listing.image10
  ].filter(Boolean) as string[];

  // Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": `${listing.title} in ${listing.area}, ${listing.city}`,
    "description": listing.description || `Rental property in ${listing.area}, ${listing.city}, ${listing.state}`,
    "datePosted": listing.created_at,
    "propertyID": listing.id,
    "url": `https://rentmilega.in/listing/${listing.id}`,
    "image": images,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": listing.city,
      "addressRegion": listing.state,
      "addressCountry": "India",
      "streetAddress": listing.address || listing.area
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet>
        <title>{listing.title} for Rent in {listing.city}, {listing.state} | RentMilega</title>
        <meta name="description" content={`${listing.title} for rent in ${listing.area}, ${listing.city}, ${listing.state}. Rent: ₹${Number(listing.rent).toLocaleString("en-IN")}/mo. ${listing.description?.substring(0, 150)}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content={`${listing.title} for Rent in ${listing.city} | RentMilega`} />
        <meta property="og:description" content={`Check out this ${listing.property_type} for rent in ${listing.area}, ${listing.city}. Monthly Rent: ₹${Number(listing.rent).toLocaleString("en-IN")}.`} />
        <meta property="og:image" content={listing.image1 || "https://rentmilega.in/logo.png"} />
        <meta property="og:image:secure_url" content={listing.image1 || "https://rentmilega.in/logo.png"} />
        <meta property="og:image:type" content="image/jpeg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="RentMilega" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={`${listing.title} for Rent in ${listing.city} | RentMilega`} />
        <meta name="twitter:description" content={`Check out this ${listing.property_type} for rent in ${listing.area}, ${listing.city}. Monthly Rent: ₹${Number(listing.rent).toLocaleString("en-IN")}.`} />
        <meta name="twitter:image" content={listing.image1 || "https://rentmilega.in/logo.png"} />
        <meta name="twitter:image:alt" content={listing.title} />

        {/* Schema.org for Google+ / Pinterest */}
        <meta itemprop="name" content={listing.title} />
        <meta itemprop="description" content={listing.description || ""} />
        <meta itemprop="image" content={listing.image1 || "https://rentmilega.in/logo.png"} />

        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      </Helmet>
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-3 py-4 sm:px-4 sm:py-6">
          <div className="animate-fade-up mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="group inline-flex items-center text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground sm:text-sm">
              <ArrowLeft className="mr-1 h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-1 sm:h-4 sm:w-4" /> Back to listings
            </Link>
            {!editing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs sm:flex-none sm:text-sm bg-primary/5 border-primary/20 hover:bg-primary/10"
                  onClick={handleShare}
                >
                  <Share2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5 text-primary" /> Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs sm:flex-none sm:text-sm"
                  onClick={() => isAdmin ? startEditing() : setPasswordDialog("edit")}
                >
                  <Pencil className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 text-xs sm:flex-none sm:text-sm"
                  onClick={() => isAdmin ? handleDelete() : setPasswordDialog("delete")}
                >
                  <Trash2 className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-4 sm:space-y-6">
              <h2 className="text-lg font-bold text-foreground sm:text-xl">Edit Listing</h2>

              <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
                <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Property Information</legend>
                <div>
                  <Label htmlFor="edit-title" className="text-xs sm:text-sm">Title *</Label>
                  <Input id="edit-title" value={editForm.title} onChange={(e) => setEdit("title", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label className="text-xs sm:text-sm">Property Type *</Label>
                  <Select value={editForm.property_type} onValueChange={(v) => setEdit("property_type", v)}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-rent" className="text-xs sm:text-sm">Monthly Rent ({currencySymbol}) *</Label>
                  <Input id="edit-rent" type="number" value={editForm.rent} onChange={(e) => setEdit("rent", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="edit-desc" className="text-xs sm:text-sm">Description</Label>
                  <Textarea id="edit-desc" value={editForm.description} onChange={(e) => setEdit("description", e.target.value)} rows={3} className="text-sm" />
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
                <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Location</legend>
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="edit-state" className="text-xs sm:text-sm">State *</Label>
                    <Select value={editForm.state} onValueChange={(v) => setEdit("state", v)}>
                      <SelectTrigger id="edit-state" className="text-sm">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <Label htmlFor="edit-city" className="text-xs sm:text-sm">City *</Label>
                    <Input id="edit-city" value={editForm.city} onChange={(e) => setEdit("city", e.target.value)} className="text-sm" />
                  </div>
                  <div>
                    <Label htmlFor="edit-area" className="text-xs sm:text-sm">Area / Locality *</Label>
                    <Input id="edit-area" value={editForm.area} onChange={(e) => setEdit("area", e.target.value)} className="text-sm" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-address" className="text-xs sm:text-sm">Address</Label>
                  <Input id="edit-address" value={editForm.address} onChange={(e) => setEdit("address", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="edit-pincode" className="text-xs sm:text-sm">Pincode</Label>
                  <Input id="edit-pincode" value={editForm.pincode} onChange={(e) => setEdit("pincode", e.target.value)} maxLength={6} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="edit-map" className="text-xs sm:text-sm">Google Maps Link</Label>
                  <Input id="edit-map" value={editForm.google_map_link} onChange={(e) => setEdit("google_map_link", e.target.value)} className="text-sm" />
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
                <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Contact Information</legend>
                <div>
                  <Label htmlFor="edit-owner" className="text-xs sm:text-sm">Owner Name *</Label>
                  <Input id="edit-owner" value={editForm.owner_name} onChange={(e) => setEdit("owner_name", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="edit-phone" className="text-xs sm:text-sm">Phone Number *</Label>
                  <Input id="edit-phone" type="tel" value={editForm.phone_number} onChange={(e) => setEdit("phone_number", e.target.value)} className="text-sm" />
                </div>
              </fieldset>

              <div className="flex gap-2 sm:gap-3">
                <Button className="flex-1" onClick={handleSaveEdit} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Image Gallery - Improved Mobile Experience */}
              <div className="animate-fade-up overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:rounded-3xl">
                <div className="relative aspect-square sm:aspect-video w-full overflow-hidden bg-muted">
                  {images.length > 0 ? (
                    <WatermarkedImage
                      src={images[activeImage]}
                      alt={listing.title}
                      imageClassName="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      No images available
                    </div>
                  )}
                  
                  {images.length > 1 && (
                    <>
                      <div className="absolute inset-y-0 left-2 flex items-center sm:left-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 sm:h-12 sm:w-12"
                          onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                        >
                          <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Button>
                      </div>
                      <div className="absolute inset-y-0 right-2 flex items-center sm:right-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 sm:h-12 sm:w-12"
                          onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                        >
                          <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
                        </Button>
                      </div>
                      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-6 sm:gap-2">
                        {images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveImage(i)}
                            className={`h-1.5 rounded-full transition-all duration-300 sm:h-2 ${
                              i === activeImage ? "bg-white w-6 sm:w-8 shadow-md" : "bg-white/40 w-1.5 sm:w-2"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-3 no-scrollbar sm:gap-4 sm:p-4">
                    {images.map((img, i) => (
                      <button
                        key={img}
                        onClick={() => setActiveImage(i)}
                        className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 sm:h-24 sm:w-24 sm:rounded-xl ${
                          i === activeImage ? "border-primary scale-105 shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <WatermarkedImage src={img} alt="" imageClassName="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Details - Improved Mobile Typography */}
              <div className="mt-6 animate-fade-up sm:mt-10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary sm:px-4 sm:text-sm">
                    {listing.property_type}
                  </span>
                  {(listing as any).is_premium && (
                    <span className="flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md sm:px-4 sm:text-sm">
                      <Crown className="h-3.5 w-3.5" /> Featured
                    </span>
                  )}
                </div>

                <h1 className="mt-4 text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl leading-tight">
                  {listing.title}
                </h1>

                <div className="mt-4 flex items-center gap-2 text-3xl font-black text-primary sm:mt-6 sm:text-5xl">
                  <span className="text-xl sm:text-3xl font-bold">{currencySymbol}</span>
                  {Number(listing.rent).toLocaleString("en-IN")}
                  <span className="text-sm sm:text-lg font-normal text-muted-foreground ml-2">/ month</span>
                </div>

                <div className="mt-4 flex items-center gap-2 text-base text-muted-foreground sm:mt-6 sm:text-xl">
                  <MapPin className="h-5 w-5 text-primary sm:h-6 sm:w-6" />
                  {listing.area}, {listing.city}, {listing.state}
                </div>

                {listing.description && (
                  <div className="mt-8 animate-fade-up sm:mt-12">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">Description</h2>
                    <p className="mt-3 text-base leading-relaxed text-foreground/80 sm:mt-4 sm:text-lg">{listing.description}</p>
                  </div>
                )}

                {/* Location */}
                <div className="mt-4 animate-fade-up rounded-lg border border-border p-3 opacity-0 stagger-1 transition-all duration-300 hover:shadow-md sm:mt-6 sm:p-4">
                  <h2 className="mb-2 flex items-center gap-1 text-sm font-semibold text-foreground sm:text-base">
                    <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Location
                  </h2>
                  <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2 sm:gap-2 sm:text-sm">
                    <div><span className="text-muted-foreground">Country:</span> India</div>
                    <div><span className="text-muted-foreground">State:</span> {listing.state}</div>
                    <div><span className="text-muted-foreground">City:</span> {listing.city}</div>
                    <div><span className="text-muted-foreground">Area:</span> {listing.area}</div>
                    {listing.pincode && <div><span className="text-muted-foreground">Pincode:</span> {listing.pincode}</div>}
                  </div>
                  {listing.address && (
                    <p className="mt-1.5 text-xs sm:mt-2 sm:text-sm"><span className="text-muted-foreground">Address:</span> {listing.address}</p>
                  )}
                  {listing.google_map_link && (
                    <a
                      href={listing.google_map_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2.5 inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground active:bg-primary/80 hover:bg-primary/90 sm:mt-3 sm:text-sm"
                    >
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> View on Google Maps
                    </a>
                  )}
                </div>

                {/* Contact */}
                <div className="mt-3 animate-fade-up rounded-lg border border-border p-3 opacity-0 stagger-2 transition-all duration-300 hover:shadow-md sm:mt-4 sm:p-4">
                  <h2 className="mb-2 text-sm font-semibold text-foreground sm:text-base">Contact Information</h2>
                  <div className="flex flex-col gap-1 sm:gap-1.5">
                    <p className="text-xs font-medium sm:text-sm">{listing.owner_name}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">{listing.phone_number}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
                    <Button 
                      className="flex-1 transition-all duration-300 active:scale-95 hover:shadow-md h-11" 
                      asChild
                    >
                      <a href={`tel:${listing.phone_number.replace(/\s+/g, '')}`}>
                        <Phone className="mr-2 h-4 w-4" /> Call Owner
                      </a>
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1 border-[#25D366] text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all duration-300 active:scale-95 hover:shadow-md h-11" 
                      asChild
                    >
                      <a 
                        href={`https://wa.me/${listing.phone_number.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${listing.title} on RentMilega.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Password Verification Dialog */}
      <Dialog open={passwordDialog !== null} onOpenChange={() => { setPasswordDialog(null); setPassword(""); setShowPassword(false); }}>
        <DialogContent className="mx-auto max-w-[calc(100vw-2rem)] rounded-lg sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              {passwordDialog === "delete" ? "Delete Listing" : "Edit Listing"}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Enter the password you set when posting this listing to {passwordDialog === "delete" ? "delete" : "edit"} it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-1 sm:py-2">
            <Label htmlFor="verify-password" className="text-xs sm:text-sm">Listing Password</Label>
            <div className="relative">
              <Input
                id="verify-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your listing password"
                className="pr-10 text-sm"
                onKeyDown={(e) => e.key === "Enter" && verifyPassword(passwordDialog!)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <Button variant="outline" size="sm" className="flex-1 sm:flex-none" onClick={() => { setPasswordDialog(null); setPassword(""); }}>
              Cancel
            </Button>
            <Button
              variant={passwordDialog === "delete" ? "destructive" : "default"}
              size="sm"
              className="flex-1 sm:flex-none"
              onClick={() => verifyPassword(passwordDialog!)}
              disabled={!password || verifying}
            >
              {verifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {passwordDialog === "delete" ? "Delete" : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ListingDetail;
