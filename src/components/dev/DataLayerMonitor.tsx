
import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, Database, Activity, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react';

export const DataLayerMonitor = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const queryCache = queryClient.getQueryCache();
  const queries = queryCache.getAll();

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'loading':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'pending':
      case 'loading':
        return <Clock className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  // Calculate statistics
  const stats = {
    total: queries.length,
    loading: queries.filter(q => q.state.status === 'pending').length,
    error: queries.filter(q => q.state.status === 'error').length,
    success: queries.filter(q => q.state.status === 'success').length,
    stale: queries.filter(q => q.state.status === 'success' && q.isStale()).length,
  };

  const cacheSize = JSON.stringify(queryCache.getAll()).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Layer Monitor</h1>
          <p className="text-muted-foreground">Monitor and debug your application's data layer</p>
        </div>
        <Button 
          onClick={handleRefreshAll} 
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh All
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Cache size: {(cacheSize / 1024).toFixed(1)}KB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loading</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.loading}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.loading / stats.total) * 100).toFixed(1) : 0}% of queries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.error}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.error / stats.total) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stale Data</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.stale}</div>
            <p className="text-xs text-muted-foreground">
              Needs background refresh
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Query Information */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Queries ({stats.total})</TabsTrigger>
          <TabsTrigger value="loading">Loading ({stats.loading})</TabsTrigger>
          <TabsTrigger value="error">Errors ({stats.error})</TabsTrigger>
          <TabsTrigger value="stale">Stale ({stats.stale})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Query Details
              </CardTitle>
              <CardDescription>
                Detailed information about all queries in the cache
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-4">
                  {queries.map((query) => (
                    <div key={query.queryHash} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(query.state.status)}
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {JSON.stringify(query.queryKey)}
                          </code>
                        </div>
                        <Badge className={getStatusColor(query.state.status)}>
                          {query.state.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="font-medium">Last Updated:</span>
                          <br />
                          {query.state.dataUpdatedAt ? 
                            new Date(query.state.dataUpdatedAt).toLocaleTimeString() : 
                            'Never'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Observers:</span>
                          <br />
                          {query.getObserversCount()}
                        </div>
                        <div>
                          <span className="font-medium">Is Stale:</span>
                          <br />
                          {query.isStale() ? 'Yes' : 'No'}
                        </div>
                        <div>
                          <span className="font-medium">Error Count:</span>
                          <br />
                          {query.state.errorUpdateCount}
                        </div>
                      </div>

                      {query.state.error && (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <span className="text-sm text-red-800 font-medium">Error:</span>
                          <pre className="text-xs text-red-700 mt-1 whitespace-pre-wrap">
                            {query.state.error.message}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Similar structure for other tabs with filtered queries */}
        <TabsContent value="loading">
          <Card>
            <CardHeader>
              <CardTitle>Loading Queries</CardTitle>
              <CardDescription>Queries currently fetching data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                {queries.filter(q => q.state.status === 'pending').map((query) => (
                  <div key={query.queryHash} className="border rounded-lg p-4 mb-2">
                    <code className="text-sm">{JSON.stringify(query.queryKey)}</code>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="error">
          <Card>
            <CardHeader>
              <CardTitle>Failed Queries</CardTitle>
              <CardDescription>Queries that encountered errors</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                {queries.filter(q => q.state.status === 'error').map((query) => (
                  <div key={query.queryHash} className="border rounded-lg p-4 mb-2 border-red-200 bg-red-50">
                    <code className="text-sm">{JSON.stringify(query.queryKey)}</code>
                    {query.state.error && (
                      <pre className="text-xs text-red-700 mt-2 whitespace-pre-wrap">
                        {query.state.error.message}
                      </pre>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stale">
          <Card>
            <CardHeader>
              <CardTitle>Stale Queries</CardTitle>
              <CardDescription>Queries with outdated data</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                {queries.filter(q => q.state.status === 'success' && q.isStale()).map((query) => (
                  <div key={query.queryHash} className="border rounded-lg p-4 mb-2 border-yellow-200 bg-yellow-50">
                    <code className="text-sm">{JSON.stringify(query.queryKey)}</code>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
