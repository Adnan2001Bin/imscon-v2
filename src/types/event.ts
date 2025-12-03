export interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location: string;
  is_online: boolean;
  online_link?: string;
  category: 'conference' | 'workshop' | 'seminar' | 'networking' | 'exhibition' | 'webinar' | 'other';
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  floor_map_url?: string;
  cover_image_url?: string;
  attachment_urls: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AgendaSession {
  id: string;
  title: string;
  description: string;
  speakers: string[];
  stage: string;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  status: 'published' | 'draft' | 'cancelled';
  speaker_bio?: string;
  tags: string[];
  total_registered?: number;
  event_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventWithUser extends Event {
  user?: {
    id: string;
    name: string;
    designation?: string;
    company?: string;
    profile_picture?: string;
  };
}

export interface EventsPage {
  data: EventWithUser[];
  nextCursor: string | null;
}

export interface AgendaSessionsPage {
  data: AgendaSession[];
  nextCursor: string | null;
}
