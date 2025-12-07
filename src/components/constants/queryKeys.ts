export const k = {
    user: {
      root: () => ['user'] as const,
      session: () => [...k.user.root(), 'auth', 'session'] as const,
      currentUser: () => [...k.user.root(), 'auth', 'currentUser'] as const,
      list: () => [...k.user.root(), 'list'] as const,
      search: (searchTerm: string) =>
        [...k.user.root(), 'search', searchTerm] as const,
    },
  
    company: {
      root: () => ['company'] as const,
      list: () => [...k.company.root(), 'list'] as const,
      single: (companyId: string) =>
        [...k.company.root(), 'single', companyId] as const,
      search: (searchTerm: string) =>
        [...k.company.root(), 'search', searchTerm] as const,
      halls: () => [...k.company.root(), 'halls'] as const,
      industries: () => [...k.company.root(), 'industries'] as const,
      filtered: (hallFilter?: string, industryFilter?: string, searchTerm?: string) =>
        [...k.company.root(), 'filtered', hallFilter || 'all', industryFilter || 'all', searchTerm || ''] as const,
    },
  
    agenda: {
      root: () => ['agenda'] as const,
      sessions: () => [...k.agenda.root(), 'sessions'] as const,
      sessionsByDate: (date: string) => [...k.agenda.root(), 'sessions', 'date', date] as const,
      reminders: () => [...k.agenda.root(), 'reminders'] as const,
    },
  
    floorMap: {
      root: () => ['floorMap'] as const,
      list: () => [...k.floorMap.root(), 'list'] as const,
    },

    notification: {
      root: () => ['notification'] as const,
      list: () => [...k.notification.root(), 'list'] as const,
    },

    post: {
      root: () => ['post'] as const,
      list: () => [...k.post.root(), 'list'] as const,
      feed: () => [...k.post.root(), 'feed'] as const,
    },

    event: {
      root: () => ['event'] as const,
      list: () => [...k.event.root(), 'list'] as const,
      feed: () => [...k.event.root(), 'feed'] as const,
      single: (eventId: string) => [...k.event.root(), 'single', eventId] as const,
      agendaSessions: (eventId: string) => [...k.event.root(), 'agenda', eventId] as const,
    },

    advertisement: {
      root: () => ['advertisement'] as const,
      list: () => [...k.advertisement.root(), 'list'] as const,
      active: () => [...k.advertisement.root(), 'active'] as const,
    },
  } as const
  
  const queryKeys = k
  
  export default queryKeys
  