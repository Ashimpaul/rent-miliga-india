import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
  created_at: string;
};
