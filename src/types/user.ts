/**
 * User Types
 */

export interface User {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    role: 'attendee' | 'exhibitor' | 'organizer' | 'admin' | 'participant' | 'visitor';
    company?: string;
    position?: string;
    bio?: string;
    createdAt?: string;
    updatedAt?: string;
    // Profile completion fields
    name?: string;
    designation?: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    linkedin?: string;
    profile_picture?: string;
    is_primary?: boolean;
    profile_completed?: boolean;
    company_profile_completed?: boolean;
    company_id?: string;
    industry?: string;
    zip_code?: string;
    about?: string;
    is_paid?: boolean;
    status?: string;
  }
  
  export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    company?: string;
    position?: string;
  }
  