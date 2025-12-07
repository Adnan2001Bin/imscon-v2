import { supabase } from '@/src/lib/supabase';
import type { Advertisement } from '@/src/types/advertisement';
import { queryOptions } from '@tanstack/react-query';
import queryKeys from '../constants/queryKeys';

export type { Advertisement };

// Get active advertisements (for banner rotation)
export const getActiveAdvertisementsOptions = () =>
  queryOptions({
    queryKey: queryKeys.advertisement.active(),
    queryFn: () => getActiveAdvertisementsFn(),
  });

// Get all advertisements (for admin purposes)
export const getAdvertisementsListOptions = () =>
  queryOptions({
    queryKey: queryKeys.advertisement.list(),
    queryFn: () => getAdvertisementsListFn(),
  });

// Function to fetch active advertisements
const getActiveAdvertisementsFn = async (): Promise<Advertisement[]> => {
  const { data: advertisements, error } = await supabase
    .from('advertisements')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch advertisements: ${error.message}`);
  }

  return advertisements || [];
};

// Function to fetch all advertisements
const getAdvertisementsListFn = async (): Promise<Advertisement[]> => {
  const { data: advertisements, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch advertisements: ${error.message}`);
  }

  return advertisements || [];
};

// Create a new advertisement
export const createAdvertisement = async (advertisementData: {
  title: string;
  image_url: string;
  link_url?: string;
  status?: string;
}) => {
  const { data: advertisement, error } = await supabase
    .from('advertisements')
    .insert({
      ...advertisementData,
      status: advertisementData.status || 'active',
    })
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to create advertisement: ${error.message}`);
  }

  return advertisement as Advertisement;
};

// Update an advertisement
export const updateAdvertisement = async (advertisementId: string, updates: Partial<Advertisement>) => {
  const { data: advertisement, error } = await supabase
    .from('advertisements')
    .update(updates)
    .eq('id', advertisementId)
    .select('*')
    .single();

  if (error) {
    throw new Error(`Failed to update advertisement: ${error.message}`);
  }

  return advertisement as Advertisement;
};

// Delete an advertisement
export const deleteAdvertisement = async (advertisementId: string) => {
  const { error } = await supabase
    .from('advertisements')
    .delete()
    .eq('id', advertisementId);

  if (error) {
    throw new Error(`Failed to delete advertisement: ${error.message}`);
  }
};