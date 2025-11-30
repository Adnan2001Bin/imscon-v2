import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import queryKeys from '../components/constants/queryKeys'

export const useAuth = () => {
  return useQuery({
    queryKey: queryKeys.user.currentUser(),
    queryFn: async () => {
      const { data, error: getSessionError } = await supabase.auth.getSession()

      if (getSessionError) {
        console.error('Failed to get session:', getSessionError)
        return null
      }

      if (!data.session) {
        return null
      }

      const { data: currentUser, error: fetchError } = await supabase
        .from('users')
        .select(`
          *,
          profile_completed,
          company_profile_completed,
          company_id,
          name,
          designation,
          phone,
          address,
          city,
          country,
          linkedin,
          industry,
          role,
          profile_picture,
          email,
          about
        `)
        .eq('email', data.session.user.email)
        .single()

      if (fetchError) {
        console.error('Failed to fetch current user:', fetchError)
        // Don't throw error, just return null to indicate no authenticated user
        return null
      }

      return {
        currentUser,
        session: data.session,
      }
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}


