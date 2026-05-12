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
  image4: string | null;
  image5: string | null;
  image6: string | null;
  image7: string | null;
  image8: string | null;
  image9: string | null;
  image10: string | null;
  is_premium: boolean;
  expires_at: string | null;
  plan_type: string;
  google_map_link: string | null;
  password: string;
  created_at: string;
  user_type: "owner" | "agent" | null;
};
