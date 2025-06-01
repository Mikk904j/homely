
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardHealth } from "@/hooks/use-enhanced-dashboard-data";
import { Activity, Database, Zap, RefreshCw } from "lucide-react";

interface QueryMetrics {
  queryKey: string;
  status: 'fresh' | 'stale' | 'loading' | 'error';
  fetchStatus: string;
  dataUpdatedAt: number;
  errorCount: number;
}

export function DataLayerMonitor() {
  const queryClient = useQueryClient();
  const dashboardHealth = useDashboardHealth();
  const [queries, setQueries] = useState<QueryMetrics[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      const cache = queryClient.getQueryCache();
      const queriesData = cache.getAll().map(query => ({
        queryKey: JSON.stringify(query.queryKey),
        status: query.state.status as any,
        fetchStatus: query.state.fetchStatus,
        dataUpdatedAt: query.state.dataUpdatedAt,
        errorCount: query.state.errorUpdateCount,
      }));
      
      setQueries(queriesData);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [queryClient]);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50"
      >
        <Database className="h-4 w-4 mr-2" />
        Data Monitor
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 max-h-96 overflow-auto z-50 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <span className="font-semibold text-sm">Data Layer Monitor</span>
        </div>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
        >
          ×
        </Button>
      </div>

      {/* Dashboard Health */}
      <div className="mb-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium">Dashboard Health</span>
          <Badge variant={dashboardHealth.status === 'healthy' ? 'default' : 'destructive'}>
            {dashboardHealth.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          Performance: {dashboardHealth.performance.score}/100
        </div>
        <div className="text-xs text-muted-foreground">
          Cache: {dashboardHealth.performance.cacheEfficiency.toFixed(1)}%
        </div>
      </div>

      {/* Active Queries */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium">
          <Zap className="h-3 w-3" />
          Active Queries ({queries.length})
        </div>
        
        {queries.map((query, index) => (
          <div key={index} className="text-xs border rounded p-2">
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono text-xs truncate">
                {query.queryKey.length > 30 
                  ? `${query.queryKey.slice(0, 30)}...` 
                  : query.queryKey
                }
              </span>
              <Badge 
                variant={
                  query.status === 'success' ? 'default' :
                  query.status === 'loading' ? 'secondary' :
                  query.status === 'error' ? 'destructive' : 'outline'
                }
                className="text-xs"
              >
                {query.status}
              </Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Updated: {new Date(query.dataUpdatedAt).toLocaleTimeString()}
            </div>
            {query.errorCount > 0 && (
              <div className="text-xs text-red-500">
                Errors: {query.errorCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 flex gap-2">
        <Button
          onClick={() => queryClient.invalidateQueries()}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh All
        </Button>
        <Button
          onClick={() => queryClient.clear()}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          Clear Cache
        </Button>
      </div>
    </Card>
  );
}
