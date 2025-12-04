import queryKeys from '../constants/queryKeys';
import { supabase } from '@/src/lib/supabase';
import { queryOptions } from '@tanstack/react-query';
import type { Advertisement } from '@/src/types/advertisement';

export type { Advertisement };

// Get all advertisements
export const getAdvertisementsOptions = () =>
  queryOptions({
    queryKey: queryKeys.advertisement.list(),
    queryFn: () => getAdvertisementsFn(),
  });

// Get the latest/active advertisement for banner display
export const getLatestAdvertisementOptions = () =>
  queryOptions({
    queryKey: [...queryKeys.advertisement.list(), 'latest'],
    queryFn: () => getLatestAdvertisementFn(),
  });

const getAdvertisementsFn = async (): Promise<Advertisement[]> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch advertisements: ${error.message}`);
  }

  return data as Advertisement[];
};

const getLatestAdvertisementFn = async (): Promise<Advertisement | null> => {
  const { data, error } = await supabase
    .from('advertisements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch latest advertisement: ${error.message}`);
  }

  return data as Advertisement | null;
};








