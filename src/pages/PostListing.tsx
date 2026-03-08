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
import { Loader2 } from "lucide-react";

const PROPERTY_TYPES = ["room", "apartment", "house", "pg", "hostel", "commercial"];

const PostListing = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
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

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3);
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
        ...form,
        rent: Number(form.rent),
        image1: urls[0] || null,
        image2: urls[1] || null,
        image3: urls[2] || null,
        google_map_link: form.google_map_link || null,
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
        <div className="container mx-auto max-w-2xl px-4 py-8">
          <h1 className="text-2xl font-bold text-foreground">Post a Rental Listing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Fill in the details to list your property</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Property Info */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Property Information</legend>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Spacious 2BHK near Metro" />
              </div>
              <div>
                <Label>Property Type *</Label>
                <Select value={form.property_type} onValueChange={(v) => set("property_type", v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PROPERTY_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rent">Monthly Rent (₹) *</Label>
                <Input id="rent" type="number" value={form.rent} onChange={(e) => set("rent", e.target.value)} placeholder="e.g. 8000" />
              </div>
              <div>
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Brief description of the property" rows={3} />
              </div>
            </fieldset>

            {/* Location */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Location</legend>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input id="state" value={form.state} onChange={(e) => set("state", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" value={form.city} onChange={(e) => set("city", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="area">Area / Locality *</Label>
                <Input id="area" value={form.area} onChange={(e) => set("area", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={form.pincode} onChange={(e) => set("pincode", e.target.value)} maxLength={6} />
              </div>
              <div>
                <Label htmlFor="google_map_link">Google Maps Link</Label>
                <Input id="google_map_link" value={form.google_map_link} onChange={(e) => set("google_map_link", e.target.value)} placeholder="Paste Google Maps link of your property" />
                <p className="mt-1 text-xs text-muted-foreground">
                  Open Google Maps → Find your property → Click "Share" → Copy link
                </p>
              </div>
            </fieldset>

            {/* Contact */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Contact Information</legend>
              <div>
                <Label htmlFor="owner">Owner Name *</Label>
                <Input id="owner" value={form.owner_name} onChange={(e) => set("owner_name", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" value={form.phone_number} onChange={(e) => set("phone_number", e.target.value)} placeholder="+919876543210" />
              </div>
            </fieldset>

            {/* Images */}
            <fieldset className="space-y-4 rounded-lg border border-border p-4">
              <legend className="px-2 text-sm font-semibold text-foreground">Images</legend>
              <div>
                <Label htmlFor="images">Upload Images (1-3) *</Label>
                <Input id="images" type="file" accept="image/*" multiple onChange={handleImages} />
                {images.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">{images.length} image(s) selected</p>
                )}
              </div>
            </fieldset>

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
