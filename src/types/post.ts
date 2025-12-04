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
  likes_count?: number;
  comments_count?: number;
  is_liked_by_user?: boolean;
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

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface PostsPage {
  data: PostWithUser[];
  nextCursor: string | null;
}
