// Re-export from the auto-generated integrations client
export { supabase } from "@/integrations/supabase/client";

export type Listing = {
  id: string;
  title: string;
  property_type: string;
  rent: number;
  description: string | null;
  state: string;
  city: string;
  area: string;
  address: string | null;
  pincode: string | null;
  owner_name: string;
  phone_number: string;
  image1: string | null;
  image2: string | null;
  image3: string | null;
  google_map_link: string | null;
  password: string;
  created_at: string;
};
