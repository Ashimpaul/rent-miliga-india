-- Create a more robust listing creation function
DROP FUNCTION IF EXISTS public.create_listing_v2(jsonb);

CREATE OR REPLACE FUNCTION public.create_listing_v2(listing_data jsonb)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  INSERT INTO public.listings (
    title,
    property_type,
    rent,
    description,
    state,
    city,
    area,
    address,
    pincode,
    owner_name,
    phone_number,
    google_map_link,
    password,
    country,
    is_premium,
    plan_type,
    expires_at,
    user_type,
    image1,
    image2,
    image3,
    image4,
    image5,
    image6,
    image7,
    image8,
    image9,
    image10
  )
  VALUES (
    (listing_data->>'title')::text,
    (listing_data->>'property_type')::text,
    (listing_data->>'rent')::integer,
    (listing_data->>'description')::text,
    (listing_data->>'state')::text,
    (listing_data->>'city')::text,
    (listing_data->>'area')::text,
    (listing_data->>'address')::text,
    (listing_data->>'pincode')::text,
    (listing_data->>'owner_name')::text,
    (listing_data->>'phone_number')::text,
    (listing_data->>'google_map_link')::text,
    (listing_data->>'password')::text,
    COALESCE((listing_data->>'country')::text, 'India'),
    COALESCE((listing_data->>'is_premium')::boolean, false),
    COALESCE((listing_data->>'plan_type')::text, 'free'),
    (listing_data->>'expires_at')::timestamptz,
    COALESCE((listing_data->>'user_type')::text, 'owner'),
    (listing_data->>'image1')::text,
    (listing_data->>'image2')::text,
    (listing_data->>'image3')::text,
    (listing_data->>'image4')::text,
    (listing_data->>'image5')::text,
    (listing_data->>'image6')::text,
    (listing_data->>'image7')::text,
    (listing_data->>'image8')::text,
    (listing_data->>'image9')::text,
    (listing_data->>'image10')::text
  )
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;
