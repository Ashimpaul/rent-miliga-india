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
import { initializePayment } from "@/lib/razorpay";

const PostListing = () => {
  const navigate = useNavigate();
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
          state: form.state,
          city: form.city,
          area: form.area,
          address: form.address || null,
          pincode: form.pincode || null,
          owner_name: form.owner_name,
          phone_number: form.phone_number,
          google_map_link: form.google_map_link || null,
          password: form.password,
          country: "India",
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
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-8 sm:py-12">
          <div className="mb-8 text-center sm:text-left">
            <h1 className="animate-fade-up text-3xl font-black text-foreground sm:text-4xl">Post a Rental Listing</h1>
            <p className="animate-fade-up mt-2 text-base text-muted-foreground opacity-0 stagger-1 sm:text-lg">Fill in the details to list your property</p>
          </div>

          <form onSubmit={handleSubmit} className="animate-fade-up space-y-6 opacity-0 stagger-2 sm:space-y-10">
            {/* Property Info */}
            <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-8">
              <legend className="px-4 text-sm font-bold uppercase tracking-widest text-primary sm:text-base">Property Information</legend>
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-bold sm:text-base">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 2BHK near Metro" className="h-12 text-base rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold sm:text-base">Property Type *</Label>
                <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                  <SelectTrigger className="h-12 text-base rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize py-3">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rent" className="text-sm font-bold sm:text-base">Monthly Rent ({currencySymbol}) *</Label>
                <Input id="rent" type="number" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder="0" className="h-12 text-base rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold sm:text-base">Description</Label>
                <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Tell us more about the property, amenities, etc." rows={5} className="text-base rounded-xl" />
              </div>
            </fieldset>

            {/* Location */}
            <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-8">
              <legend className="px-4 text-sm font-bold uppercase tracking-widest text-primary sm:text-base">Location</legend>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleUseCurrentLocation}
                disabled={locating}
                className="w-full h-12 gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold rounded-xl"
              >
                {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <MapPin className="h-5 w-5" />}
                {locating ? "Getting Location..." : "Use My Current Location"}
              </Button>
              
              <div className="space-y-2">
                <Label htmlFor="state" className="text-sm font-bold sm:text-base">State *</Label>
                <Select value={form.state} onValueChange={(v) => set("state", v)}>
                  <SelectTrigger id="state" className="h-12 text-base rounded-xl">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s} className="py-3">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-bold sm:text-base">City *</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Silchar" className="h-12 text-base rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="area" className="text-sm font-bold sm:text-base">Area / Locality *</Label>
                  <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Tarapur" className="h-12 text-base rounded-xl" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-bold sm:text-base">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full address" className="h-12 text-base rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pincode" className="text-sm font-bold sm:text-base">Pincode</Label>
                <Input id="pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={6} placeholder="6-digit pincode" className="h-12 text-base rounded-xl" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="google_map_link" className="text-sm font-bold sm:text-base">Google Maps Link</Label>
                <Input id="google_map_link" value={form.google_map_link} onChange={(e) => set("google_map_link", e.target.value)} placeholder="Paste Google Maps link" className="h-12 text-base rounded-xl" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Open Google Maps → Find your property → Click "Share" → Copy link
                </p>
              </div>
            </fieldset>

            {/* Contact */}
            <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-8">
              <legend className="px-4 text-sm font-bold uppercase tracking-widest text-primary sm:text-base">Contact Information</legend>
              <div className="space-y-2">
                <Label htmlFor="owner" className="text-sm font-bold sm:text-base">Owner Name *</Label>
                <Input id="owner" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} placeholder="Your full name" className="h-12 text-base rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-bold sm:text-base">Phone Number *</Label>
                <Input id="phone" type="tel" value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder={`e.g. ${phonePlaceholder}9876543210`} className="h-12 text-base rounded-xl" />
              </div>
            </fieldset>

            {/* Security */}
            <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-8">
              <legend className="px-4 text-sm font-bold uppercase tracking-widest text-primary sm:text-base">Security</legend>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold sm:text-base">Listing Password *</Label>
                <div className="relative">
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    value={form.password} 
                    onChange={(e) => set("password", e.target.value)} 
                    placeholder="Set a password to edit/delete later" 
                    className="h-12 pr-12 text-base rounded-xl" 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Remember this password — you'll need it to edit or delete your listing later.
                </p>
              </div>
            </fieldset>

            {/* Listing Plan */}
            <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-8">
              <legend className="px-4 text-sm font-bold uppercase tracking-widest text-primary sm:text-base">Listing Duration Plan</legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPlan("30")}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    plan === "30" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-base font-bold">30 Days</p>
                    <p className="text-xs text-muted-foreground">Standard listing</p>
                  </div>
                  <span className="text-base font-black text-primary">Free</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("60")}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    plan === "60" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-base font-bold">60 Days</p>
                    <p className="text-xs text-muted-foreground">Extended visibility</p>
                  </div>
                  <span className="text-base font-black text-primary">₹99</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("90")}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    plan === "90" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <p className="text-base font-bold">90 Days</p>
                    <p className="text-xs text-muted-foreground">Long term listing</p>
                  </div>
                  <span className="text-base font-black text-primary">₹199</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlan("forever")}
                  className={`flex items-center justify-between rounded-xl border p-4 transition-all ${
                    plan === "forever" ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border hover:bg-muted"
                  }`}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-1">
                      <p className="text-base font-bold">Forever</p>
                      <Crown className="h-4 w-4 text-amber-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">Never expires</p>
                  </div>
                  <span className="text-base font-black text-primary">₹399</span>
                </button>
              </div>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Listings are automatically deleted after their duration expires.
              </p>
            </fieldset>

            {/* Images */}
            <fieldset className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm sm:space-y-6 sm:p-8">
              <legend className="px-4 text-sm font-bold uppercase tracking-widest text-primary sm:text-base">Images</legend>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images" className="text-sm font-bold sm:text-base">Upload Photos (up to {isPremium ? "10" : "3"}) *</Label>
                  <p className="text-xs text-muted-foreground">Higher quality photos attract more tenants. {isPremium ? "You can upload up to 10 photos." : "Max 3 free. Upgrade for 10."}</p>
                  <Input 
                    id="images" 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleImages} 
                    className="h-12 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer rounded-xl border-dashed" 
                  />
                </div>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 sm:gap-6">
                    {images.map((file, i) => (
                      <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted shadow-sm">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white text-xs font-bold">Photo {i + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </fieldset>

            {/* Premium Dialog */}
            <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
              <DialogContent className="mx-auto max-w-[calc(100vw-2rem)] rounded-2xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                    <Crown className="h-5 w-5 text-amber-500" />
                    Upgrade to Premium
                  </DialogTitle>
                  <DialogDescription className="text-sm">
                    {premiumReason === "images"
                      ? "Free listings support up to 3 images. Upgrade to upload more."
                      : "Commercial & apartment listings are premium. Upgrade to unlock."}
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-2xl border border-border bg-muted/50 p-6 text-center">
                  <p className="text-3xl font-black text-foreground">₹99</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">one-time add-on fee</p>
                  <ul className="mt-6 space-y-3 text-left text-sm text-foreground/80">
                    <li className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">✓</div>
                      Upload up to 10 images
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">✓</div>
                      Featured badge on listing
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px]">✓</div>
                      Priority in search results
                    </li>
                  </ul>
                </div>
                <div className="flex gap-3 mt-4">
                  <Button variant="outline" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setShowPremiumDialog(false)}>
                    {premiumReason === "images" ? "Keep 3" : "Change Type"}
                  </Button>
                  <Button className="flex-1 rounded-xl h-12 font-bold" onClick={handleUpgrade}>
                    Add Premium
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-black shadow-xl" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
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
