import { supabase } from "@/integrations/supabase/client";

export type PixelPlatform = "facebook" | "tiktok";

export interface TrackingPixel {
  id: string;
  platform: PixelPlatform;
  pixel_id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchTrackingPixels(): Promise<TrackingPixel[]> {
  const { data, error } = await supabase
    .from("tracking_pixels")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as TrackingPixel[];
}

export async function fetchActivePixels(): Promise<TrackingPixel[]> {
  const { data, error } = await supabase
    .from("tracking_pixels")
    .select("*")
    .eq("is_active", true);
  if (error) throw error;
  return (data ?? []) as TrackingPixel[];
}

export async function createTrackingPixel(pixel: {
  platform: PixelPlatform;
  pixel_id: string;
  name?: string;
  is_active?: boolean;
}): Promise<TrackingPixel> {
  const { data, error } = await supabase
    .from("tracking_pixels")
    .insert(pixel)
    .select()
    .single();
  if (error) throw error;
  return data as TrackingPixel;
}

export async function updateTrackingPixel(
  id: string,
  updates: Partial<{ platform: PixelPlatform; pixel_id: string; name: string; is_active: boolean }>
): Promise<TrackingPixel> {
  const { data, error } = await supabase
    .from("tracking_pixels")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as TrackingPixel;
}

export async function deleteTrackingPixel(id: string) {
  const { error } = await supabase.from("tracking_pixels").delete().eq("id", id);
  if (error) throw error;
}
