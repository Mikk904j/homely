
import { useQuery } from "@tanstack/react-query";
import { useEffect, useCallback } from "react";
import { dashboardService } from "@/services/data/dashboard-service";
import { queryKeys, invalidateQueries } from "@/lib/query-client";
import { DashboardStats, RecentActivity } from "./use-dashboard-data";

export const useEnhancedDashboardData = () => {
  // Enhanced stats query with optimized caching
  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.getDashboardStats(),
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard data should be relatively fresh
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
    refetchOnWindowFocus: true,
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });

  // Enhanced activity query with optimized caching
  const {
    data: recentActivity,
    isLoading: activityLoading,
    error: activityError,
    refetch: refetchActivity
  } = useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: () => dashboardService.getRecentActivity(),
    staleTime: 1 * 60 * 1000, // 1 minute - activity should be more fresh
    gcTime: 3 * 60 * 1000, // 3 minutes cache time
    refetchOnWindowFocus: true,
    refetchInterval: 2 * 60 * 1000, // Auto-refetch every 2 minutes
  });

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribe = dashboardService.subscribeToUpdates(() => {
      // Invalidate queries when real-time updates occur
      invalidateQueries.dashboard();
    });

    return unsubscribe;
  }, []);

  // Manual refresh function
  const refreshDashboard = useCallback(async () => {
    await Promise.all([refetchStats(), refetchActivity()]);
  }, [refetchStats, refetchActivity]);

  // Performance metrics
  const metrics = {
    totalQueries: 2,
    loadingQueries: Number(statsLoading) + Number(activityLoading),
    errorQueries: Number(!!statsError) + Number(!!activityError),
    cacheHitRate: stats && recentActivity ? 1 : 0,
  };

  return {
    // Data
    stats: stats || {
      highPriorityTickets: 0,
      inProgressTickets: 0,
      completedTickets: 0,
      totalTickets: 0,
      activeShoppingLists: 0,
      totalMembers: 0,
      upcomingEvents: 0,
    },
    recentActivity: recentActivity || [],
    
    // Loading states
    isLoading: statsLoading || activityLoading,
    statsLoading,
    activityLoading,
    
    // Error states
    isError: !!statsError || !!activityError,
    error: statsError || activityError,
    statsError,
    activityError,
    
    // Actions
    refreshDashboard,
    refetchStats,
    refetchActivity,
    
    // Metrics for monitoring
    metrics,
  };
};

// Hook for dashboard performance monitoring
export const useDashboardMetrics = () => {
  const { metrics } = useEnhancedDashboardData();
  
  useEffect(() => {
    // Log performance metrics for monitoring
    console.log('Dashboard Metrics:', {
      timestamp: new Date().toISOString(),
      ...metrics,
    });
  }, [metrics]);
  
  return metrics;
};

// Hook for dashboard health check
export const useDashboardHealth = () => {
  const { isError, error, metrics } = useEnhancedDashboardData();
  
  const health = {
    status: isError ? 'unhealthy' : 'healthy',
    error: error?.message,
    performance: {
      score: Math.max(0, 100 - (metrics.errorQueries * 50) - (metrics.loadingQueries * 25)),
      cacheEfficiency: metrics.cacheHitRate * 100,
    },
    recommendations: [] as string[],
  };
  
  // Add recommendations based on health
  if (metrics.errorQueries > 0) {
    health.recommendations.push('Check network connection and API availability');
  }
  
  if (metrics.cacheHitRate < 0.8) {
    health.recommendations.push('Consider adjusting cache configuration for better performance');
  }
  
  return health;
};
