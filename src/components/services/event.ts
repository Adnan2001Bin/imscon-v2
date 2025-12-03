import { supabase } from '@/src/lib/supabase';
import type { Event, EventWithUser, EventsPage, AgendaSession, AgendaSessionsPage } from '@/src/types/event';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import queryKeys from '../constants/queryKeys';

export type { Event, EventWithUser, EventsPage, AgendaSession, AgendaSessionsPage };

// Get events feed with user information (paginated)
export const getEventsFeedOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.event.feed(),
    queryFn: ({ pageParam }: { pageParam?: string }) => getEventsFeedPaginatedFn(pageParam),
    getNextPageParam: (lastPage: EventsPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

export const getEventsListOptions = () =>
  queryOptions({
    queryKey: queryKeys.event.list(),
    queryFn: () => getEventsListFn(),
  });

// Get single event with user information
export const getEventOptions = (eventId: string) =>
  queryOptions({
    queryKey: queryKeys.event.single(eventId),
    queryFn: () => getEventFn(eventId),
  });

// Get agenda sessions for an event
export const getEventAgendaSessionsOptions = (eventId: string) =>
  infiniteQueryOptions({
    queryKey: queryKeys.event.agendaSessions(eventId),
    queryFn: ({ pageParam }: { pageParam?: string }) => getEventAgendaSessionsPaginatedFn(eventId, pageParam),
    getNextPageParam: (lastPage: AgendaSessionsPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

// Function to fetch events feed with pagination
const getEventsFeedPaginatedFn = async (pageParam?: string): Promise<EventsPage> => {
  const limit = 20;
  let query = supabase
    .from('events')
    .select('*')
    .eq('status', 'published') // Only show published events
    .order('start_date', { ascending: true }) // Order by start date
    .order('created_at', { ascending: false })
    .limit(limit);

  if (pageParam) {
    query = query.lt('created_at', pageParam);
  }

  const { data: eventsData, error: eventsError } = await query;

  if (eventsError) {
    throw new Error(`Failed to fetch events: ${eventsError.message}`);
  }

  if (!eventsData || eventsData.length === 0) {
    return {
      data: [],
      nextCursor: null,
    };
  }

  // Get unique user IDs
  const userIds = [...new Set(eventsData.map(event => event.created_by))];

  // Fetch user data for all events
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .in('id', userIds);

  if (usersError) {
    console.warn('Failed to fetch user data:', usersError);
  }

  // Create a map of user data for easy lookup
  const usersMap = new Map();
  if (usersData) {
    usersData.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  // Combine events with user data
  const eventsWithUsers = eventsData.map(event => ({
    ...event,
    user: usersMap.get(event.created_by) || {
      id: event.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  }));

  const nextCursor = eventsData.length === limit ? eventsData[eventsData.length - 1].created_at : null;

  return {
    data: eventsWithUsers as EventWithUser[],
    nextCursor,
  };
};

// Function to fetch all events (for admin purposes)
const getEventsListFn = async (): Promise<EventWithUser[]> => {
  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: true })
    .order('created_at', { ascending: false });

  if (eventsError) {
    throw new Error(`Failed to fetch events: ${eventsError.message}`);
  }

  if (!eventsData || eventsData.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(eventsData.map(event => event.created_by))];

  // Fetch user data for all events
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .in('id', userIds);

  if (usersError) {
    console.warn('Failed to fetch user data:', usersError);
  }

  // Create a map of user data for easy lookup
  const usersMap = new Map();
  if (usersData) {
    usersData.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  // Combine events with user data
  const eventsWithUsers = eventsData.map(event => ({
    ...event,
    user: usersMap.get(event.created_by) || {
      id: event.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  }));

  return eventsWithUsers as EventWithUser[];
};

// Function to fetch single event
const getEventFn = async (eventId: string): Promise<EventWithUser> => {
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (eventError) {
    throw new Error(`Failed to fetch event: ${eventError.message}`);
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .eq('id', eventData.created_by)
    .single();

  if (userError) {
    console.warn('Failed to fetch user data:', userError);
  }

  return {
    ...eventData,
    user: userData || {
      id: eventData.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  } as EventWithUser;
};

// Function to fetch agenda sessions for an event
const getEventAgendaSessionsPaginatedFn = async (eventId: string, pageParam?: string): Promise<AgendaSessionsPage> => {
  const limit = 20;
  let query = supabase
    .from('agenda_sessions')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'published') // Only show published sessions
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(limit);

  if (pageParam) {
    query = query.lt('created_at', pageParam);
  }

  const { data: sessionsData, error: sessionsError } = await query;

  if (sessionsError) {
    throw new Error(`Failed to fetch agenda sessions: ${sessionsError.message}`);
  }

  if (!sessionsData || sessionsData.length === 0) {
    return {
      data: [],
      nextCursor: null,
    };
  }

  const nextCursor = sessionsData.length === limit ? sessionsData[sessionsData.length - 1].created_at : null;

  return {
    data: sessionsData as AgendaSession[],
    nextCursor,
  };
};

// Create a new event
export const createEvent = async (eventData: {
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  is_online?: boolean;
  online_link?: string;
  category: Event['category'];
  floor_map_url?: string;
  cover_image_url?: string;
  attachment_urls?: string[];
}) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: eventDataResult, error: eventError } = await supabase
    .from('events')
    .insert({
      ...eventData,
      created_by: user.id,
      status: 'draft', // Default to draft
      is_online: eventData.is_online || false,
      attachment_urls: eventData.attachment_urls || [],
    })
    .select('*')
    .single();

  if (eventError) {
    throw new Error(`Failed to create event: ${eventError.message}`);
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.warn('Failed to fetch user data:', userError);
  }

  return {
    ...eventDataResult,
    user: userData || {
      id: user.id,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  } as EventWithUser;
};

// Update an event
export const updateEvent = async (eventId: string, updates: Partial<Event>) => {
  const { data: eventDataResult, error: eventError } = await supabase
    .from('events')
    .update(updates)
    .eq('id', eventId)
    .select('*')
    .single();

  if (eventError) {
    throw new Error(`Failed to update event: ${eventError.message}`);
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .eq('id', eventDataResult.created_by)
    .single();

  if (userError) {
    console.warn('Failed to fetch user data:', userError);
  }

  return {
    ...eventDataResult,
    user: userData || {
      id: eventDataResult.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  } as EventWithUser;
};

// Delete an event
export const deleteEvent = async (eventId: string) => {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId);

  if (error) {
    throw new Error(`Failed to delete event: ${error.message}`);
  }
};
