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
import { 
  Loader2, Eye, EyeOff, MapPin, 
  Info, Home, IndianRupee, ImagePlus, User, Lock, 
  CheckCircle2, Sparkles, Navigation, Phone, ArrowRight,
  Building2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PROPERTY_TYPES, INDIAN_STATES } from "@/lib/constants";

const PostListing = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [showPassword, setShowPassword] = useState(false);
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
    user_type: "owner",
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

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const currencySymbol = "₹";
  const phonePlaceholder = "+91";

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 3;
    
    if (files.length > maxImages) {
      toast.error(`Listings support up to ${maxImages} images`);
      setImages(files.slice(0, maxImages));
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

    const postListing = async () => {
      setSubmitting(true);
      try {
        const urls = await Promise.all(images.map(uploadImage));

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
          is_premium: false,
          plan_type: "free",
          expires_at: null, // No expiration!
          user_type: form.user_type,
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

    postListing();
  };

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-16">
          <div className="mb-10 text-center sm:text-left">
            <Badge variant="secondary" className="mb-4 px-3 py-1 bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px]">
              <Sparkles className="mr-1.5 h-3 w-3" /> List Your Property
            </Badge>
            <h1 className="animate-fade-up text-4xl font-black text-foreground sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              Reach Thousands of <span className="text-primary italic">Tenants</span>
            </h1>
            <p className="animate-fade-up mt-4 text-base text-muted-foreground opacity-0 stagger-1 sm:text-xl font-medium max-w-xl">
              Fill in the details below to post your rental listing. It's completely free!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="animate-fade-up space-y-12 opacity-0 stagger-2 sm:space-y-16">
            {/* Step 1: Property Info */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-black text-xl shadow-lg shadow-primary/20">
                  1
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Property Details</h2>
                  <p className="text-sm text-muted-foreground font-medium">Basic information about your listing</p>
                </div>
              </div>

              <Card className="border-none shadow-xl shadow-black/5 bg-background overflow-hidden rounded-[2rem]">
                <CardContent className="p-6 sm:p-10 space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-sm font-bold flex items-center gap-2">
                      <Home className="h-4 w-4 text-primary" /> Listing Title *
                    </Label>
                    <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 2BHK near Silchar Railway Station" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" /> Property Type *
                      </Label>
                      <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                        <SelectTrigger className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {PROPERTY_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="capitalize py-3">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="rent" className="text-sm font-bold flex items-center gap-2">
                        <IndianRupee className="h-4 w-4 text-primary" /> Monthly Rent *
                      </Label>
                      <div className="relative">
                        <Input id="rent" type="number" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder="0" className="h-14 pl-10 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-bold flex items-center gap-2">
                      <Info className="h-4 w-4 text-primary" /> Description
                    </Label>
                    <Textarea id="description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe your property, amenities, nearby landmarks, etc." rows={6} className="text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all resize-none" />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Step 2: Location */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-black text-xl shadow-lg shadow-primary/20">
                  2
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Location Details</h2>
                  <p className="text-sm text-muted-foreground font-medium">Where is your property located?</p>
                </div>
              </div>

              <Card className="border-none shadow-xl shadow-black/5 bg-background overflow-hidden rounded-[2rem]">
                <CardContent className="p-6 sm:p-10 space-y-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="w-full h-14 gap-3 border-dashed border-2 border-primary/30 hover:border-primary hover:bg-primary/5 text-primary font-bold rounded-2xl transition-all"
                  >
                    {locating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Navigation className="h-6 w-6" />}
                    {locating ? "PINPOINTING..." : "AUTODETECT MY LOCATION"}
                  </Button>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="state" className="text-sm font-bold flex items-center gap-2">
                        State *
                      </Label>
                      <Select value={form.state} onValueChange={(v) => set("state", v)}>
                        <SelectTrigger id="state" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                          {INDIAN_STATES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize py-3">{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="city" className="text-sm font-bold flex items-center gap-2">
                        City *
                      </Label>
                      <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Silchar" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="area" className="text-sm font-bold flex items-center gap-2">
                        Area / Locality *
                      </Label>
                      <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Tarapur" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="pincode" className="text-sm font-bold flex items-center gap-2">
                        Pincode
                      </Label>
                      <Input id="pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={6} placeholder="6-digit pincode" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-sm font-bold flex items-center gap-2">
                      Full Address
                    </Label>
                    <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="House/Flat number, building name, street" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="google_map_link" className="text-sm font-bold flex items-center gap-2 text-primary">
                      <MapPin className="h-4 w-4" /> Google Maps Link (Optional)
                    </Label>
                    <Input id="google_map_link" value={form.google_map_link} onChange={(e) => set("google_map_link", e.target.value)} placeholder="Paste Google Maps share link here" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                    <p className="px-1 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      Tip: Open Google Maps → Find property → Share → Copy link
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Step 3: Photos */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-black text-xl shadow-lg shadow-primary/20">
                  3
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Property Photos</h2>
                  <p className="text-sm text-muted-foreground font-medium">Upload up to 3 high quality images</p>
                </div>
              </div>

              <Card className="border-none shadow-xl shadow-black/5 bg-background overflow-hidden rounded-[2rem]">
                <CardContent className="p-6 sm:p-10 space-y-8">
                  <div className="relative group cursor-pointer">
                    <input 
                      id="images" 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImages} 
                      className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                    />
                    <div className="flex flex-col items-center justify-center py-12 border-4 border-dashed border-muted/50 rounded-[2rem] group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
                      <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                        <ImagePlus className="h-10 w-10" />
                      </div>
                      <h3 className="text-lg font-black text-foreground">Click to upload photos</h3>
                      <p className="text-sm text-muted-foreground mt-1">or drag and drop images here</p>
                      <div className="mt-4 flex gap-2">
                        <Badge variant="outline" className="rounded-full px-3 py-1 font-bold">
                          Max 3 photos
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {images.map((file, i) => (
                        <div key={i} className="group relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-muted shadow-sm hover:border-primary transition-all">
                          <img 
                            src={URL.createObjectURL(file)} 
                            alt="Preview" 
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          />
                          <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Step 4: Contact & Security */}
            <section className="space-y-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-black text-xl shadow-lg shadow-primary/20">
                  4
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight">Contact & Security</h2>
                  <p className="text-sm text-muted-foreground font-medium">How can tenants reach you?</p>
                </div>
              </div>

              <Card className="border-none shadow-xl shadow-black/5 bg-background overflow-hidden rounded-[2rem]">
                <CardContent className="p-6 sm:p-10 space-y-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="owner" className="text-sm font-bold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" /> Your Name *
                      </Label>
                      <Input id="owner" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} placeholder="Enter your full name" className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-sm font-bold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-primary" /> Phone Number *
                      </Label>
                      <Input id="phone" type="tel" value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder={`e.g. ${phonePlaceholder}9876543210`} className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" /> Posting As *
                    </Label>
                    <Select value={form.user_type} onValueChange={(v) => set("user_type", v as "owner" | "agent")}>
                      <SelectTrigger className="h-14 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl">
                        <SelectItem value="owner" className="capitalize py-3">Property Owner</SelectItem>
                        <SelectItem value="agent" className="capitalize py-3">Real Estate Agent / Broker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator className="bg-muted/50" />

                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-sm font-bold flex items-center gap-2">
                      <Lock className="h-4 w-4 text-primary" /> Create Listing Password *
                    </Label>
                    <div className="relative">
                      <Input 
                        id="password" 
                        type={showPassword ? "text" : "password"} 
                        value={form.password} 
                        onChange={(e) => set("password", e.target.value)} 
                        placeholder="Set a password to edit or delete this post later" 
                        className="h-14 pr-12 text-base rounded-2xl bg-muted/30 border-none focus:bg-background transition-all" 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                      </button>
                    </div>
                    <div className="rounded-2xl bg-amber-500/5 p-4 border border-amber-500/10 mt-2">
                      <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest flex items-center gap-2">
                        <Info className="h-3 w-3" /> Important: We don't store your personal accounts. This password is the ONLY way to edit your post later.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Submit Section */}
            <div className="pt-8 space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Your listing will be live instantly and never expire
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-20 rounded-[2rem] text-2xl font-black shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden" 
                  disabled={submitting}
                >
                  <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[-20deg]" />
                  {submitting ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-8 w-8 animate-spin" /> POSTING...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      POST LISTING NOW <ArrowRight className="h-8 w-8 transition-transform group-hover:translate-x-2" />
                    </span>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground font-medium">
                  By clicking "Post Listing Now", you agree to our Terms and Privacy Policy.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PostListing;
