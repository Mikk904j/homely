
import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";

// Create a centralized error handler for queries
const handleQueryError = (error: unknown, query: any) => {
  console.error("Query error:", error, "Query:", query.queryKey);
  
  // Don't show toast for certain query keys that handle their own errors
  const silentQueries = ['dashboardStats', 'recentActivity'];
  const queryKey = query.queryKey?.[0];
  
  if (!silentQueries.includes(queryKey)) {
    toast.error("Data Loading Error", {
      description: error instanceof Error ? error.message : "Failed to load data",
    });
  }
};

// Create a centralized error handler for mutations
const handleMutationError = (error: unknown, variables: any, context: any, mutation: any) => {
  console.error("Mutation error:", error, "Variables:", variables);
  
  toast.error("Operation Failed", {
    description: error instanceof Error ? error.message : "An unexpected error occurred",
  });
};

// Enhanced query client with optimized defaults
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryError,
  }),
  mutationCache: new MutationCache({
    onError: handleMutationError,
  }),
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache after components unmount
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) return false;
        
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetch settings
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode
      networkMode: 'online',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Network mode for mutations
      networkMode: 'online',
    },
  },
});

// Query key factory for consistent key management
export const queryKeys = {
  // Dashboard
  dashboard: {
    stats: ['dashboardStats'] as const,
    activity: ['recentActivity'] as const,
  },
  
  // Household
  household: {
    current: ['household', 'current'] as const,
    members: (householdId: string) => ['household', householdId, 'members'] as const,
    status: ['household', 'status'] as const,
  },
  
  // Tickets
  tickets: {
    all: ['tickets'] as const,
    byId: (id: string) => ['tickets', id] as const,
    byStatus: (status: string) => ['tickets', 'status', status] as const,
    comments: (ticketId: string) => ['tickets', ticketId, 'comments'] as const,
  },
  
  // Shopping
  shopping: {
    lists: ['shopping', 'lists'] as const,
    listById: (id: string) => ['shopping', 'lists', id] as const,
    items: (listId: string) => ['shopping', 'lists', listId, 'items'] as const,
  },
  
  // Members
  members: {
    all: ['members'] as const,
    byId: (id: string) => ['members', id] as const,
    profile: (userId: string) => ['members', 'profile', userId] as const,
  },
  
  // Calendar
  calendar: {
    events: ['calendar', 'events'] as const,
    eventById: (id: string) => ['calendar', 'events', id] as const,
    eventsByDate: (date: string) => ['calendar', 'events', 'date', date] as const,
  },
} as const;

// Prefetch utilities
export const prefetchQueries = {
  dashboard: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats,
      staleTime: 2 * 60 * 1000, // 2 minutes for dashboard data
    });
    
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.activity,
      staleTime: 1 * 60 * 1000, // 1 minute for activity data
    });
  },
};

// Cache invalidation utilities
export const invalidateQueries = {
  dashboard: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.activity });
  },
  
  household: () => {
    queryClient.invalidateQueries({ queryKey: ['household'] });
  },
  
  tickets: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
  },
  
  shopping: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.shopping.lists });
  },
  
  members: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.members.all });
  },
  
  calendar: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.calendar.events });
  },
};
