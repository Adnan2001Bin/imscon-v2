export interface Post {
  id: string;
  content: string;
  media_urls?: string[];
  document_urls?: string[];
  youtube_url?: string;
  sponsored?: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface User {
  id: string;
  name: string;
  designation?: string;
  company?: string;
  profile_picture?: string;
}

export interface PostWithUser extends Post {
  user: User;
}

export interface PostsPage {
  data: PostWithUser[];
  nextCursor: string | null;
}
