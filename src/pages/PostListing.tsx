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
import { Loader2, Crown, Eye, EyeOff, MapPin, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PROPERTY_TYPES, INDIAN_STATES, COUNTRIES } from "@/lib/constants";
import { useCountry } from "../contexts/CountryContext";
import { initializePayment } from "@/lib/razorpay";

const PostListing = () => {
  const navigate = useNavigate();
  const { country: currentCountry } = useCountry();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [plan, setPlan] = useState<"30" | "60" | "90" | "forever">("30");
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
  const [locating, setLocating] = useState(false);

  const handleUseCurrentLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation not supported");
      return;
    }

    setLocating(true);
    toast.info("Getting your location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18`);
          const data = await res.json();
          
          const city = data.address?.city || data.address?.town || data.address?.village || "";
          const area = data.address?.suburb || data.address?.neighbourhood || data.address?.road || "";
          const address = data.display_name || "";
          const pincode = data.address?.postcode || "";
          
          setForm(prev => ({
            ...prev,
            city: city || prev.city,
            area: area || prev.area,
            address: address || prev.address,
            pincode: pincode || prev.pincode
          }));
          
          toast.success("Location details filled!");
        } catch (err) {
          toast.error("Could not fetch location details");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        toast.error("Location access denied");
      }
    );
  };

  const PREMIUM_TYPES = ["commercial", "apartment"];

  const set = (key: string, value: string) => {
    if (key === "property_type" && PREMIUM_TYPES.includes(value) && !isPremium) {
      setPremiumReason("property_type");
      setShowPremiumDialog(true);
      return;
    }
    setForm((f) => ({ ...f, [key]: value }));
  };

  const currencySymbol = "₹";
  const phonePlaceholder = "+91";

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFreeImages = 3;
    const maxPremiumImages = 10;
    
    if (!isPremium && files.length > maxFreeImages) {
      setPremiumReason("images");
      setShowPremiumDialog(true);
      setImages(files.slice(0, maxFreeImages));
      e.target.value = "";
      return;
    }

    if (isPremium && files.length > maxPremiumImages) {
      toast.error(`Premium listings support up to ${maxPremiumImages} images`);
      setImages(files.slice(0, maxPremiumImages));
      e.target.value = "";
      return;
    }

    setImages(files);
  };

  const handleUpgrade = () => {
    setIsPremium(true);
    setShowPremiumDialog(false);
    toast.success("Premium features unlocked! The ₹99 fee will be added to your total at checkout.");
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

    // Define plans and prices
    const plans = {
      "30": { price: 0, days: 30 },
      "60": { price: 99, days: 60 },
      "90": { price: 199, days: 90 },
      "forever": { price: 399, days: null }
    };

    const selectedPlan = plans[plan];
    const premiumFee = isPremium ? 99 : 0;
    const totalPrice = selectedPlan.price + premiumFee;

    const postListing = async () => {
      setSubmitting(true);
      try {
        const urls = await Promise.all(images.map(uploadImage));
        
        // Calculate expiry date
        let expires_at = null;
        if (selectedPlan.days) {
          const date = new Date();
          date.setDate(date.getDate() + selectedPlan.days);
          expires_at = date.toISOString();
        }

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
          is_premium: isPremium,
          plan_type: plan,
          expires_at: expires_at,
          image1: urls[0] || null,
          image2: urls[1] || null,
          image3: urls[2] || null,
          image4: urls[3] || null,
          image5: urls[4] || null,
          image6: urls[5] || null,
          image7: urls[6] || null,
          image8: urls[7] || null,
          image9: urls[8] || null,
          image10: urls[9] || null,
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

    if (totalPrice > 0) {
      let description = `Plan: ${plan === 'forever' ? 'Unlimited' : plan + ' days'}`;
      if (isPremium) description += " + Premium Features";

      initializePayment({
        amount: totalPrice,
        description: description,
        contact: form.phone_number,
        onSuccess: (response) => {
          console.log("Combined Payment Successful:", response);
          postListing();
        },
        onFailure: (response) => {
          toast.error(response.error?.description || "Payment failed");
        },
        onDismiss: () => {
          toast.info("Payment cancelled");
        }
      });
    } else {
      postListing();
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
              <div className="flex items-center justify-between px-2">
                <legend className="text-xs font-semibold text-foreground sm:text-sm">Location</legend>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-[10px] gap-1 px-2 border-primary/20 hover:bg-primary/5 text-primary"
                  onClick={handleUseCurrentLocation}
                  disabled={locating}
                >
                  <MapPin className={`h-3 w-3 ${locating ? 'animate-bounce' : ''}`} />
                  {locating ? "Locating..." : "Use My Location"}
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:gap-3">
                <div>
                  <Label htmlFor="state" className="text-xs sm:text-sm">State *</Label>
                  <Select value={form.state} onValueChange={(v) => set("state", v)}>
                    <SelectTrigger id="state" className="text-sm">
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

            {/* Listing Plan */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Listing Duration Plan</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPlan("30")}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    plan === "30" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-bold">30 Days</p>
                    <p className="text-xs text-muted-foreground">Standard listing</p>
                  </div>
                  <span className="text-sm font-bold text-primary">Free</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("60")}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    plan === "60" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-bold">60 Days</p>
                    <p className="text-xs text-muted-foreground">Extended visibility</p>
                  </div>
                  <span className="text-sm font-bold text-primary">₹99</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("90")}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    plan === "90" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-bold">90 Days</p>
                    <p className="text-xs text-muted-foreground">Long term listing</p>
                  </div>
                  <span className="text-sm font-bold text-primary">₹199</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("forever")}
                  className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                    plan === "forever" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <p className="text-sm font-bold">Forever</p>
                      <Crown className="h-3 w-3 text-amber-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">Never expires</p>
                  </div>
                  <span className="text-sm font-bold text-primary">₹399</span>
                </button>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
                <Calendar className="h-3 w-3" />
                Listings are automatically deleted after their duration expires.
              </p>
            </fieldset>

            {/* Images */}
            <fieldset className="space-y-3 rounded-lg border border-border p-3 sm:space-y-4 sm:p-4">
              <legend className="px-2 text-xs font-semibold text-foreground sm:text-sm">Images</legend>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="images" className="text-xs sm:text-sm">Upload Photos (1-3) *</Label>
                  <p className="text-[10px] text-muted-foreground sm:text-xs">Higher quality photos attract more tenants. Max 3 free.</p>
                  <Input 
                    id="images" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImages} 
                    className="text-sm h-11 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer" 
                  />
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {images.map((file, i) => (
                      <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-border bg-muted">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="h-full w-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">Photo {i + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <p className="text-xl font-bold text-foreground sm:text-2xl">+₹99</p>
                  <p className="text-xs text-muted-foreground sm:text-sm">one-time add-on fee</p>
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
                  <Button size="sm" className="flex-1 text-xs sm:text-sm" onClick={handleUpgrade}>
                    Add Premium
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
