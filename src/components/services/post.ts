import { supabase } from '@/src/lib/supabase';
import type { Post, PostWithUser, PostsPage } from '@/src/types/post';
import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import queryKeys from '../constants/queryKeys';

export type { Post, PostWithUser, PostsPage };

// Get posts feed with user information (paginated)
export const getPostsFeedOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.post.feed(),
    queryFn: ({ pageParam }: { pageParam?: string }) => getPostsFeedPaginatedFn(pageParam),
    getNextPageParam: (lastPage: PostsPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

export const getPostsListOptions = () =>
  queryOptions({
    queryKey: queryKeys.post.list(),
    queryFn: () => getPostsListFn(),
  });

// Function to fetch posts feed with pagination
const getPostsFeedPaginatedFn = async (pageParam?: string): Promise<PostsPage> => {
  const limit = 20;
  let query = supabase
    .from('posts')
    .select('*')
    .eq('status', 'published') // Only show published posts
    .order('created_at', { ascending: false })
    .limit(limit);

  if (pageParam) {
    query = query.lt('created_at', pageParam);
  }

  const { data: postsData, error: postsError } = await query;

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`);
  }

  if (!postsData || postsData.length === 0) {
    return {
      data: [],
      nextCursor: null,
    };
  }

  // Get unique user IDs
  const userIds = [...new Set(postsData.map(post => post.created_by))];
  const postIds = postsData.map(post => post.id);

  // Fetch user data for all posts
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .in('id', userIds);

  if (usersError) {
    console.warn('Failed to fetch user data:', usersError);
  }

  // Fetch likes count for all posts
  const { data: likesData, error: likesError } = await supabase
    .from('likes')
    .select('post_id, user_id')
    .in('post_id', postIds);

  if (likesError) {
    console.warn('Failed to fetch likes data:', likesError);
  }

  // Fetch comments count for all posts
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  if (commentsError) {
    console.warn('Failed to fetch comments data:', commentsError);
  }

  // Get current user for like status
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Create maps for easy lookup
  const usersMap = new Map();
  if (usersData) {
    usersData.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  const likesCountMap = new Map();
  const userLikesMap = new Map();

  if (likesData) {
    // Count likes per post
    likesData.forEach(like => {
      likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) || 0) + 1);
    });

    // Check if current user liked each post
    if (currentUser) {
      const userLikes = likesData.filter(like => like.user_id === currentUser.id);
      userLikes.forEach(like => {
        userLikesMap.set(like.post_id, true);
      });
    }
  }

  const commentsCountMap = new Map();
  if (commentsData) {
    // Count comments per post
    commentsData.forEach(comment => {
      commentsCountMap.set(comment.post_id, (commentsCountMap.get(comment.post_id) || 0) + 1);
    });
  }

  // Combine posts with user data, likes, and comments
  const postsWithUsers = postsData.map(post => ({
    ...post,
    likes_count: likesCountMap.get(post.id) || 0,
    comments_count: commentsCountMap.get(post.id) || 0,
    is_liked_by_user: userLikesMap.get(post.id) || false,
    user: usersMap.get(post.created_by) || {
      id: post.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  }));

  const nextCursor = postsData.length === limit ? postsData[postsData.length - 1].created_at : null;

  return {
    data: postsWithUsers as PostWithUser[],
    nextCursor,
  };
};

// Function to fetch all posts (for admin purposes)
const getPostsListFn = async (): Promise<PostWithUser[]> => {
  const { data: postsData, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (postsError) {
    throw new Error(`Failed to fetch posts: ${postsError.message}`);
  }

  if (!postsData || postsData.length === 0) {
    return [];
  }

  // Get unique user IDs
  const userIds = [...new Set(postsData.map(post => post.created_by))];
  const postIds = postsData.map(post => post.id);

  // Fetch user data for all posts
  const { data: usersData, error: usersError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .in('id', userIds);

  if (usersError) {
    console.warn('Failed to fetch user data:', usersError);
  }

  // Fetch likes count for all posts
  const { data: likesData, error: likesError } = await supabase
    .from('likes')
    .select('post_id, user_id')
    .in('post_id', postIds);

  if (likesError) {
    console.warn('Failed to fetch likes data:', likesError);
  }

  // Fetch comments count for all posts
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select('post_id')
    .in('post_id', postIds);

  if (commentsError) {
    console.warn('Failed to fetch comments data:', commentsError);
  }

  // Get current user for like status
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Create maps for easy lookup
  const usersMap = new Map();
  if (usersData) {
    usersData.forEach(user => {
      usersMap.set(user.id, user);
    });
  }

  const likesCountMap = new Map();
  const userLikesMap = new Map();

  if (likesData) {
    // Count likes per post
    likesData.forEach(like => {
      likesCountMap.set(like.post_id, (likesCountMap.get(like.post_id) || 0) + 1);
    });

    // Check if current user liked each post
    if (currentUser) {
      const userLikes = likesData.filter(like => like.user_id === currentUser.id);
      userLikes.forEach(like => {
        userLikesMap.set(like.post_id, true);
      });
    }
  }

  const commentsCountMap = new Map();
  if (commentsData) {
    // Count comments per post
    commentsData.forEach(comment => {
      commentsCountMap.set(comment.post_id, (commentsCountMap.get(comment.post_id) || 0) + 1);
    });
  }

  // Combine posts with user data, likes, and comments
  const postsWithUsers = postsData.map(post => ({
    ...post,
    likes_count: likesCountMap.get(post.id) || 0,
    comments_count: commentsCountMap.get(post.id) || 0,
    is_liked_by_user: userLikesMap.get(post.id) || false,
    user: usersMap.get(post.created_by) || {
      id: post.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  }));

  return postsWithUsers as PostWithUser[];
};

// Create a new post
export const createPost = async (postData: {
  content: string;
  media_urls?: string[];
  document_urls?: string[];
  youtube_url?: string;
  sponsored?: boolean;
}) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: postDataResult, error: postError } = await supabase
    .from('posts')
    .insert({
      ...postData,
      created_by: user.id,
      status: 'published', // Default to published
      sponsored: postData.sponsored || false,
    })
    .select('*')
    .single();

  if (postError) {
    throw new Error(`Failed to create post: ${postError.message}`);
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
    ...postDataResult,
    user: userData || {
      id: user.id,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  } as PostWithUser;
};

// Update a post
export const updatePost = async (postId: string, updates: Partial<Post>) => {
  const { data: postDataResult, error: postError } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', postId)
    .select('*')
    .single();

  if (postError) {
    throw new Error(`Failed to update post: ${postError.message}`);
  }

  // Fetch user data
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .eq('id', postDataResult.created_by)
    .single();

  if (userError) {
    console.warn('Failed to fetch user data:', userError);
  }

  return {
    ...postDataResult,
    user: userData || {
      id: postDataResult.created_by,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  } as PostWithUser;
};

// Delete a post
export const deletePost = async (postId: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId);

  if (error) {
    throw new Error(`Failed to delete post: ${error.message}`);
  }
};

// Like/Unlike a post
export const togglePostLike = async (postId: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Check if user already liked the post
  const { data: existingLike, error: checkError } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Failed to check like status: ${checkError.message}`);
  }

  if (existingLike) {
    // Unlike the post
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) {
      throw new Error(`Failed to unlike post: ${deleteError.message}`);
    }

    return { liked: false };
  } else {
    // Like the post
    const { error: insertError } = await supabase
      .from('likes')
      .insert({
        post_id: postId,
        user_id: user.id,
      });

    if (insertError) {
      throw new Error(`Failed to like post: ${insertError.message}`);
    }

    return { liked: true };
  }
};

// Get like status for a post
export const getPostLikeStatus = async (postId: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { isLiked: false, likesCount: 0 };
  }

  // Get like count
  const { count: likesCount, error: countError } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId);

  if (countError) {
    throw new Error(`Failed to get likes count: ${countError.message}`);
  }

  // Check if current user liked the post
  const { data: userLike, error: likeError } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single();

  const isLiked = !likeError && !!userLike;

  return {
    isLiked,
    likesCount: likesCount || 0,
  };
};

// Add a comment to a post
export const addComment = async (postId: string, content: string) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data: commentData, error: commentError } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
    })
    .select('*')
    .single();

  if (commentError) {
    throw new Error(`Failed to add comment: ${commentError.message}`);
  }

  // Fetch user data for the comment
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, name, designation, company, profile_picture')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.warn('Failed to fetch user data for comment:', userError);
  }

  return {
    ...commentData,
    user: userData || {
      id: user.id,
      name: 'Unknown User',
      designation: null,
      company: null,
      profile_picture: null,
    },
  };
};

// Get comments for a post
export const getPostComments = async (postId: string) => {
  const { data: commentsData, error: commentsError } = await supabase
    .from('comments')
    .select(`
      *,
      user:users(id, name, designation, company, profile_picture)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (commentsError) {
    throw new Error(`Failed to fetch comments: ${commentsError.message}`);
  }

  return commentsData || [];
};
