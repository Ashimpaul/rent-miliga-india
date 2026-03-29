import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
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
import { toast } from "sonner";
import { Loader2, Crown, Eye, EyeOff } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROPERTY_TYPES, INDIAN_STATES, NEPAL_PROVINCES, COUNTRIES } from "@/lib/constants";
import { useCountry } from "../contexts/CountryContext";

const PostListing = () => {
  const navigate = useNavigate();
  const { country: currentCountry } = useCountry();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [premiumReason, setPremiumReason] = useState<"images" | "property_type">("images");
  const [form, setForm] = useState({
    title: "",
    property_type: "",
    rent: "",
    description: "",
    country: currentCountry,
    state: "",
    city: "",
    area: "",
    address: "",
    pincode: "",
    owner_name: "",
    phone_number: "",
    google_map_link: "",
    password: "",
  });

  const PREMIUM_TYPES = ["commercial", "apartment"];

  const set = (key: string, value: string) => {
    if (key === "property_type" && PREMIUM_TYPES.includes(value)) {
      setPremiumReason("property_type");
      setShowPremiumDialog(true);
      return;
    }
    // Reset state if country changes
    if (key === "country") {
      setForm(f => ({ ...f, country: value as "India" | "Nepal", state: "" }));
      return;
    }
    setForm((f) => ({ ...f, [key]: value }));
  };

  const statesList = form.country === "Nepal" ? NEPAL_PROVINCES : INDIAN_STATES;
  const currencySymbol = form.country === "Nepal" ? "NPR" : "₹";
  const phonePlaceholder = form.country === "Nepal" ? "+977" : "+91";

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      setPremiumReason("images");
      setShowPremiumDialog(true);
      setImages(files.slice(0, 3));
      e.target.value = "";
      return;
    }
    setImages(files);
  };

  const uploadImage = async (file: File) => {
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("listing-images").upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.property_type || !form.rent || !form.state || !form.city || !form.area || !form.owner_name || !form.phone_number || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least 1 image");
      return;
    }

    setSubmitting(true);
    try {
      const urls = await Promise.all(images.map(uploadImage));
      const { error } = await supabase.from("listings").insert({
        title: form.title,
        property_type: form.property_type,
        rent: Number(form.rent),
        description: form.description || null,
        country: form.country,
        state: form.state,
        city: form.city,
        area: form.area,
        address: form.address || null,
        pincode: form.pincode || null,
        owner_name: form.owner_name,
        phone_number: form.phone_number,
        google_map_link: form.google_map_link || null,
        password: form.password,
        image1: urls[0] || null,
        image2: urls[1] || null,
        image3: urls[2] || null,
      });
      if (error) throw error;
      toast.success("Listing posted successfully!");
      navigate("/");
    } catch (err: any) {
      toast.error(err.message || "Failed to post listing");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-3 py-5 sm:px-4 sm:py-8">
          <h1 className="animate-fade-up text-lg font-bold text-foreground sm:text-2xl">Post a Rental Listing</h1>
          <p className="animate-fade-up mt-1 text-xs text-muted-foreground opacity-0 stagger-1 sm:text-sm">Fill in the details to list your property</p>

          <form onSubmit={handleSubmit} className="mt-4 animate-fade-up space-y-4 opacity-0 stagger-2 sm:mt-6 sm:space-y-6">
            {/* Property Info */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Property Information</legend>
              <div>
                <Label htmlFor="title" className="text-xs sm:text-sm">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 2BHK near Metro" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs sm:text-sm">Property Type *</Label>
                <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                  <SelectTrigger className="text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rent" className="text-xs sm:text-sm">Monthly Rent ({currencySymbol}) *</Label>
                <Input id="rent" type="number" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder="e.g. 8000" className="text-sm" />
              </div>
              <div>
                <Label htmlFor="desc" className="text-xs sm:text-sm">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description of the property" rows={3} className="text-sm" />
              </div>
            </fieldset>

            {/* Location */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Location</legend>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="country-select" className="text-xs sm:text-sm">Country *</Label>
                  <Select value={form.country} onValueChange={(v) => set("country", v)}>
                    <SelectTrigger id="country-select" className="text-sm">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="state" className="text-xs sm:text-sm">{form.country === "Nepal" ? "Province" : "State"} *</Label>
                  <Select value={form.state} onValueChange={(v) => set("state", v)}>
                    <SelectTrigger id="state" className="text-sm">
                      <SelectValue placeholder={`Select ${form.country === "Nepal" ? "province" : "state"}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {statesList.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="city" className="text-xs sm:text-sm">City *</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} className="text-sm" />
                </div>
                <div>
                  <Label htmlFor="area" className="text-xs sm:text-sm">Area / Locality *</Label>
                  <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} className="text-sm" />
                </div>
              </div>
              <div>
                <Label htmlFor="address" className="text-xs sm:text-sm">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-xs sm:text-sm">Pincode</Label>
                <Input id="pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={6} className="text-sm" />
              </div>
              <div>
                <Label htmlFor="google_map_link" className="text-xs sm:text-sm">Google Maps Link</Label>
                <Input id="google_map_link" value={form.google_map_link} onChange={(e) => set("google_map_link", e.target.value)} placeholder="Paste Google Maps link" className="text-sm" />
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                  Open Google Maps → Find your property → Click "Share" → Copy link
                </p>
              </div>
            </fieldset>

            {/* Contact */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Contact Information</legend>
              <div>
                <Label htmlFor="owner" className="text-xs sm:text-sm">Owner Name *</Label>
                <Input id="owner" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} className="text-sm" />
              </div>
              <div>
                  <Label htmlFor="phone" className="text-xs sm:text-sm">Phone Number *</Label>
                  <Input id="phone" type="tel" value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder={`e.g. ${phonePlaceholder}9876543210`} className="text-sm" />
                </div>
            </fieldset>

            {/* Password */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Security</legend>
              <div>
                <Label htmlFor="password" className="text-xs sm:text-sm">Listing Password *</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={(e) => set("password", e.target.value)} 
                    placeholder="Set a password to edit/delete later" 
                    className="pr-10 text-sm" 
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
                <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">
                  Remember this password — you'll need it to edit or delete your listing later.
                </p>
              </div>
            </fieldset>

            {/* Images */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Images</legend>
              <div>
                <Label htmlFor="images" className="text-xs sm:text-sm">Upload Images (1-3) *</Label>
                <Input id="images" type="file" accept="image/*" multiple onChange={handleImages} className="text-sm" />
                {images.length > 0 && (
                  <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">{images.length} image(s) selected (max 3 free)</p>
                )}
              </div>
            </fieldset>

            {/* Premium Dialog */}
            <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
              <DialogContent className="mx-auto max-w-[calc(100vw-2rem)] rounded-lg sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Crown className="h-4 w-4 text-amber-500 sm:h-5 sm:w-5" />
                    Upgrade to Premium
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm">
                    {premiumReason === "images"
                      ? "Free listings support up to 3 images. Upgrade to upload more."
                      : "Commercial & apartment listings are premium. Upgrade to unlock."}
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border border-border bg-muted/50 p-3 text-center sm:p-4">
                  <p className="text-xl font-bold text-foreground sm:text-2xl">₹99</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">one-time per listing</p>
                  <ul className="mt-2 space-y-1 text-left text-xs text-muted-foreground sm:mt-3 sm:text-sm">
                    {premiumReason === "images" ? (
                      <>
                        <li>✓ Upload up to 10 images</li>
                        <li>✓ Featured badge on listing</li>
                        <li>✓ Priority in search results</li>
                      </>
                    ) : (
                      <>
                        <li>✓ List apartments &amp; commercial properties</li>
                        <li>✓ Upload up to 10 images</li>
                        <li>✓ Featured badge &amp; priority placement</li>
                      </>
                    )}
                  </ul>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-xs sm:text-sm" onClick={() => setShowPremiumDialog(false)}>
                    {premiumReason === "images" ? "Continue with 3" : "Pick another type"}
                  </Button>
                  <Button size="sm" className="flex-1 text-xs sm:text-sm" onClick={() => { toast.info("Payment integration coming soon!"); setShowPremiumDialog(false); }}>
                    Upgrade Now
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitting ? "Posting..." : "Post Listing"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostListing;
