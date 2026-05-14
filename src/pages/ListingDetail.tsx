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
import { 
  Phone, MapPin, IndianRupee, ArrowLeft, ArrowRight, Loader2, 
  Pencil, Trash2, Lock, Eye, EyeOff, MessageCircle, Share2, 
  Crown, MoreVertical, Calendar, Info, Building2, User2, 
  Navigation, CheckCircle2, ImagePlus, X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
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
    password: "", user_type: "owner" as "owner" | "agent",
  });
  const [editImages, setEditImages] = useState<(string | File)[]>([]);
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
      password: listing?.password || "", user_type: listing?.user_type || "owner",
    });
    
    const currentImages = [
      listing?.image1, listing?.image2, listing?.image3, listing?.image4, listing?.image5,
      listing?.image6, listing?.image7, listing?.image8, listing?.image9, listing?.image10
    ].filter(Boolean) as string[];
    setEditImages(currentImages);
    
    setEditing(true);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleEditImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 10;
    
    if (editImages.length + files.length > maxImages) {
      toast.error(`You can only have up to ${maxImages} images`);
      return;
    }

    setEditImages(prev => [...prev, ...files]);
  };

  const removeEditImage = (index: number) => {
    setEditImages(prev => prev.filter((_, i) => i !== index));
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
    const url = `https://rentmilega.in/listing/${listing.id}`;
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
    if (editImages.length === 0) {
      toast.error("Please have at least 1 image"); return;
    }

    setSaving(true);
    try {
      // Handle images
      const imageUrls: string[] = [];
      for (const item of editImages) {
        if (typeof item === "string") {
          imageUrls.push(item);
        } else {
          const url = await uploadImage(item);
          imageUrls.push(url);
        }
      }

      const updateData: any = {
        title: editForm.title, property_type: editForm.property_type,
        rent: Number(editForm.rent), description: editForm.description || null,
        state: editForm.state, city: editForm.city, area: editForm.area,
        address: editForm.address || null, pincode: editForm.pincode || null,
        owner_name: editForm.owner_name, phone_number: editForm.phone_number,
        password: editForm.password,
        image1: imageUrls[0] || null,
        image2: imageUrls[1] || null,
        image3: imageUrls[2] || null,
      };

      // Only add extra images if they exist in the schema
      // Note: This is a safety measure. If columns don't exist, Supabase will return an error
      // unless we explicitly check or the user updates the schema.
      if (imageUrls.length > 3) {
        updateData.image4 = imageUrls[3] || null;
        updateData.image5 = imageUrls[4] || null;
        updateData.image6 = imageUrls[5] || null;
        updateData.image7 = imageUrls[6] || null;
        updateData.image8 = imageUrls[7] || null;
        updateData.image9 = imageUrls[8] || null;
        updateData.image10 = imageUrls[9] || null;
      }

      const { error } = await supabase.from("listings").update(updateData).eq("id", id);
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
      <main className="flex-1 bg-muted/30">
        <div className="container mx-auto max-w-4xl px-3 py-4 sm:px-4 sm:py-8">
          <div className="animate-fade-up mb-4 flex items-center justify-between">
            <Link to="/" className="group inline-flex items-center text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" /> Back to listings
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-background border-border shadow-sm hover:bg-muted"
                onClick={handleShare}
              >
                <Share2 className="mr-2 h-4 w-4 text-primary" /> Share
              </Button>

              {!editing && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="rounded-full bg-background border-border shadow-sm">
                      <MoreVertical className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40 rounded-xl">
                    <DropdownMenuItem 
                      onClick={() => isAdmin ? startEditing() : setPasswordDialog("edit")}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-2 h-4 w-4" /> Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => isAdmin ? handleDelete() : setPasswordDialog("delete")}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
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
                <div>
                  <Label className="text-xs sm:text-sm">Posting As *</Label>
                  <Select value={editForm.user_type} onValueChange={(v) => setEdit("user_type", v as "owner" | "agent")}>
                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner" className="capitalize">Property Owner</SelectItem>
                      <SelectItem value="agent" className="capitalize">Real Estate Agent / Broker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
                <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Security</legend>
                <div>
                  <Label htmlFor="edit-password" className="text-xs sm:text-sm">Listing Password *</Label>
                  <div className="relative">
                    <Input 
                      id="edit-password" 
                      type={showPassword ? "text" : "password"} 
                      value={editForm.password} 
                      onChange={(e) => setEdit("password", e.target.value)} 
                      className="text-sm pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">Change this password if you want to update how you access this listing later.</p>
                </div>
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
                <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Property Photos</legend>
                <div className="space-y-4">
                  <div className="relative group cursor-pointer">
                    <input 
                      id="edit-images" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleEditImages} 
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-muted rounded-xl group-hover:border-primary group-hover:bg-primary/5 transition-all">
                      <ImagePlus className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary" />
                      <p className="text-xs font-medium text-muted-foreground group-hover:text-primary">Click to add more photos</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Up to 10 photos total</p>
                    </div>
                  </div>
                  
                  {editImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {editImages.map((item, i) => (
                        <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border-2 border-muted hover:border-primary transition-all">
                          <img 
                            src={typeof item === "string" ? item : URL.createObjectURL(item)} 
                            alt="Preview" 
                            className="h-full w-full object-cover" 
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(i)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
              {/* Image Gallery - Enhanced Visuals */}
              <Card className="animate-fade-up overflow-hidden border-none shadow-xl sm:rounded-3xl bg-background">
                <CardContent className="p-0">
                  <div className="relative aspect-square sm:aspect-video w-full overflow-hidden bg-muted">
                    {images.length > 0 ? (
                      <WatermarkedImage
                        src={images[activeImage]}
                        alt={listing.title}
                        imageClassName="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <Building2 className="h-12 w-12 opacity-20" />
                      </div>
                    )}
                    
                    {images.length > 1 && (
                      <>
                        <div className="absolute inset-y-0 left-4 flex items-center">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background"
                            onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background"
                            onClick={() => setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                          >
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
                          {images.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveImage(i)}
                              className={`h-2 rounded-full transition-all duration-300 ${
                                i === activeImage ? "bg-primary w-8 shadow-md" : "bg-white/60 w-2 hover:bg-white"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto p-4 no-scrollbar bg-muted/20">
                      {images.map((img, i) => (
                        <button
                          key={img}
                          onClick={() => setActiveImage(i)}
                          className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                            i === activeImage ? "border-primary scale-105 shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <WatermarkedImage src={img} alt="" imageClassName="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Details - Modern Layout */}
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                  <div className="animate-fade-up space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border-none">
                        {listing.property_type}
                      </Badge>
                      {listing.user_type && (
                        <Badge className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-none shadow-sm ${
                          listing.user_type === 'owner' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-purple-500 text-white'
                        }`}>
                          {listing.user_type === 'owner' ? 'Property Owner' : 'Agent / Broker'}
                        </Badge>
                      )}
                      {(listing as any).is_premium && (
                        <Badge className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-amber-500 text-white border-none shadow-sm">
                          <Crown className="mr-1.5 h-3 w-3" /> Featured
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Posted {format(new Date(listing.created_at), "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl leading-[1.1]">
                      {listing.title}
                    </h1>

                    <div className="flex items-center gap-2 text-muted-foreground text-lg">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      <span>{listing.area}, {listing.city}</span>
                    </div>

                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black text-primary tracking-tighter">
                        ₹{Number(listing.rent).toLocaleString("en-IN")}
                      </span>
                      <span className="text-lg font-medium text-muted-foreground">/ month</span>
                    </div>
                  </div>

                  <div className="animate-fade-up">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <Info className="h-5 w-5 text-primary" /> About this property
                    </h2>
                    <Card className="border-none shadow-sm bg-background">
                      <CardContent className="p-6">
                        <p className="text-base leading-relaxed text-foreground/80 sm:text-lg whitespace-pre-wrap">
                          {listing.description || "No description provided."}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="animate-fade-up">
                    <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" /> Key Features
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <Card className="border-none shadow-sm bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                          <Building2 className="h-6 w-6 text-primary/70" />
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Type</div>
                          <div className="text-sm font-bold capitalize">{listing.property_type}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-sm bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                          <Navigation className="h-6 w-6 text-primary/70" />
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">City</div>
                          <div className="text-sm font-bold">{listing.city}</div>
                        </CardContent>
                      </Card>
                      <Card className="border-none shadow-sm bg-background hover:bg-muted/50 transition-colors">
                        <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                          <MapPin className="h-6 w-6 text-primary/70" />
                          <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Locality</div>
                          <div className="text-sm font-bold truncate w-full">{listing.area}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {listing.google_map_link && (
                    <div className="animate-fade-up">
                      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" /> Location Map
                      </h2>
                      <Card className="border-none shadow-sm overflow-hidden">
                        <div className="aspect-[21/9] bg-muted flex items-center justify-center relative group">
                          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                          <a
                            href={listing.google_map_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg transition-all hover:scale-105 active:scale-95"
                          >
                            <MapPin className="h-4 w-4" /> Open in Google Maps
                          </a>
                        </div>
                      </Card>
                      {listing.address && (
                        <p className="mt-4 text-sm text-muted-foreground px-1">
                          <span className="font-bold text-foreground">Address:</span> {listing.address}
                          {listing.pincode && `, ${listing.pincode}`}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="animate-fade-up sticky top-24">
                    <Card className="border-none shadow-xl bg-background overflow-hidden ring-1 ring-primary/5">
                      <div className="bg-primary p-6 text-primary-foreground">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                          <User2 className="h-5 w-5" /> Contact Owner
                        </h2>
                        <p className="text-sm text-primary-foreground/80 mt-1">Interested in this property?</p>
                      </div>
                      <CardContent className="p-6 space-y-6">
                        <div className="space-y-1">
                          <div className="text-[10px] uppercase font-black text-muted-foreground tracking-[0.2em]">Property Owner</div>
                          <p className="text-xl font-black text-foreground">{listing.owner_name}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <Button 
                            className="w-full h-12 text-base font-bold rounded-xl shadow-md transition-all active:scale-95" 
                            asChild
                          >
                            <a href={`tel:${listing.phone_number.replace(/\s+/g, '')}`}>
                              <Phone className="mr-2 h-5 w-5" /> Call
                            </a>
                          </Button>
                          <Button 
                            variant="outline"
                            className="w-full h-12 text-base font-bold rounded-xl border-green-500 text-green-600 hover:bg-green-500 hover:text-white transition-all active:scale-95" 
                            asChild
                          >
                            <a 
                              href={`https://wa.me/${listing.phone_number.replace(/\s+/g, '').replace(/^\+/, '')}?text=${encodeURIComponent(`Hi, I'm interested in your property: ${listing.title} on RentMilega.`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Owner
                            </a>
                          </Button>
                        </div>
                        
                        <div className="pt-4 border-t border-border">
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <span>Owner is active and responding</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="mt-6 px-4">
                      <div className="rounded-2xl bg-amber-500/10 p-4 border border-amber-500/20">
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <span className="font-bold">Safety Tip:</span> Never pay any token amount before visiting the property in person and verifying the owner.
                        </p>
                      </div>
                    </div>
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
