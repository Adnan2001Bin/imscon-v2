import queryKeys from '../constants/queryKeys';
import { supabase } from '@/src/lib/supabase';
import { queryOptions, infiniteQueryOptions } from '@tanstack/react-query';
import type { User } from '@/src/types/user';

export type { User };

export const getUsersByCompanyOptions = (companyId: string) =>
  queryOptions({
    queryKey: [...queryKeys.user.list(), 'byCompany', companyId],
    queryFn: () => getUsersByCompanyFn(companyId),
  });

export type TUsersPage = {
  data: User[]
  nextCursor: string | null
}

export const getUsersInfiniteOptions = () =>
  infiniteQueryOptions({
    queryKey: queryKeys.user.list(),
    queryFn: ({ pageParam }: { pageParam?: string }) => getUsersPaginatedFn(pageParam),
    getNextPageParam: (lastPage: TUsersPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
  });

export const updateUserProfile = async (userId: string, data: Partial<User>) => {
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }
};

export const inviteTeamMember = async (data: {
  name: string;
  email: string;
  phone?: string;
  designation: string;
  company: string;
  company_id: string;
  linkedin?: string;
}) => {
  // First check if user already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('*')
    .eq('email', data.email)
    .maybeSingle();

  if (checkError) {
    throw new Error(`Database error: ${checkError.message}`);
  }

  if (existingUser) {
    throw new Error('User already invited');
  }

  // Invite user via edge function (sends email invitation like web app)
  const { data: authUser, error: inviteUserError } = await supabase.functions.invoke('invite-user', {
    body: { email: data.email },
  });

  if (inviteUserError) {
    throw new Error(`Failed to invite user: ${inviteUserError.message}`);
  }

  if (!authUser?.data?.user?.id) {
    throw new Error('Invalid response from invitation service');
  }

  // Create user record in database with all the provided data (like web app)
  const { error: createUserError } = await supabase
    .from('users')
    .insert({
      id: authUser.data.user.id,
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      designation: data.designation,
      company: data.company,
      company_id: data.company_id,
      linkedin: data.linkedin || null,
      is_primary: false,
      role: 'visitor',
      is_paid: false,
      status: 'invited', // Set as invited (not active) like web app
      profile_completed: false,
      company_profile_completed: false,
      industry: null,
      address: null,
      city: null,
      country: null,
      zip_code: null,
      about: null,
      profile_picture: null,
    });

  if (createUserError) {
    throw new Error(`Failed to create user: ${createUserError.message}`);
  }

  return authUser.data.user;
};

export const deleteUser = async (userId: string) => {
  // Attempt to delete the auth user first via edge function
  try {
    const { data: fnData, error: fnError } = await supabase.functions.invoke('delete-user', {
      body: { user_id: userId },
    });

    if (fnError) {
      throw new Error(fnError.message || 'Failed to delete auth user');
    }

    // Check if function returned an error
    if (fnData && (fnData as any).error) {
      throw new Error(((fnData as any).error && (fnData as any).error.message) || 'Auth deletion function returned an error');
    }
  } catch (err) {
    throw new Error((err as any)?.message ?? 'Failed to delete auth user');
  }

  // Delete user row from the database
  const { error: deleteUserError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId);

  if (deleteUserError) {
    throw new Error('Failed to delete user from database');
  }
};

const getUsersByCompanyFn = async (companyId: string) => {
  const { data: users, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('company_id', companyId);

  if (fetchError) {
    throw new Error('Failed to fetch company users');
  }

  return users as User[];
};

const getUsersPaginatedFn = async (pageParam?: string): Promise<TUsersPage> => {
  const limit = 10
  let query = supabase
    .from('users')
    .select('*')
    .order('name', { ascending: true })
    .limit(limit)

  if (pageParam) {
    query = query.gt('name', pageParam)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch users')
  }

  const nextCursor = data.length === limit ? data[data.length - 1].name : null

  return {
    data: data as User[],
    nextCursor,
  }
};

const getUsersByRolePaginatedFn = async (role: string, pageParam?: string): Promise<TUsersPage> => {
  const limit = 10
  let query = supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .order('name', { ascending: true })
    .limit(limit)

  if (pageParam) {
    query = query.gt('name', pageParam)
  }

  const { data, error } = await query

  if (error) {
    throw new Error('Failed to fetch users by role')
  }

  const nextCursor = data.length === limit ? data[data.length - 1].name : null

  return {
    data: data as User[],
    nextCursor,
  }
};

// Search users in database
const searchUsersFn = async (searchTerm: string): Promise<User[]> => {
  if (!searchTerm.trim()) {
    return []
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,designation.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,country.ilike.%${searchTerm}%`)
    .order('name', { ascending: true })
    .limit(20)

  if (error) {
    throw new Error('Failed to search users')
  }

  return data as User[]
}

export const getUsersByRoleInfiniteOptions = (role: string) =>
  infiniteQueryOptions({
    queryKey: [...queryKeys.user.list(), 'byRole', role],
    queryFn: ({ pageParam }: { pageParam?: string }) => getUsersByRolePaginatedFn(role, pageParam),
    getNextPageParam: (lastPage: TUsersPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    enabled: !!role && role !== 'all_roles',
  });

export const getSearchUsersOptions = (searchTerm: string) =>
  queryOptions({
    queryKey: queryKeys.user.search(searchTerm),
    queryFn: () => searchUsersFn(searchTerm),
    enabled: !!searchTerm.trim(),
  })
