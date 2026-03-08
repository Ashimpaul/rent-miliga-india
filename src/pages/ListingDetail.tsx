import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
import { Phone, MapPin, IndianRupee, ArrowLeft, Loader2, Pencil, Trash2, Lock } from "lucide-react";
import { toast } from "sonner";

const PROPERTY_TYPES = ["room", "apartment", "house", "pg", "hostel", "commercial"];

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Password dialog state
  const [passwordDialog, setPasswordDialog] = useState<"edit" | "delete" | null>(null);
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
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
  });
  const [saving, setSaving] = useState(false);

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

  const verifyPassword = async (action: "edit" | "delete") => {
    if (!id || !password) return;
    setVerifying(true);
    try {
      const { data, error } = await supabase.rpc("verify_listing_password", {
        listing_id: id,
        input_password: password,
      });
      if (error) throw error;
      if (!data) {
        toast.error("Incorrect password");
        return;
      }
      setPasswordDialog(null);
      setPassword("");

      if (action === "edit") {
        setEditForm({
          title: listing?.title || "",
          property_type: listing?.property_type || "",
          rent: String(listing?.rent || ""),
          description: listing?.description || "",
          state: listing?.state || "",
          city: listing?.city || "",
          area: listing?.area || "",
          address: listing?.address || "",
          pincode: listing?.pincode || "",
          owner_name: listing?.owner_name || "",
          phone_number: listing?.phone_number || "",
          google_map_link: listing?.google_map_link || "",
        });
        setEditing(true);
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
    if (error) {
      toast.error("Failed to delete listing");
      return;
    }
    toast.success("Listing deleted successfully");
    navigate("/");
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    if (!editForm.title || !editForm.property_type || !editForm.rent || !editForm.state || !editForm.city || !editForm.area || !editForm.owner_name || !editForm.phone_number) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: editForm.title,
          property_type: editForm.property_type,
          rent: Number(editForm.rent),
          description: editForm.description || null,
          state: editForm.state,
          city: editForm.city,
          area: editForm.area,
          address: editForm.address || null,
          pincode: editForm.pincode || null,
          owner_name: editForm.owner_name,
          phone_number: editForm.phone_number,
          google_map_link: editForm.google_map_link || null,
        })
        .eq("id", id);
      if (error) throw error;

      // Refresh listing
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      setListing(data);
      setEditing(false);
      toast.success("Listing updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update listing");
    } finally {
      setSaving(false);
    }
  };

  const setEdit = (key: string, value: string) => setEditForm((f) => ({ ...f, [key]: value }));

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
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-1 h-4 w-4" /> Back to listings
            </Link>
            {!editing && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setPasswordDialog("edit")}
                >
                  <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1 sm:flex-none"
                  onClick={() => setPasswordDialog("delete")}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                </Button>
              </div>
            )}
          </div>

          {/* Edit Mode */}
          {editing ? (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-foreground">Edit Listing</h2>

              <fieldset className="space-y-4 rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold text-foreground">Property Information</legend>
                <div>
                  <Label htmlFor="edit-title">Title *</Label>
                  <Input id="edit-title" value={editForm.title} onChange={(e) => setEdit("title", e.target.value)} />
                </div>
                <div>
                  <Label>Property Type *</Label>
                  <Select value={editForm.property_type} onValueChange={(v) => setEdit("property_type", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PROPERTY_TYPES.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-rent">Monthly Rent (₹) *</Label>
                  <Input id="edit-rent" type="number" value={editForm.rent} onChange={(e) => setEdit("rent", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-desc">Description</Label>
                  <Textarea id="edit-desc" value={editForm.description} onChange={(e) => setEdit("description", e.target.value)} rows={3} />
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold text-foreground">Location</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="edit-state">State *</Label>
                    <Input id="edit-state" value={editForm.state} onChange={(e) => setEdit("state", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="edit-city">City *</Label>
                    <Input id="edit-city" value={editForm.city} onChange={(e) => setEdit("city", e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-area">Area / Locality *</Label>
                  <Input id="edit-area" value={editForm.area} onChange={(e) => setEdit("area", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-address">Address</Label>
                  <Input id="edit-address" value={editForm.address} onChange={(e) => setEdit("address", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-pincode">Pincode</Label>
                  <Input id="edit-pincode" value={editForm.pincode} onChange={(e) => setEdit("pincode", e.target.value)} maxLength={6} />
                </div>
                <div>
                  <Label htmlFor="edit-map">Google Maps Link</Label>
                  <Input id="edit-map" value={editForm.google_map_link} onChange={(e) => setEdit("google_map_link", e.target.value)} />
                </div>
              </fieldset>

              <fieldset className="space-y-4 rounded-lg border border-border p-4">
                <legend className="px-2 text-sm font-semibold text-foreground">Contact Information</legend>
                <div>
                  <Label htmlFor="edit-owner">Owner Name *</Label>
                  <Input id="edit-owner" value={editForm.owner_name} onChange={(e) => setEdit("owner_name", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input id="edit-phone" type="tel" value={editForm.phone_number} onChange={(e) => setEdit("phone_number", e.target.value)} />
                </div>
              </fieldset>

              <div className="flex gap-3">
                <Button className="flex-1" size="lg" onClick={handleSaveEdit} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" size="lg" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Image Gallery */}
              {images.length > 0 && (
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={images[activeImage]}
                    alt={listing.title}
                    className="aspect-video w-full object-cover"
                  />
                  {images.length > 1 && (
                    <div className="mt-2 flex gap-2 overflow-x-auto">
                      {images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`h-14 w-16 shrink-0 overflow-hidden rounded-md border-2 sm:h-16 sm:w-20 ${
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
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <div><span className="text-muted-foreground">State:</span> {listing.state}</div>
                    <div><span className="text-muted-foreground">City:</span> {listing.city}</div>
                    <div><span className="text-muted-foreground">Area:</span> {listing.area}</div>
                    {listing.pincode && <div><span className="text-muted-foreground">Pincode:</span> {listing.pincode}</div>}
                  </div>
                  {listing.address && (
                    <p className="mt-2 text-sm"><span className="text-muted-foreground">Address:</span> {listing.address}</p>
                  )}
                  {listing.google_map_link && (
                    <a
                      href={listing.google_map_link}
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
            </>
          )}
        </div>
      </main>
      <Footer />

      {/* Password Verification Dialog */}
      <Dialog open={passwordDialog !== null} onOpenChange={() => { setPasswordDialog(null); setPassword(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              {passwordDialog === "delete" ? "Delete Listing" : "Edit Listing"}
            </DialogTitle>
            <DialogDescription>
              Enter the password you set when posting this listing to {passwordDialog === "delete" ? "delete" : "edit"} it.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="verify-password">Listing Password</Label>
            <Input
              id="verify-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your listing password"
              onKeyDown={(e) => e.key === "Enter" && verifyPassword(passwordDialog!)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setPasswordDialog(null); setPassword(""); }}>
              Cancel
            </Button>
            <Button
              variant={passwordDialog === "delete" ? "destructive" : "default"}
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
